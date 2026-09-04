import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaCalendarAlt, FaUsers, FaGlobe, FaMapMarkerAlt, FaTag, FaQrcode, FaMap, FaSignInAlt } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";
import { QRCodeCanvas } from "qrcode.react";
import VenueMap from "../components/VenueMap";
import API_URL from "../config";
import "./Eventdetails.css";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        console.error("Failed to fetch event:", err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const formatImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return "TBA";
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return "TBA";

    if (!endDate || startDate === endDate) {
      // Single day event: "Sat, 11 Apr"
      return start.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) {
      return start.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    if (start.getTime() === end.getTime()) {
      // Single day event: "Sat, 11 Apr"
      return start.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    // Multi-day event
    const startMonth = start.getMonth();
    const endMonth = end.getMonth();
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    if (startMonth === endMonth && startYear === endYear) {
      // Same month: "10-11 Apr"
      const monthStr = start.toLocaleDateString("en-IN", { month: "short" });
      return `${start.getDate()}-${end.getDate()} ${monthStr}`;
    } else {
      // Different months: "10 Apr - 13 May"
      const startStr = start.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const endStr = end.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      return `${startStr} - ${endStr}`;
    }
  };

  const images = event?.eventImages?.length > 0
    ? event.eventImages.map(formatImageUrl)
    : event ? [formatImageUrl(event.bannerImage || event.eventImage || "")].filter(Boolean) : [];

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => setCurrentImgIndex((prev) => (prev + 1) % images.length), 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (loading) return <div className="event-details-page"><div className="loading">✨ Crafting Preview...</div></div>;
  if (!event) return <div className="event-details-page"><div className="error"><h2>Event Not Found</h2><Link to="/">Back to Home</Link></div></div>;

  const description = event.aboutEvent || "Join us for this spectacular event! Details coming soon.";
  const isLongDescription = description.length > 250;

  return (
    <div className="event-details-page">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="back-button">
        <FaArrowLeft /> Back
      </button>

      {/* Main Layout: Image + Details Card */}
      <div className="details-container">
        {/* Left: Event Banner */}
        <div className="event-banner-section">
          <div className="event-banner-carousel">
            <div className="carousel-inner" style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}>
              {images.map((img, index) => (
                <div key={index} className="carousel-slide">
                  <img src={img} alt={`${event.name} slide ${index + 1}`} className="carousel-img" />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <>
                <button className="carousel-control prev" onClick={() => setCurrentImgIndex((currentImgIndex - 1 + images.length) % images.length)}><FaArrowLeft /></button>
                <button className="carousel-control next" onClick={() => setCurrentImgIndex((currentImgIndex + 1) % images.length)}><FaArrowLeft style={{ transform: 'rotate(180deg)' }} /></button>
                <div className="carousel-dots">
                  {images.map((_, index) => (
                    <div key={index} className={`dot ${currentImgIndex === index ? "active" : ""}`} onClick={() => setCurrentImgIndex(index)}></div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tags below image */}
          <div className="event-tags">
            <span className="tag">{event.type || "Special Event"}</span>
            {event.city && <span className="tag">{event.city}</span>}
          </div>
        </div>

        {/* Right: Title + Details Card */}
        <div className="details-card-section">
          {/* Event Title (No Box) */}
          <h1 className="event-title-clean">{event.name}</h1>

          {/* Compact Details Card */}
          <div className="details-card">
            <div className="details-rows">
              <div className="detail-row">
                <FaCalendarAlt className="row-icon" />
                <div className="row-content">
                  <small className="row-label">DATE</small>
                  <span className="row-value">{formatEventDate(event.date, event.endDate)}</span>
                </div>
              </div>

              <div className="detail-row">
                <FaTag className="row-icon" />
                <div className="row-content">
                  <small className="row-label">DURATION</small>
                  <span className="row-value">{event.duration || "1h 30m"}</span>
                </div>
              </div>

              <div className="detail-row">
                <FaUsers className="row-icon" />
                <div className="row-content">
                  <small className="row-label">AGE LIMIT</small>
                  <span className="row-value">{event.ageLimit ? `${event.ageLimit}+` : "All Ages"}</span>
                </div>
              </div>

              <div className="detail-row">
                <FaGlobe className="row-icon" />
                <div className="row-content">
                  <small className="row-label">LANGUAGE</small>
                  <span className="row-value">{event.language || "English / Local"}</span>
                </div>
              </div>

              <div className="detail-row">
                <MdLocalOffer className="row-icon" />
                <div className="row-content">
                  <small className="row-label">TYPE</small>
                  <span className="row-value">{event.type || "N/A"}</span>
                </div>
              </div>

              <div className="detail-row">
                <FaMapMarkerAlt className="row-icon" />
                <div className="row-content">
                  <small className="row-label">LOCATION</small>
                  <span className="row-value">{event.city}</span>
                  {event.address && <p className="location-address">{event.address}</p>}
                </div>
              </div>
            </div>

            {/* QR Code Section (Minimal) */}
            <div className="qr-section">
              {localStorage.getItem("wahap_temp_user") ? (
                <>
                  <button onClick={() => setShowQR(!showQR)} className="qr-button">
                    <FaQrcode /> {showQR ? "Hide QR" : "Entry QR"}
                  </button>
                  {showQR && (
                    <div className="qr-display">
                      <QRCodeCanvas value={id} size={120} level="H" includeMargin={true} />
                    </div>
                  )}
                </>
              ) : (
                <div className="qr-signin">
                  <FaSignInAlt className="icon-qr" />
                  <Link to="/signin">Sign in for QR</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="details-bottom-section">
        <div className="about-block">
          <h3 className="block-title">About the Event</h3>
          <div className={`about-para ${expanded ? "expanded" : ""}`}>
            {description.split('\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>
          {isLongDescription && (
            <button className="read-more" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Read Less" : "Read More"}
            </button>
          )}
        </div>

        <div className="interactive-map-block">
          <div className="block-header">
            <div>
              <h3 className="block-title">Interactive Venue Map</h3>
              <p className="block-sub">Locate stalls, stages, and facilities in real-time.</p>
            </div>
            {localStorage.getItem("wahap_temp_user") && (
              <button className="expand-map-btn" onClick={() => navigate(`/event/${id}/map`)}>Go Full Screen</button>
            )}
          </div>
          <div className="map-embed-frame">
            {localStorage.getItem("wahap_temp_user") ? (
              <VenueMap eventId={id} />
            ) : (
              <div className="map-lock-overlay">
                <FaMap className="lock-icon" />
                <p><Link to="/signin">Sign in</Link> to interact with the venue map</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;