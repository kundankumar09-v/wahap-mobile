import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";
import { EVENT_TYPES } from "../constants/eventTypes";
import { FaArrowLeft, FaSave, FaMapMarkerAlt, FaGlobe } from "react-icons/fa";
import "./AdminCreateEvent.css";

function AdminEditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState({
    name: "",
    type: "",
    city: "",
    address: "",
    date: "",
    endDate: "",
    startTime: "",
    duration: "",
    ageLimit: "",
    language: "",
    ticketType: "",
    aboutEvent: ""
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events/${id}`);
        const data = res.data;
        // Format dates for input[type="date"]
        if (data.date) data.date = data.date.split("T")[0];
        if (data.endDate) data.endDate = data.endDate.split("T")[0];
        setEventData(data);
      } catch (err) {
        console.error("Fetch Edit Error:", err);
        alert("Failed to load event data");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/events/${id}`, eventData);
      window.dispatchEvent(new Event("wahap_data_changed"));
      alert("✅ Event updated successfully!");
      navigate("/admin");
    } catch (err) {
      console.error("Update Error:", err);
      alert("❌ Selection could not be updated. Please verify all fields.");
    }
  };

  if (loading) return <div className="admin-loading">✨ Loading Event Details...</div>;

  return (
    <div className="admin-create-page">
      <div className="admin-create-container">
        <header className="create-header">
          <button onClick={() => navigate("/admin")} className="back-btn-round">
            <FaArrowLeft />
          </button>
          <div className="title-group">
            <h1>Edit Intelligence</h1>
            <p>Update your event details and visual assets.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="premium-form">
          <section className="form-grid">
            <div className="form-group full-width">
              <label>Event Name</label>
              <input name="name" value={eventData.name} onChange={handleChange} required placeholder="e.g. Wahap Grand Festival" className="p-input" />
            </div>

            <div className="form-group">
              <label>Event Type</label>
              <select name="type" value={eventData.type} onChange={handleChange} required className="p-input">
                <option value="">Select Category</option>
                {EVENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>City / Location</label>
              <input name="city" value={eventData.city} onChange={handleChange} required placeholder="e.g. Hyderabad" className="p-input" />
            </div>

            <div className="form-group full-width">
              <label><FaMapMarkerAlt /> Venue Address</label>
              <input name="address" value={eventData.address} onChange={handleChange} placeholder="Full address of the venue" className="p-input" />
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input type="date" name="date" value={eventData.date} onChange={handleChange} required className="p-input" />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input type="date" name="endDate" value={eventData.endDate} onChange={handleChange} className="p-input" />
            </div>

            <div className="form-group">
              <label>Age Limit</label>
              <input name="ageLimit" value={eventData.ageLimit} onChange={handleChange} placeholder="e.g. 18" className="p-input" />
            </div>

            <div className="form-group">
              <label><FaGlobe /> Language</label>
              <input name="language" value={eventData.language} onChange={handleChange} placeholder="e.g. Hindi, English" className="p-input" />
            </div>

            <div className="form-group full-width">
              <label>About the Event</label>
              <textarea name="aboutEvent" value={eventData.aboutEvent} onChange={handleChange} rows="5" placeholder="Describe the spectacular experience attendees will have..." className="p-input" />
            </div>
          </section>

          <div className="form-footer">
            <p className="hint">Note: To update images, please delete and recreate the event (Multi-part edit coming soon).</p>
            <button type="submit" className="p-submit-btn">
              <FaSave /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminEditEvent;
