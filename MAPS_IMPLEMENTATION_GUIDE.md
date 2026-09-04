# WAHAP Maps Implementation - Complete Overview

## 🗺️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN FLOW                               │
├─────────────────────────────────────────────────────────────┤
│ 1. Create Event → 2. Edit Map → 3. Add Stalls             │
│    (AdminCreateEvent)  (AdminMapeditor)  (Place Markers)   │
└────────────────┬────────────────────────────────────┬───────┘
                 │                                    │
                 └────────────────┬───────────────────┘
                                  │
                    POST /api/stalls/add (Save to DB)
                                  │
                 ┌────────────────▼───────────────────┐
                 │   MongoDB - Stall Collection      │
                 │ {eventId, name, type, x, y}      │
                 └────────────────┬───────────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
           (Public Link/QR)                  (Event Published)
                │                                   │
    ┌───────────▼────────────┐        ┌──────────────▼──────────┐
    │   USER FLOW - MAP      │        │  EVENT DETAILS PAGE    │
    │   (EventMap.jsx)       │        │  (Eventdetails.jsx)    │
    │   (VenueMap.jsx)       │        │  - Carousel            │
    └───────────┬────────────┘        │  - QR Code             │
                │                      │  - Embedded Map        │
         GET /api/stalls/:eventId     └──────────┬─────────────┘
                │                                 │
         ┌──────▼──────────────────────────────────┘
         │
    RENDER MAP WITH STALLS
         │
    Marker Click → Show Popup → Feedback Section
         │
    3 INTERACTIONS:
    ├─ 🚩 SET START (Start Navigation)
    ├─ 🧭 ROUTE (Set Destination)
    └─ 💬 FEEDBACK (Record Visit + Feedback)
         │
    POST /api/visits/record
         │
    ┌────▼────────────────────┐
    │ MongoDB - Visit         │
    │ Collection              │
    │ {username, stallId,     │
    │  eventId, feedback,     │
    │  rating, createdAt}     │
    └─────────────────────────┘
         │
    Admin Dashboard Polls
    GET /api/visits/stall/:stallId
         │
    Display All Reviews
```

---

## 🛍️ STALL PLACEMENT SYSTEM

### Where Stalls Live
**Database:** `Stall` collection (MongoDB via Mongoose)

```javascript
{
  _id: ObjectId,
  eventId: ObjectId (reference to Event),
  name: String,              // e.g., "Nike Booth", "Food Court"
  type: String,              // enum: stall, stage, restroom, food, entry, exit, help
  x: Number,                 // X coordinate (0-100)
  y: Number,                 // Y coordinate (0-100)
  createdAt: Date            // Timestamp
}
```

### Coordinate System Explained

**Map Space vs Leaflet Space:**
```
Physical Map:        Leaflet Coordinate System:
100 ──────────         (0,100) ──────── (100,100)
  │          │              │              │
  │    ●     │              │      ●       │
  │          │              │              │
  └──────────              │              │
  (0,0)                (0,0) ────────── (100,0)

Conversion Formula:
leafletLat = 100 - y
leafletLng = x

Example: Stall at (25, 40)
→ Leaflet Position: [100-40, 25] = [60, 25]
```

**Snap Grid (Smart Placement):**
```
x-coordinates: [12.5, 37.5, 62.5, 87.5]
y-coordinates: [12.5, 37.5, 62.5, 87.5]

These align with corridor centers!
  ┌──────┬──────┬──────┬──────┐
  │  ●   │      │      │      │  12.5
  ├──────┼──────┼──────┼──────┤
  │      │      │  ◆   │      │  37.5
  ├──────┼──────┼──────┼──────┤
  │      │      │      │  ★   │  62.5
  ├──────┼──────┼──────┼──────┤
  │      │  ✦   │      │      │  87.5
  └──────┴──────┴──────┴──────┘
```

---

### Admin Stall Placement Flow

#### Step 1: Open Map Editor
**File:** `AdminMapeditor.js`
```
Admin clicks "Edit Map" on event
           ↓
/admin/edit/:eventId?layout=true
           ↓
Leaflet Map with SVG background loads
```

#### Step 2: Click on Map
**Component:** `MapClickHandler` (React-Leaflet)
```javascript
useMapEvents({
  click(e) {
    // e.latlng = Leaflet coordinates
    const rawX = 100 - e.latlng.lng  // Convert back to map space
    const rawY = 100 - e.latlng.lat
    
    // Snap to nearest corridor
    const snap = (v) => [12.5, 37.5, 62.5, 87.5]
      .reduce((p, c) => Math.abs(c-v) < Math.abs(p-v) ? c : p)
    
    return { x: snap(rawX), y: snap(rawY) }
  }
})
```

#### Step 3: Add Stall Details
**UI Form in AdminMapeditor:**
```
┌──────────────────────────────────┐
│  Stall Name: [Nike Booth______]  │
│  Type: [Dropdown ↓]              │
│    - stall                       │
│    - stage                       │
│    - restroom                    │
│    - food                        │
│    - entry/exit/help             │
│  Position: X: 25.0 Y: 40.0       │
│                                  │
│  [✔ Add Stall]                   │
└──────────────────────────────────┘
```

#### Step 4: Save to Database
```javascript
POST /api/stalls/add
Body: {
  eventId: "event123",
  name: "Nike Booth",
  type: "stall",
  x: 25.0,
  y: 40.0
}
     ↓
stallController.addStall()
     ↓
new Stall({ eventId, name, type, x, y }).save()
     ↓
DB: Stall document created with _id
     ↓
Response: { success: true, stall: {...} }
     ↓
Frontend: setStalls([...prev, newStall])
     ↓
Map Updates with New Marker
```

#### New Marker Rendered With:
- **Icon**: Emoji based on type (🛍️, 🎤, 🚻, 🍔, 🚪, 🏁, 🧭)
- **Color**: Type-specific background (#ffffff, #FFEAA7, #55EFC4, etc.)
- **Label**: Stall name in a colored badge
- **Position**: [100-y, x] in Leaflet coordinates
- **3D Effect**: CSS isometric building with roof, front face, side face

---

## 💬 FEEDBACK SYSTEM (On the Map)

### How Feedback Works

#### User View Feedback
```
User clicks Marker on Map
           ↓
Marker Popup Opens
           ↓
Shows:
┌─────────────────────────────────┐
│  🛍️  Nike Booth                 │
│  Stall                          │
│  ✔ Done (if visited)            │
├─────────────────────────────────┤
│  [🚩 Start]  [🧭 Route]         │
├─────────────────────────────────┤
│  💬 Reviews:                    │
│  ┌─────────────────────────────┐│
│  │ John: Great store!          ││
│  │ Sarah: Amazing deals        ││
│  │ Mike: Worth visiting        ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│  [Share your experience...]     │
│  [✔ Mark Visited]               │
└─────────────────────────────────┘
```

#### Mechanism
```javascript
// Click marker
eventHandlers={{ click: () => fetchFeedback(s._id) }}
           ↓
// Get all feedback for this stall
GET /api/visits/feedback/:stallId
           ↓
// visitController.getStallFeedback()
Visit.find({ stallId }).sort({ createdAt: -1 })
           ↓
// Return latest feedback first
[
  { username: "John", feedback: "Great!", rating: 5 },
  { username: "Sarah", feedback: "Amazing!", rating: 5 }
]
           ↓
// Set state: setFeedbackList(data)
           ↓
// Re-render popup with reviews
```

---

### Submitting Feedback Flow

#### User Steps:
1. **Click Stall Marker**
2. **Type Feedback** in textarea ("Share your experience...")
3. **Click "Mark Visited"** button

#### Backend Processing:
```javascript
Button Click → handleVisit(stall)
           ↓
const username = localStorage.getItem("wahap_temp_user") || "Anonymous"
           ↓
if (!feedback.trim()) return alert("Please write feedback first!")
           ↓
POST /api/visits/record
Body: {
  username: "John",
  stallId: "stall123",
  eventId: "event456",
  feedback: "Great booth!"
}
           ↓
visitController.recordVisit()
           ↓
new Visit({
  username,
  stallId,
  eventId,
  feedback,
  rating: undefined  // Optional, can be added
}).save()
           ↓
Saved to MongoDB → Timestamp auto-set by Mongoose
           ↓
Response: { success: true, visit: {...} }
           ↓
Frontend Actions:
├─ Update visitedIds: [...visitedIds, stall._id]
├─ Save to localStorage: vm_visited_eventId
├─ Clear textarea: setFeedback("")
├─ Refresh feedback list: fetchFeedback(stall._id)
└─ Alert: "✅ Marked as visited!"
```

#### Result in Database (Visit Collection):
```javascript
{
  _id: ObjectId,
  username: "John",
  stallId: ObjectId("stall123"),
  eventId: ObjectId("event456"),
  feedback: "Great booth! Very helpful staff.",
  rating: undefined,
  createdAt: ISODate("2026-04-10T15:30:00Z")
}
```

---

## 🗺️ MAP LAYERS & RENDERING

### 1. Background SVG Layer

**What:** Procedurally generated venue floor plan
**Code Location:** `BG_SVG` function in VenueMap.jsx & AdminMapeditor.js

```javascript
BG_SVG = (() => {
  // Canvas size
  const W = 800, H = 800, rw = 32; // rw = row width (corridor size)
  
  // Snap points (dividing lines)
  const xs = [0, 200, 400, 600, 800]
  
  // Creates:
  // 1. Main background (reddish-brown)
  // 2. Ground patches (darker brown squares in grid)
  // 3. Horizontal & vertical corridors (red paths)
  // 4. Decorative trees (pseudo-random placement)
})()
```

**Visual Breakdown:**
```
┌─────────────────────────────────┐
│ ╔════════╗ ╔════════╗          │
│ ║ Stall  ║ ║ Stall  ║  🌳      │
│ ╚════════╝ ╚════════╝          │
│     (corridor: red path)        │
│ ╔════════╗ ╔════════╗          │
│ ║ Stage  ║ ║ Food   ║  🌳      │
│ ╚════════╝ ╚════════╝          │
│     (corridor: red path)        │
│ ╔════════╗ ╔════════╗          │
│ ║  Help  ║ ║Restoom║  🌳      │
│ ╚════════╝ ╚════════╝          │
└─────────────────────────────────┘

Colors:
- Background: #E35D50 (light red-brown)
- Patches: #DC5548 (darker red-brown)
- Corridors: #F07164 (bright red)
- Trees: #B34237 (dark brown)
```

### 2. Stall Markers Layer

**Marker Component:**
```
       Stall Name
      ┌─────────────┐
      │ Nike Booth  │
      └──────┬──────┘
             │
        ┌────▼────┐    ← 3D Isometric Building
        │  🛍️     │       - Roof (emoji + color)
        │ ▌▌▌▌▌▌  │       - Front face (color)
        └────┬──────┘       - Side face (color)
             │
          Marker Click → Popup Opens
```

**Icon Creation:**
```javascript
makeIcon(stall, visited, active) {
  const c = cfg(stall.type);  // Get type config
  
  return L.divIcon({
    html: `
      <div class="vm-marker-wrap ${active ? 'vm-active' : ''}">
        <div class="vm-room-label">
          ${stall.name}
          ${visited ? '<span>✔</span>' : ""}
        </div>
        <div class="vm-iso-building">
          <div class="vm-iso-roof" style="--bg:${c.color}">
            <span>${c.icon}</span>
          </div>
          <div class="vm-iso-face-front"></div>
          <div class="vm-iso-face-side"></div>
        </div>
      </div>
    `,
    iconSize: [80, 80],
    iconAnchor: [40, 60],  // Bottom center of icon
    popupAnchor: [0, -70]  // Popup above marker
  });
}
```

### 3. Navigation Routes Layer

**Route Display Types:**

**A) Faint Background Routes (All Possible Paths)**
```javascript
// Show paths from START to every other stall
allPaths.map(route => (
  <Polyline 
    positions={route.pts}
    pathOptions={{
      color: '#ffffff',
      weight: 3,
      opacity: 0.35,  // Faint
      dashArray: '4 8',  // Dashed
      lineCap: 'round'
    }}
  />
))
```

**B) Active Route (User's Selected Destination)**
```javascript
// Show highlighted route from START to END
<Polyline positions={activeRoute} pathOptions={{
  color: '#ffffff',
  weight: 6,
  opacity: 0.95,  // Bright
  lineCap: 'round'
}} />

// With glow effect
<Polyline positions={activeRoute} pathOptions={{
  color: '#FFD600',
  weight: 16,
  opacity: 0.12  // Glow
}} />

// With animated dashes
<Polyline positions={activeRoute} pathOptions={{
  color: '#333333',
  weight: 2,
  opacity: 0.7,
  dashArray: '4 12'  // Moving dots effect
}} />
```

### Route Calculation Algorithm

```javascript
function buildRoutes(from, to) {
  // Corridor snap points (100-unit map space)
  const snap = [12.5, 37.5, 62.5, 87.5];
  
  // Find nearest corridor to use as pivot
  const near = (v) => snap.reduce((p, c) => 
    Math.abs(c-v) < Math.abs(p-v) ? c : p);
  
  const midX = near((from.x + to.x) / 2);
  const midY = near((from.y + to.y) / 2);
  
  // Route 1: Go horizontal first, then vertical
  // [Start] → [Turn Right] → [Turn Up/Down] → [End]
  const p1 = [
    [100 - from.y, from.x],
    [100 - from.y, midX],      // Horizontal
    [100 - to.y,   midX],      // Vertical
    [100 - to.y,   to.x]       // Final
  ];
  
  // Route 2: Go vertical first, then horizontal
  const p2 = [
    [100 - from.y, from.x],
    [100 - midY,   from.x],    // Vertical
    [100 - midY,   to.x],      // Horizontal
    [100 - to.y,   to.x]       // Final
  ];
  
  // Show both routes if difference is significant
  const diffX = Math.abs(from.x - to.x);
  const diffY = Math.abs(from.y - to.y);
  return (diffX > 1 && diffY > 1) ? [p1, p2] : [p1];
}
```

---

## 📊 VISITED TRACKING

### How System Knows Which Stalls Are Visited

**Storage:** `localStorage` (Client-side)
- **Key:** `vm_visited_${eventId}`
- **Value:** JSON array of stallIds

```javascript
// Initialize on load
const [visitedIds, setVisitedIds] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("vm_visited_" + eventId) || "[]");
  } catch {
    return [];
  }
});

// When user marks stall as visited
const updated = [...new Set([...visitedIds, stall._id])];
setVisitedIds(updated);
localStorage.setItem("vm_visited_" + eventId, JSON.stringify(updated));
```

**Visual Indicators:**
```
✔ Badge on marker label when visited
✔ Checkmark on popup ("✔ Done")
🚀 Progress bar: "Explored: 3 / 10 stalls"
```

---

## 🎯 USER INTERACTION FLOW

### Scenario: User Visits Event

```
1. SCAN QR CODE
   └─→ QR Scanner (qrcode.react)
       └─→ Extracts eventId
           └─→ Navigate to /event/:eventId

2. VIEW EVENT DETAILS
   └─→ Eventdetails.jsx
       ├─→ Show carousel with event images
       ├─→ Display QR Code option
       └─→ Embedded VenueMap component
           (See map preview before exploring)

3. FULL MAP EXPLORATION
   └─→ Click "Full Map" or navigate to /event/:eventId/map
       └─→ EventMap.jsx
           └─→ Full-screen VenueMap

4. INTERACT WITH STALLS
   └─→ User clicks on stall marker
       └─→ Popup shows:
           ├─ Stall info (name, type, emoji)
           ├─ All reviews (fetched with GET /api/visits/feedback/:stallId)
           ├─ [🚩 Start] button → Set route start
           ├─ [🧭 Route] button → Set destination + show path
           └─ [Mark Visited] button + textarea for feedback

5. SUBMIT FEEDBACK
   └─→ Type feedback + click "Mark Visited"
       └─→ POST /api/visits/record
           ├─→ Save to MongoDB
           ├─→ Update visited list
           ├─→ Refresh feedback display
           └─→ Show "✔ Marked as visited" confirmation

6. ADMIN ANALYTICS
   └─→ Admin dashboard polls GET /api/visits/stall/:stallId
       └─→ Displays all visitor feedback in real-time
```

---

## 🔄 Complete Data Flow Diagram

```
┌──────────────────────┐
│   ADMIN CREATES      │
│   EVENT + LAYOUT     │
└──────────┬───────────┘
           │
           ├─→ AdminCreateEvent.jsx
           │   └─→ POST /api/events
           │
           ├─→ AdminMapeditor.js
           │   └─→ Redirect to map editor
           │
    ┌──────▼──────────┐
    │  ADMIN PLACES   │
    │  STALLS         │
    └──────┬──────────┘
           │
           ├─→ Click map location
           ├─→ Enter stall name & type
           └─→ POST /api/stalls/add
                 │
           ┌─────▼──────────────────┐
           │  STALL SAVED TO DB     │
           │  {name, type, x, y}    │
           └─────┬──────────────────┘
                 │
                 │ Share event link or QR
                 │
           ┌─────▼──────────────────┐
           │  USER SCANS QR         │
           │  or opens event link   │
           └─────┬──────────────────┘
                 │
           ┌─────▼────────────────────────────┐
           │  GET /api/events/:eventId        │
           │  GET /api/stalls/:eventId        │
           │  Render VenueMap.jsx             │
           └─────┬────────────────────────────┘
                 │
            STALLS DISPLAYED ON MAP
                 │
           ┌─────▼──────────────────┐
           │  USER CLICKS STALL     │
           └─────┬──────────────────┘
                 │
           ┌─────▼──────────────────────────┐
           │  GET /api/visits/feedback/:stallId
           │  Fetch existing reviews        │
           └─────┬──────────────────────────┘
                 │
            POPUP SHOWS FEEDBACK
                 │
           ┌─────▼──────────────────┐
           │  USER TYPES FEEDBACK   │
           │  + CLICKS MARK VISITED │
           └─────┬──────────────────┘
                 │
           ┌─────▼──────────────────────────┐
           │  POST /api/visits/record       │
           │  {username, stallId, feedback} │
           └─────┬──────────────────────────┘
                 │
           ┌─────▼────────────────────────┐
           │  SAVED TO Visit COLLECTION   │
           │  Timestamp auto-set          │
           └─────┬────────────────────────┘
                 │
         Frontend Updates UI:
         ├─ Add to visitedIds
         ├─ Save to localStorage
         ├─ Clear textarea
         └─ Refresh feedback list
                 │
           ┌─────▼──────────────────┐
           │  USER SEES NEW REVIEW  │
           │  in popup              │
           └──────────────────────────┘
```

---

## 🎨 CSS/Styling for Map Components

### Key CSS Classes

1. **vm-marker-wrap** - Main marker container
   - Active state: highlight border
   - Visited badge: checkmark

2. **vm-iso-building** - 3D isometric effect
   - vm-iso-roof: Top (with emoji)
   - vm-iso-face-front: Front side
   - vm-iso-face-side: Right side

3. **vm-popup** - Popup container
   - vm-popup-header: Title section
   - vm-feedback-list: Reviews section
   - vm-visit-form: Feedback submission

4. **vm-progress-bar** - Navigation progress
   - Shows: "Explored: 3/10"
   - Visual fill bar

5. **vm-legend** - Map legend
   - Shows all stall types with colors
   - Toggle buttons

---

## 📱 Responsive Behavior

```javascript
// Mobile (window.innerWidth < 768)
padding: [60, 60]           // Smaller padding
scrollWheelZoom: false      // Disable scroll zoom
autoPanPadding: [20, 100]   // Smaller pan area

// Desktop
padding: [150, 150]         // Larger padding
Full zoom controls available
```

---

## 🚨 Error Handling

**Stall Placement:**
- Validates stall name not empty
- Clamps coordinates to 0-100 range
- Snaps to nearest corridor point

**Feedback Submission:**
- Checks feedback not empty
- Validates stall exists
- Auto-sets username from localStorage

**API Calls:**
- Try-catch blocks on all axios calls
- Console error logging for debugging
- User-friendly alert messages

---

## Summary Table

| Component | File | Responsibility |
|-----------|------|---|
| **Admin Map Editor** | AdminMapeditor.js | Place/delete stalls, save to DB |
| **User Map View** | VenueMap.jsx | Display stalls, show feedback, record visits |
| **Route Calculator** | buildRoutes() | Calculate L-shaped paths |
| **Marker Renderer** | makeIcon() | Create 3D isometric marker icons |
| **Feedback Display** | vm-popup | Show reviews, input feedback form |
| **Storage** | localStorage + MongoDB | Track visited & persist feedback |
| **Coordinate System** | 100x100 grid | Map space with corridor snapping |

---

## Key Features Enabled

✅ **Drag stalls on map** - Click to place precisely  
✅ **7 stall types** - Each with emoji & unique color  
✅ **Smart routing** - 2 alternate L-shaped paths  
✅ **Real-time feedback** - Immediately visible in popups  
✅ **Visit tracking** - localStorage + progress bar  
✅ **Admin analytics** - View all feedback per stall  
✅ **Responsive design** - Works on mobile & desktop  
✅ **No dependencies** - Uses Leaflet only, no API keys  

