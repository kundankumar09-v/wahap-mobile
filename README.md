# WAHAAP - Event & Venue Management System

IOMP is a comprehensive platform designed to streamline event planning and attendee navigation. It provides a robust set of tools for event organizers to create layouts and for attendees to explore venues seamlessly.

## Key Features

### 🗺️ Interactive Venue Map & Editor
*   **Drag-and-Drop Interface**: Easily place and adjust stall locations on a dynamic venue grid.
*   **Coordinate Precision**: Click-to-set functionality for accurate stall positioning.
*   **Premium Visuals**: Custom-designed beige block-map background with high-quality pin markers.
*   **Smart Navigation**: Built-in support for L-shaped navigation routes and pathway visualization.

### 🛠️ Admin Capabilities
*   **Event Lifecycle Management**: Create, edit, and track multiple events from a single dashboard.
*   **Stall Allocation**: Manage stall metadata, labels, and placement within the venue.
*   **Banner Management**: Upload and organize promotional banners for event highlights.
*   **QR Integration**: Integrated QR scanning for attendee check-ins and visit logging.

### 📱 User Experience
*   **Consistent Across Devices**: Merged design philosophy ensures that admins and attendees see the same high-quality interface.
*   **Interactive Pins**: Markers include stall name labels for quick identification.
*   **Real-time Updates**: Changes made in the editor reflect instantly across the attendee view.

## Technology Stack

*   **Frontend**: React.js for a responsive, component-based UI.
*   **Backend**: Node.js and Express powering a RESTful API.
*   **Database**: MongoDB with Mongoose for structured data management.
*   **Styling**: Custom Vanilla CSS for precise design control without heavy frameworks.

## Getting Started

### Prerequisites
*   Node.js (v14+)

### Installation (For All Team Members)

1. **Clone the repository**
   ```bash
   git clone https://github.com/kundankumar09-v/Iomp.git
   cd Iomp
   ```

2. **Server Setup** (automatic development database connection)
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

3. **Client Setup** (in a separate terminal/tab)
   ```bash
   cd client
   npm install
   npm start
   ```

### ✅ Team Collaboration is Built-In

🎯 **Just clone, npm install, and run** – no setup needed!
🎯 **Everyone automatically connects to the same shared database** via `.env.development`
🎯 **When ANY team member adds an event, ALL collaborators see it** (just refresh browser)
🎯 **Events created by anyone are visible to everyone** – not just the creator
🎯 **All changes sync automatically** through the shared MongoDB Atlas
🎯 **No credential sharing needed** – development setup is in the repo

## Development Progress
The project has successfully reached core stability with the implementation of the Venue Map Editor, Admin Event forms, and cohesive styling across all map interfaces. Recent updates focused on refining the map grid alignment and enhancing the premium look of the navigation routes.
