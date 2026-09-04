import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import EventList from "./pages/EventList";
import EventDetails from "./pages/Eventdetails";
import EventMap from "./pages/EventMap";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCreateEvent from "./pages/Admincreateevent";
import AdminEditEvent from "./pages/AdminEditEvent";
import AdminMapEditor from "./pages/AdminMapeditor";
import QrScanner from "./pages/QrScanner";
import ManagerBanners from "./pages/ManagerBanners";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Navigate } from "react-router-dom";

import BottomNav from "./components/BottomNav";

// 🔐 Admin Guard
const ProtectedRoute = ({ children }) => {
  const userEmail = localStorage.getItem("wahap_user_email");
  const isAdmin = userEmail?.toLowerCase() === "admin@wahap.com" || userEmail?.toLowerCase() === "admin@gmail.com";
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppContent() {
  const location = useLocation();
  const hideNavbarFooter = location.pathname.includes("/map") || location.pathname.startsWith("/admin");

  return (
    <div className="app-viewport">
      {!hideNavbarFooter && <Navbar />}
      <main className="app-main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/event/:id/map" element={<EventMap />} />
          <Route path="/scan-qr" element={<QrScanner />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/create" element={<ProtectedRoute><AdminCreateEvent /></ProtectedRoute>} />
          <Route path="/admin/edit/:id" element={<ProtectedRoute><AdminEditEvent /></ProtectedRoute>} />
          <Route path="/admin/map/:eventId" element={<ProtectedRoute><AdminMapEditor /></ProtectedRoute>} />
          <Route path="/admin/banners" element={<ProtectedRoute><ManagerBanners /></ProtectedRoute>} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </main>
      {!hideNavbarFooter && <Footer />}
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;