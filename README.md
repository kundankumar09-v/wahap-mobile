# WAHAP — Event & Venue Management Platform

WAHAP is a full-stack event and venue management platform that helps organizers create events, design interactive venue maps, and manage attendee experiences — all from a single system. It ships with a **React web client**, a **React Native (Expo) mobile app**, and a **Node.js/Express backend** powered by MongoDB.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Server Setup](#1-server-setup)
  - [Web Client Setup](#2-web-client-setup)
  - [Mobile App Setup](#3-mobile-app-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Team Collaboration](#team-collaboration)
- [License](#license)

---

## Features

### 🗺️ Interactive Venue Maps
- **Drag-and-drop map editor** — place and reposition stalls on a dynamic venue grid.
- **Click-to-set coordinates** for precise stall placement.
- **L-shaped navigation routes** and real-time pathway visualization for attendees.
- **Pin markers with labels** so visitors can quickly identify each stall.

### 🛠️ Admin Dashboard
- **Event lifecycle management** — create, edit, and delete events from a centralized dashboard.
- **Stall allocation** — manage stall metadata, labels, and venue placement.
- **Banner management** — upload and organize promotional banners for events.
- **QR code integration** — scan QR codes for attendee check-ins and visit logging.
- **Protected admin routes** — only authorized admin accounts can access management pages.

### 🔐 Authentication
- **Email/password sign-up and sign-in** for attendees and organizers.
- **Google OAuth** support on the web client.
- **JWT-based session management** with persistent login on mobile via AsyncStorage.

### 📱 Cross-Platform Experience
- **Web client** — React SPA with responsive, mobile-first design and a bottom navigation bar.
- **Mobile app** — Native Android/iOS experience built with React Native and Expo.
- **Capacitor bridge** — the web client can also be packaged as a hybrid mobile app.

### 👥 Attendee Features
- Browse and discover upcoming events.
- View detailed event information (date, venue, description, gallery).
- Explore interactive venue maps with stall locations and navigation.
- Scan QR codes at event stalls.

---

## Tech Stack

| Layer        | Technology                                                  |
| ------------ | ----------------------------------------------------------- |
| **Frontend** | React 19, React Router 7, Leaflet, Vanilla CSS              |
| **Mobile**   | React Native 0.86, Expo 57, React Navigation 7              |
| **Backend**  | Node.js, Express 5, Mongoose 9                              |
| **Database** | MongoDB Atlas                                                |
| **Auth**     | JWT, Google OAuth (`@react-oauth/google`)                   |
| **Storage**  | Multer (file uploads)                                       |
| **Deploy**   | Render (server), Capacitor (mobile builds)                  |

---

## Project Structure

```
wahap-mobile/
├── client/                 # React web application
│   ├── public/             # Static assets (icons, images)
│   ├── src/
│   │   ├── components/     # Navbar, Footer, BottomNav, VenueMap
│   │   ├── constants/      # Event types, hero banners
│   │   ├── pages/          # All page components (Home, Events, Admin, Auth …)
│   │   ├── config.js       # API base URL configuration
│   │   └── App.js          # Route definitions and app shell
│   └── capacitor.config.json
│
├── mobile/                 # React Native (Expo) mobile app
│   ├── src/
│   │   ├── api/            # Axios API clients (auth, events, stalls, banners …)
│   │   ├── context/        # AuthContext provider
│   │   ├── navigation/     # Stack & bottom-tab navigators
│   │   ├── screens/        # Screen components grouped by feature
│   │   ├── theme/          # Color palette
│   │   └── utils/          # Helper functions (image URLs, route math)
│   └── App.js              # App entry point
│
├── server/                 # Express REST API
│   ├── config/             # Database connection, seed script
│   ├── controllers/        # Route handlers (auth, events, stalls, banners, visits)
│   ├── middleware/          # Multer upload middleware
│   ├── models/             # Mongoose schemas (User, Event, Stall, Banner, Visit)
│   ├── routes/             # Express route definitions
│   └── index.js            # Server entry point
│
├── render.yaml             # Render deployment configuration
└── package.json            # Root scripts (shortcuts for server, client, mobile)
```

---

## Getting Started

### Prerequisites

- **Node.js** v16 or later
- **npm** v8 or later
- **Expo CLI** (for mobile development) — installed automatically via `npx`

### 1. Server Setup

```bash
cd server
npm install
node index.js
```

Expected output:

```
✅ MongoDB Connected
✅ Database already seeded. Preserving existing events.
🚀 Server running on port 5000
```

> The development environment is pre-configured with a shared MongoDB Atlas connection in `.env.development`, so no additional database setup is required.

### 2. Web Client Setup

Open a **separate terminal**:

```bash
cd client
npm install
npm start
```

The app opens at `http://localhost:3000`.

### 3. Mobile App Setup

Open a **separate terminal**:

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone, or press `a` to launch the Android emulator.

---

## Environment Variables

### Server (`server/.env`)

| Variable       | Description                        | Default             |
| -------------- | ---------------------------------- | ------------------- |
| `MONGODB_URI`  | MongoDB Atlas connection string    | Set in `.env.development` |
| `PORT`         | Server port                        | `5000`              |
| `NODE_ENV`     | Environment mode                   | `development`       |
| `FRONTEND_URL` | Allowed CORS origin                | `http://localhost:3000` |

### Client (`client/.env.local`)

| Variable                       | Description                  |
| ------------------------------ | ---------------------------- |
| `REACT_APP_API_URL`            | Backend API base URL         |
| `REACT_APP_GOOGLE_CLIENT_ID`   | Google OAuth client ID       |

> See `.env.example` files in both `server/` and `client/` for reference.

---

## Deployment

The server is configured for deployment on **Render** using `render.yaml`. To deploy:

1. Connect your GitHub repository to Render.
2. Render will auto-detect `render.yaml` and provision the service.
3. Build the client for production: `cd client && npm run build`.

For mobile builds:

```bash
cd client
npm run mobile:build    # Build web + sync with Capacitor
npm run mobile:android  # Open Android Studio project
```

---

## Team Collaboration

- **Shared database** — all team members connect to the same MongoDB Atlas cluster via `.env.development`.
- **Real-time data sync** — events created by any team member are visible to everyone (refresh to see updates).
- **No credential sharing needed** — development database config is included in the repo.
- **Just clone → install → run** — zero setup friction for new contributors.

---

## License

This project is licensed under the [MIT License](mobile/LICENSE).
