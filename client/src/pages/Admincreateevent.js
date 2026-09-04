import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";
import { EVENT_TYPES } from "../constants/eventTypes";
import { FaArrowLeft, FaRocket, FaImage, FaMapMarkerAlt, FaGlobe } from "react-icons/fa";
import "./AdminCreateEvent.css";

function AdminCreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "Wahap Grand Festival 2026",
    type: "Fest",
    city: "Hyderabad",
    address: "HITECH City Mall, Telangana",
    duration: "6 Hours",
    date: "2026-12-15",
    endDate: "2026-12-20",
    ticketType: "Free",
    ageLimit: "5",
    language: "English / Hindi",
    aboutEvent: "Experience the ultimate fusion of music, technology, and culture at the Grand Festival. Join over 5,000 attendees for an immersive journey through interactive stalls and live stage performances.",
  });

  const [eventImage, setEventImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [layoutImage, setLayoutImage] = useState(null);
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [layoutImageUrl, setLayoutImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // Use URL if provided, otherwise use file
    if (eventImageUrl) {
      data.append("eventImageUrl", eventImageUrl);
    } else if (eventImage) {
      data.append("eventImage", eventImage);
    }

    if (layoutImageUrl) {
      data.append("layoutImageUrl", layoutImageUrl);
    } else if (layoutImage) {
      data.append("layoutImage", layoutImage);
    }

    if (bannerImageUrl) {
      data.append("bannerImageUrl", bannerImageUrl);
    } else if (bannerImage) {
      data.append("bannerImage", bannerImage);
    }

    try {
      const res = await axios.post(`${API_URL}/api/events/create`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      window.dispatchEvent(new Event("wahap_data_changed"));

      const eventId = res.data.event._id;
      const layoutPath = res.data.event.layoutImage;
      navigate(`/admin/map/${eventId}?layout=${layoutPath}`);
    } catch (err) {
      console.error(err);
      alert("❌ Error creating event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-page">
      <div className="admin-create-container">
        <button onClick={() => navigate("/admin")} className="back-btn">
          <FaArrowLeft /> Dashboard
        </button>

        <div className="form-header">
          <FaRocket className="header-icon" />
          <h1>Launch New Event</h1>
          <p>Create an immersive experience for your attendees.</p>
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#64748b', opacity: 0.8 }}>
            (Fields pre-filled for demo. Leave files blank to use sample map)
          </div>
        </div>

        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-grid">
            <div className="form-section">
              <h3><FaGlobe /> Core Identity</h3>
              <input name="name" value={formData.name} placeholder="Event Name" onChange={handleChange} required className="p-input" />
              <div className="row">
                <select name="type" value={formData.type} onChange={handleChange} className="p-input" required>
                  <option value="">Select Category</option>
                  {EVENT_TYPES.map((typeItem) => (
                    <option key={typeItem.value} value={typeItem.value}>{typeItem.label}</option>
                  ))}
                </select>
                <select name="ticketType" value={formData.ticketType} onChange={handleChange} className="p-input">
                  <option value="Free">Free Entry</option>
                  <option value="Paid">Paid Ticket</option>
                </select>
              </div>
              <textarea name="aboutEvent" value={formData.aboutEvent} placeholder="Describe the event experience..." onChange={handleChange} rows={4} className="p-input" />
            </div>

            <div className="form-section">
              <h3><FaMapMarkerAlt /> Venue & Logistics</h3>
              <div className="row">
                 <input name="city" value={formData.city} placeholder="City" onChange={handleChange} required className="p-input" />
                 <input name="duration" value={formData.duration} placeholder="Duration (e.g., 3h)" onChange={handleChange} className="p-input" />
              </div>
              <input name="address" value={formData.address} placeholder="Full Venue Address" onChange={handleChange} className="p-input" />
              <div className="row">
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-input" title="Start Date" />
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="p-input" title="End Date" />
              </div>
              <div className="row">
                <input name="ageLimit" value={formData.ageLimit} placeholder="Age Limit" onChange={handleChange} className="p-input" />
                <input name="language" value={formData.language} placeholder="Main Language" onChange={handleChange} className="p-input" />
              </div>
            </div>

            <div className="form-section full-width">
              <h3><FaImage /> Visual Assets</h3>
              <p style={{fontSize: '12px', color: '#666', marginBottom: '15px'}}>Upload file OR paste image URL (URL recommended for production)</p>
              <div className="upload-grid">
                <div className="upload-box">
                  <span className="label">Event Card Image*</span>
                  <div className="image-preview">
                    {eventImage ? <img src={URL.createObjectURL(eventImage)} alt="Preview" /> : eventImageUrl ? <img src={eventImageUrl} alt="Preview" /> : <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=300" alt="Sample" style={{ opacity: 0.6 }} />}
                  </div>
                  <input type="file" onChange={(e) => setEventImage(e.target.files[0])} placeholder="Upload or use URL below" />
                  <input type="text" value={eventImageUrl} onChange={(e) => setEventImageUrl(e.target.value)} placeholder="Or paste image URL" style={{marginTop: '8px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}} />
                </div>
                <div className="upload-box">
                  <span className="label">Banner Image</span>
                  <div className="image-preview">
                    {bannerImage ? <img src={URL.createObjectURL(bannerImage)} alt="Preview" /> : bannerImageUrl ? <img src={bannerImageUrl} alt="Preview" /> : <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=300" alt="Sample" style={{ opacity: 0.6 }} />}
                  </div>
                  <input type="file" onChange={(e) => setBannerImage(e.target.files[0])} />
                  <input type="text" value={bannerImageUrl} onChange={(e) => setBannerImageUrl(e.target.value)} placeholder="Or paste image URL" style={{marginTop: '8px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}} />
                </div>
                <div className="upload-box layout">
                  <span className="label">Venue Layout/Map*</span>
                  <div className="image-preview">
                    {layoutImage ? <img src={URL.createObjectURL(layoutImage)} alt="Preview" /> : layoutImageUrl ? <img src={layoutImageUrl} alt="Preview" /> : <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=300" alt="Sample" style={{ opacity: 0.6 }} />}
                  </div>
                  <input type="file" onChange={(e) => setLayoutImage(e.target.files[0])} />
                  <input type="text" value={layoutImageUrl} onChange={(e) => setLayoutImageUrl(e.target.value)} placeholder="Or paste image URL" style={{marginTop: '8px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}} />
                </div>
              </div>
              <p className="upload-hint">Leave inputs blank to use professional samples</p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="p-submit-btn">
            {loading ? "Preparing Launch..." : "Create & Open Map Editor"}
          </button>
        </form>
      </div>
    </div>
  );
}export default AdminCreateEvent;