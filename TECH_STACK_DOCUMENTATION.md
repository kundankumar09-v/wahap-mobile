# WAHAP - Complete Tech Stack Documentation

## 📋 Project Overview
**WAHAP** (Venue & Event Management System) is a full-stack web application for managing events, interactive venue maps, and attendee navigation with real-time feedback.

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                           │
│  Port 3000 | Single Page Application                            │
└─────────────┬───────────────────────────────────────────────────┘
              │ (REST API Calls via Axios)
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                   BACKEND (Node.js/Express)                    │
│  Port 5000 | RESTful API Server                                 │
└─────────────┬───────────────────────────────────────────────────┘
              │ (Mongoose ODM)
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                  DATABASE (MongoDB)                              │
│  NoSQL Document Store | Cloud or Local Instance                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 FRONTEND STACK (Client)

### Core Framework
- **React.js** `^19.2.4` - Modern UI library with functional components & hooks
- **React Router DOM** `^7.13.1` - Client-side routing for SPA navigation
- **Vite-optimized Build** - React Scripts `5.0.1` for development & production builds

### State Management & Data Fetching
- **Axios** `^1.13.6` - HTTP client for REST API communication (all backend requests)
- **localStorage** - Client-side caching for visited stalls, user data, session tokens
- **React Hooks** (useState, useEffect, useCallback, useRef) - State management

### Map Component (Venue/Interactive Map)
- **Leaflet.js** `^1.9.4` - Industry-standard mapping library
- **React-Leaflet** `^5.0.0` - React wrapper for Leaflet
- **Custom SVG Background** - Procedurally generated venue layout with corridors & decorative elements
  - 800x800px SVG base map
  - Four corridor snapping lines for route generation
  - L-shaped navigation path support (2 alternate routes displayed)

### QR Code Handling
**QR Scanner:**
- **jsQR** `^1.4.0` - JavaScript QR code decoder library
- **Canvas API** - Image processing from camera feed
- **Barcode Detection API** - Native browser QR detection (when available)
- **Media Devices API** - Camera access (with permission prompt)
- **File Upload Support** - Alternative QR code detection from uploaded images

**QR Generation:**
- **qrcode.react** `^4.2.0` - React component for generating QR codes for events

### Authentication
- **Google OAuth Integration** - `@react-oauth/google` `^0.13.4`
- **JWT Handling** - `jwt-decode` `^4.0.0` - Token parsing & validation
- **Google Cloud Console Integration** - OAuth Client ID configuration required

### UI/UX
- **React Icons** `^5.6.0` - Icon library (FaArrowLeft, FaMap, FaTrash, etc.)
- **Custom CSS** - Build files use vanilla CSS (no Tailwind/Bootstrap)
- **Responsive Design** - Mobile-first approach with breakpoints for tablet/desktop

### Testing
- **React Testing Library** `^16.3.2` - Component testing
- **Jest DOM** `^6.9.1` - DOM matchers
- **User Event** `^13.5.0` - User interaction simulation

### Build & Development
- **react-scripts** `5.0.1` - Create React App tooling
- **web-vitals** `^2.1.4` - Performance metrics

---

## 🔌 BACKEND STACK (Server)

### Core Framework
- **Node.js** - JavaScript runtime
- **Express.js** `^5.2.1` - Lightweight web framework
- **CORS** `^2.8.6` - Cross-Origin Resource Sharing (security middleware)

### Database & ORM
- **MongoDB** - NoSQL database (cloud or local)
- **Mongoose** `^9.2.3` - ODM (Object Document Mapper) for MongoDB
  - Type validation & schemas
  - Virtual relationships & hooks

### File Upload & Media
- **Multer** `^2.1.0` - Middleware for handling multiple file uploads
- **Static File Serving** - `/uploads` route serves images & assets
- **File Types Supported** - Images (.jpg, .png, .avif, etc.)

### Environment & Configuration
- **dotenv** `^17.4.1` - Environment variable management
- **Supports `.env` and `.env.development`** - Team shared DB config

### Development Tools
- **Nodemon** `^3.1.14` - Auto-reload during development
- **kill-port** - Automated port cleanup (via prestart script)
- **Console Logging** - Structured terminal output for debugging

### API Architecture (RESTful)
**Routes Organization:**
```
/api/auth        → User authentication (signup, signin)
/api/events      → Event CRUD operations
/api/stalls      → Venue stall/marker management
/api/visits      → Visitor tracking & feedback
/api/banners     → Promotional banner management
/uploads         → Static file storage
```

---

## 📊 DATABASE SCHEMA (MongoDB via Mongoose)

### Collections & Models

#### 1. **User**
```javascript
{
  name: String,
  email: String (unique, lowercase),
  password: String,
  isAdmin: Boolean,
  createdAt: Date
}
```

#### 2. **Event**
```javascript
{
  name: String,
  description: String,
  date: Date,
  location: String,
  image: String (upload path),
  createdAt: Date
}
```

#### 3. **Stall**
```javascript
{
  eventId: ObjectId (ref: Event),
  name: String,
  type: String (enum: stall, stage, restroom, food, entry, exit, help),
  x: Number (0-100 coordinate),
  y: Number (0-100 coordinate),
  createdAt: Date
}
```

#### 4. **Visit** (Feedback & Tracking)
```javascript
{
  username: String,
  stallId: ObjectId (ref: Stall),
  eventId: ObjectId (ref: Event),
  feedback: String (optional user comment),
  rating: Number (1-5 scale),
  createdAt: Date (auto-timestamp)
}
```

#### 5. **Banner**
```javascript
{
  eventId: ObjectId (ref: Event),
  title: String,
  image: String (upload path),
  order: Number,
  createdAt: Date
}
```

---

## 🔄 API COMMUNICATION FLOW

### Request Pattern (No WebSockets)
```
Frontend (React + Axios)
    ↓
HTTP Request
    ↓
Backend (Express Router)
    ↓
Controller Logic
    ↓
Mongoose Query
    ↓
MongoDB
    ↓
Response JSON
```

### Key Endpoints

**Authentication:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login (JWT token)
- Google OAuth integration via `@react-oauth/google`

**Events:**
- `GET /api/events` - List all events
- `GET /api/events/:id` - Event details
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

**Stalls (Map Markers):**
- `GET /api/stalls/:eventId` - Get all stalls for event
- `POST /api/stalls` - Add stall marker
- `DELETE /api/stalls/:stallId` - Remove stall

**Visits (Feedback):**
- `POST /api/visits` - Record visit + feedback
- `GET /api/visits/stall/:stallId` - Get all feedback for stall

**Banners:**
- `GET /api/banners/:eventId` - Event banners
- `POST /api/banners` - Upload banner (uses Multer)

---

## 🗺️ MAP IMPLEMENTATION DETAILS

### Technology Used
**NOT Google Maps API - Instead: Leaflet.js + Custom SVG**

### Map Architecture
```
Layer 1: Custom SVG Background
├─ 800x800px procedurally generated venue floor
├─ Color scheme: Reddish-brown (#E35D50, #DC5548)
├─ Corridor grid: 4 horizontal + 4 vertical paths
└─ Decorative trees: 90 pseudo-random placements

Layer 2: Interactive Markers (React-Leaflet)
├─ Emoji icons for each stall type (🛍️, 🎤, 🚻, etc.)
├─ Isometric 3D building effect (CSS)
├─ Labels with visited status badges (✔)
└─ Popup info on click

Layer 3: Navigation Routes
├─ L-shaped pathways (2 alternate routes)
├─ Snap to corridor centers: [12.5, 37.5, 62.5, 87.5]
├─ Route Planning: from → to visit optimization
└─ Visual polylines overlay

Layer 4: User Interactions
├─ Drag to pan, Scroll to zoom
├─ Click to select route start/end
├─ Auto-fit bounds on load
├─ Full-screen map view
```

### Coordinate System
- **Map Space**: 100x100 unit grid
- **Leaflet Coordinates**: [lat, lng] = [100-y, x]
- **Stall Storage**: x & y coordinates (0-100 range)

### Type Configuration
```javascript
{
  stall:    { icon: "🛍️", color: "#ffffff", label: "Stall" },
  stage:    { icon: "🎤", color: "#FFEAA7", label: "Stage" },
  restroom: { icon: "🚻", color: "#55EFC4", label: "Restroom" },
  food:     { icon: "🍔", color: "#FAB1A0", label: "Food Court" },
  entry:    { icon: "🚪", color: "#E056FD", label: "Entry Gate" },
  exit:     { icon: "🏁", color: "#C8D6E5", label: "Exit" },
  help:     { icon: "🧭", color: "#FEEAA7", label: "Help Desk" }
}
```

---

## 💬 FEEDBACK SYSTEM (NOT WebSockets)

### Real-time Communication: **NO - HTTP REST API Instead**

**Why Not WebSockets?**
- Simpler architecture for MVP
- REST API is sufficient for:
  - Recording feedback (POST one-time)
  - Retrieving feedback (GET on-demand)
  - No need for bi-directional streaming

### Feedback Flow
```
User submits feedback (rating + comment)
         ↓
POST /api/visits {username, stallId, eventId, feedback, rating}
         ↓
Mongoose saves to Visit collection
         ↓
Response with created document
         ↓
Admin polls GET /api/visits/stall/:stallId for updates
         ↓
Displays feedback in admin dashboard (manual refresh)
```

### Feedback Data Storage
- **Collection**: `Visit`
- **Fields**: username, stallId (reference), eventId, feedback, rating (1-5), createdAt
- **Sorting**: By createdAt descending (newest first)
- **Indexed queries**: By stallId for quick retrieval

---

## 📱 QR SCANNER IMPLEMENTATION

### Technology Stack
- **jsQR** (`^1.4.0`) - Core QR decoding library
- **Canvas API** - Image data processing
- **getUserMedia() API** - Camera stream access
- **BarcodeDetector API** - Native browser QR detection (W3C standard)
- **File Reader API** - Upload image processing

### Scanning Modes

**Mode 1: Live Camera Scanning**
```javascript
1. Request camera permission
2. Get video stream via getUserMedia()
3. Draw frames to canvas every ~100ms
4. Extract ImageData from canvas
5. Pass to jsQR decoder
6. On detection, navigate to event page
7. Store result in localStorage/sessionStorage
```

**Mode 2: Image Upload**
```javascript
1. User selects image file
2. FileReader loads as Data URL
3. Create Image object
4. Draw to canvas
5. Extract ImageData
6. Decode with jsQR
7. Handle success/error
```

### QR Generation
- Uses `qrcode.react` component
- Generates QR containing event ID
- Format: Encoded event UUID or ID string

---

## 🔐 Authentication Flow

### Sign Up/Sign In (Email-based)
```
User enters credentials
         ↓
POST /api/auth/signup or signin
         ↓
Mongoose validates email (unique check)
         ↓
Compare password (plaintext - should be hashed in production!)
         ↓
Return JWT token
         ↓
Store in localStorage as "wahap_temp_user"
         ↓
Use for authenticated requests
```

### Admin Detection
- Email check: `admin@wahap.com` or `admin@gmail.com` → `isAdmin: true`

### Google OAuth
- Integrated via `@react-oauth/google`
- Requires Google OAuth Client ID from Google Cloud Console
- Token validation & user creation on backend

### Token Management
- JWT decoded with `jwt-decode` library
- Stored in localStorage
- Sent in request headers for protected routes

---

## 🚀 DEPLOYMENT & HOSTING

### Server Configuration
- **Render.yaml** - Deployment configuration for hosting
- **Frontend URL**: Environment variable `FRONTEND_URL` (default: http://localhost:3000)
- **MongoDB URI**: Environment variable `MONGODB_URI`
- **CORS Setup**: Strict origin checking

### Environment Variables

**Server (.env or .env.development):**
```
MONGODB_URI=mongodb://...
PORT=5000
FRONTEND_URL=http://localhost:3000 or production URL
```

**Client (.env.local):**
```
REACT_APP_API_URL=http://localhost:5000 or production API
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Shared Development Database
- Uses `.env.development` for team collaboration
- Allows all developers to share test data
- Local `.env` overrides for custom testing

---

## 📦 Key Dependencies Summary

| Layer | Package | Version | Purpose |
|-------|---------|---------|---------|
| **Frontend** | React | ^19.2.4 | UI Framework |
| | React Router | ^7.13.1 | Routing |
| | Axios | ^1.13.6 | HTTP Client |
| | Leaflet | ^1.9.4 | Mapping |
| | React-Leaflet | ^5.0.0 | React Maps |
| | jsQR | ^1.4.0 | QR Decoding |
| | qrcode.react | ^4.2.0 | QR Generation |
| | Google OAuth | ^0.13.4 | Auth |
| **Backend** | Express | ^5.2.1 | Web Framework |
| | Mongoose | ^9.2.3 | ODM |
| | Multer | ^2.1.0 | File Upload |
| | CORS | ^2.8.6 | Security |
| | dotenv | ^17.4.1 | Config |
| **Database** | MongoDB | ^7.1.1 | NoSQL DB |

---

## 🔍 Data Flow Examples

### Event Creation Flow
```
Admin fills form → Frontend validates → POST /api/events
    ↓
Express receives → eventController.createEvent()
    ↓
New Event document created in MongoDB
    ↓
Return event with _id
    ↓
Frontend navigates to map editor
    ↓
window.dispatchEvent("wahap_data_changed") - refreshes list
```

### Stall Marker Placement
```
Admin clicks map → Calculates x,y coordinates
    ↓
Passes stall type, name, coordinates
    ↓
POST /api/stalls {eventId, name, type, x, y}
    ↓
Mongoose validates & saves Stall document
    ↓
Returns new marker data
    ↓
Frontend adds to stalls array → Re-renders map
```

### Visitor Navigation
```
User scans QR → App decodes eventId
    ↓
GET /api/events/:eventId → Event details
    ↓
GET /api/stalls/:eventId → All stall markers
    ↓
Frontend loads interactive map
    ↓
User clicks stalls → Records feedback
    ↓
POST /api/visits → Stores rating & comment
    ↓
Admin dashboard polls GET /api/visits/stall/:stallId
```

---

## 🛠️ Development Workflow

### Local Setup
```bash
# Terminal 1: Backend
cd server
npm install
node index.js  # Runs on port 5000

# Terminal 2: Frontend
cd client
npm install
npm start      # Runs on port 3000
```

### API Testing
- Use Postman/Insomnia with baseURL: `http://localhost:5000`
- All routes under `/api/` namespacing
- Request/Response format: JSON

### Port Management
- **Frontend**: 3000
- **Backend**: 5000 (auto-cleanup via prestart script)
- **MongoDB**: 27017 (default local)

---

## ✨ Key Architectural Decisions

| Decision | Implementation | Rationale |
|----------|---|---|
| **Maps** | Leaflet + Custom SVG | Lightweight, no API keys, full control |
| **Feedback** | HTTP REST API | Simpler than WebSockets for MVP |
| **QR** | jsQR library | Client-side, works offline after load |
| **Auth** | JWT + localStorage | Stateless, CORS-friendly |
| **Database** | MongoDB + Mongoose | Flexible schema, great for rapid iteration |
| **Styling** | Vanilla CSS | Lightweight, no dependencies |
| **State** | React Hooks + Axios | Modern, functional components |

---

## 📝 Notes

- **Security**: Password hashing should be implemented (currently plaintext - ⚠️)
- **Error Handling**: Basic try-catch, error logs in `error_log.txt` & `server_error.txt`
- **File Uploads**: Images stored in `/server/uploads/`
- **Image Serving**: Base URL: `${API_URL}/uploads/filename`
- **Responsive**: Mobile-first design with media queries
- **Performance**: Lazy loading for images, optimized SVG background

---

Generated: April 2026 | Complete Tech Stack Documentation for WAHAP Event Management System
