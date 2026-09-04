# WAHAP - Native Mobile Event & Venue Management Platform

WAHAP is a full-stack event and venue management platform built as a **native mobile application**. It helps organizers create events, design interactive venue maps, and manage attendee experiences — all from a single system.

The platform ships with a **React Native (Expo) mobile app** for Android/iOS and a **Node.js/Express backend** powered by MongoDB.

---

## Architecture

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native + Expo |
| **Backend** | Node.js + Express |
| **Database** | MongoDB / MongoDB Atlas |
| **Authentication** | JWT |
| **Navigation** | React Navigation |
| **Storage** | AsyncStorage |
| **QR Scanning** | Native Expo/React Native camera scanning |

---

## Project Structure

```
WAHAP/
├── mobile/        # React Native + Expo mobile application
├── server/        # Node.js + Express + MongoDB backend
├── README.md
└── .gitignore
```

---

## Features

### Interactive Venue Maps
- 2D native venue canvas with stall placement and corridor snapping
- L-shaped navigation routes and real-time pathway visualization
- Pin markers with labels for quick stall identification
- Stall filtering by type (food, restrooms, stages, etc.)

### Admin Dashboard
- Event lifecycle management — create, edit, and delete events
- Stall allocation — manage stall metadata, labels, and venue placement
- Banner management — upload and organize promotional banners
- QR code integration — scan QR codes for attendee check-ins

### Authentication
- Email/password sign-up and sign-in
- JWT-based session management
- Persistent login on mobile via AsyncStorage
- Protected admin screens

### Attendee Features
- Browse and discover upcoming events
- Filter by city, category, and search query
- View event details with venue information
- Interactive venue map with stall navigation
- Rate and review stalls
- Track exploration progress

### Native Mobile Experience
- Expo Camera for native QR code scanning
- Expo Image Picker for admin image uploads
- Platform-aware API URL configuration
- Android/iOS safe area handling
- Native stack and tab navigation

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **MongoDB Atlas** account (or local MongoDB)
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** or **Xcode** for device/emulator testing

### Server Setup

```bash
cd server
cp .env.example .env      # Configure your MongoDB URI and port
npm install
npm start
```

The server runs on `http://localhost:5000` by default.

### Mobile App Setup

```bash
cd mobile
cp .env .env.local         # Set API_BASE_URL for your environment
npm install
npx expo start
```

#### API URL Configuration

The mobile app uses platform-aware API URLs:

| Environment | Default URL |
|------------|-------------|
| Android Emulator | `http://10.0.2.2:5000` |
| iOS Simulator | `http://localhost:5000` |
| Physical Device | `http://<YOUR_LAN_IP>:5000` |

You can change the API URL at runtime from the app's **Sign In > Server Configuration** screen.

---

## API Endpoints

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/auth` | POST /signup, POST /signin, GET /:id | User authentication |
| `/api/events` | GET /, GET /:id, POST /create, PUT /:id, DELETE /:id | Event management |
| `/api/stalls` | GET /:eventId, POST /add, DELETE /delete/:stallId | Stall management |
| `/api/visits` | POST /record, GET /feedback/:stallId | Visit tracking & feedback |
| `/api/banners` | GET /, POST /, DELETE /:id, PATCH /:id/move, POST /reset | Banner management |

---

## Environment Variables

### Server (`.env`)

```
MONGODB_URI=your_mongodb_atlas_uri
PORT=5000
NODE_ENV=development
```

### Mobile (`.env`)

```
API_BASE_URL=http://10.0.2.2:5000
```

---

## Default Admin Credentials

- **Email:** admin@wahap.com
- **Password:** admin123

---

## License

ISC
