# WAHAP — Native Mobile Application (iOS & Android)

A production-ready cross-platform mobile application for **WAHAP** built with **React Native + Expo**, connecting to the existing Node.js + Express + MongoDB backend.

---

## 📱 Features

1. **Event Discovery**:
   - Auto-scrolling Hero Banner carousel with active dot indicators.
   - City selector chips (Hyderabad, Bengaluru, Mumbai, Delhi, Pune, Chennai, etc.).
   - Instant search by event title, venue, or performer.
   - Category-grouped shelves (Music Concerts, Food Festivals, Tech & Hackathons, Workshops, Comedy Shows, Cultural, Exhibitions, Sports).
   - Pull-to-refresh with animated indicators.

2. **Event Details**:
   - High-resolution hero banner with floating navigation & native sharing.
   - Detailed event metadata: Date, time, venue, ticket pricing, capacity, and full description.
   - One-tap CTA to launch the interactive venue map.
   - Event fast-pass QR ID badge.

3. **Interactive Venue Map & Stall Navigation**:
   - 2D venue floor canvas supporting custom blueprint layouts and procedural corridor gridlines.
   - Real-time stall markers with category emojis, labels, and visited checkmarks.
   - **L-Route Pathfinding**: Select a start stall and destination stall to automatically calculate shortest corridor routes.
   - Stall interaction modal:
     - Set start point / Set destination.
     - Rate & review stall (1–5 stars with visitor feedback).
     - Live progress tracking (% of stalls visited).

4. **Camera QR Scanner**:
   - Live camera scanner (`expo-camera`) with viewfinder target and flash/torch toggle.
   - Instantly opens the scanned event.
   - Manual event ID entry fallback for low-light or simulator testing.

5. **Authentication & Session**:
   - Email/password Sign In and Sign Up with validation.
   - Persistent session storage (`AsyncStorage`).
   - In-app Server IP configuration for easy testing on physical mobile devices.

6. **Admin Command Center**:
   - Dashboard with event statistics, Edit, and Delete actions.
   - Create Event form with image picker (`expo-image-picker`) for poster, banner, and layout blueprints.
   - Map Editor: Tap on the canvas to place stalls, automatically snapping to aisle corridors (`12.5, 37.5, 62.5, 87.5`).
   - Hero Banner Manager: Upload, re-order (move up/down), and delete banners.

---

## 🚀 Running the Mobile Application

### 1. Start the Backend
Ensure the WAHAP backend server is running:
```bash
cd ../server
npm start
```

### 2. Start the Mobile App
```bash
cd mobile
npx expo start
```

### 3. Open on Device:
- **Physical Phone (Android / iOS)**: Install the **Expo Go** app from Google Play Store or iOS App Store, then scan the QR code displayed in the terminal.
- **Android Emulator**: Press `a` in the terminal (ensure Android Studio emulator is open).
- **iOS Simulator** (macOS): Press `i` in the terminal.

---

## 🌐 Network Configuration for Physical Devices
When running on a physical phone:
1. Ensure your phone and development computer are on the same Wi-Fi network.
2. In the mobile app, go to **Account** -> **Server Configuration** and enter your computer's local IP (e.g. `http://192.168.1.15:5000`).
