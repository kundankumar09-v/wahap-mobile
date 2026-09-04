import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_URL from "../config";
import "./EventList.css";

function EventList() {

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Extract filters from URL
  const city = params.get("city") || "";
  const type = params.get("type") || "";
  const search = params.get("query") || "";

  // Fetch events when params change
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (city && city !== "All") queryParams.set("city", city);
        if (type) queryParams.set("type", type);
        if (search) queryParams.set("query", search);

        const res = await axios.get(
          `${API_URL}/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
        );
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setEvents([]);
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
  }, [city, type, search]);

  const formatImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  const formatDate = (startDate, endDate) => {
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

  return (
    <div className="event-page">
      {loading && <div className="loading-overlay">✨ Discovering nearby events...</div>}

      {/* Cards */}
      <div className="cards">

        {events.map((event) => (

          <div
            key={event._id}
            className="card"
            onClick={() => navigate(`/event/${event._id}`)}
          >
            <div className="event-poster-wrap">
              <img
                src={formatImageUrl(event.eventImage || event.bannerImage)}
                alt={event.name}
                className="card-img"
              />
              <div className="event-bottom-strip">{formatDate(event.date, event.endDate)}</div>
            </div>

            <div className="card-info">
              <h4>{event.name}</h4>
              <p className="city">{event.type}</p>
            </div>

          </div>

        ))}

      </div>
    </div>
  );
}

export default EventList;