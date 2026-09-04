import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";
import { FaPlus, FaMapMarkedAlt, FaTrash, FaEdit, FaCalendarAlt } from "react-icons/fa";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events`);
        setEvents(res.data);
      } catch (err) {
        console.error("Fetch Events Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();

    const handleDataChanged = () => {
      fetchEvents();
    };

    window.addEventListener("wahap_data_changed", handleDataChanged);
    return () => window.removeEventListener("wahap_data_changed", handleDataChanged);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event? All data will be lost.")) return;
    try {
      await axios.delete(`${API_URL}/api/events/${id}`);
      setEvents(events.filter(e => e._id !== id));
      window.dispatchEvent(new Event("wahap_data_changed"));
    } catch (err) {
      console.error("Delete Error:", err);
      alert("❌ Selection could not be deleted. Please verify your connection.");
    }
  };

  const getImageSource = (path) => {
    if (!path || path.includes("placeholder")) {
        return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400";
    }
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  if (loading) return <div className="admin-loading">✨ Loading Dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Command Center</h1>
          <p>Manage your events, interactive maps, and stall placements.</p>
        </div>
        <button className="create-btn" onClick={() => navigate("/admin/create")}>
          <FaPlus /> Create New Event
        </button>
      </div>

      <div className="events-grid">
        {events.length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt size={50} />
            <h2>No Events Found</h2>
            <p>Start by creating your first interactive event experience.</p>
            <button onClick={() => navigate("/admin/create")}>Get Started</button>
          </div>
        ) : (
          events.map((event) => (
            <div key={event._id} className="event-card-admin">
              <div className="event-info">
                <img 
                  src={getImageSource(event.eventImage)} 
                  alt={event.name} 
                  className="event-card-img"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=400"; }}
                />
                <div className="text-content">
                  <h3>{event.name}</h3>
                  <p>{event.city} • {event.type}</p>
                </div>
              </div>
              <div className="admin-actions">
                <button 
                  className="action-btn map" 
                  onClick={() => navigate(`/admin/map/${event._id}?layout=${event.layoutImage}`)}
                  title="Configure Stall Map"
                >
                  <FaMapMarkedAlt /> Manage Map
                </button>
                <div className="small-actions">
                   <button 
                      className="small-btn edit" 
                      onClick={() => navigate(`/admin/edit/${event._id}`)}
                      title="Edit Event Details"
                   >
                     <FaEdit />
                   </button>
                   <button 
                      className="small-btn danger" 
                      onClick={() => handleDelete(event._id)}
                      title="Delete Event"
                   >
                     <FaTrash />
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
