import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkedAlt,
  FaQrcode,
  FaShieldAlt,
  FaBolt,
  FaRegCalendarAlt,
  FaUsers,
} from "react-icons/fa";
import axios from "axios";
import API_URL from "../config";
import { EVENT_TYPES, formatTypeLabel, normalizeType } from "../constants/eventTypes";
import { DEFAULT_HERO_BANNERS, fetchHeroBanners } from "../constants/heroBanners";
import "./Home.css";

const HOME_SECTION_PREVIEW_LIMIT = 10;



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

function Home() {
  const [events, setEvents] = useState([]);
  const [rowArrows, setRowArrows] = useState({});
  const [heroBanners, setHeroBanners] = useState(DEFAULT_HERO_BANNERS);
  const rowRefs = useRef({});
  const [heroIndex, setHeroIndex] = useState(0);
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events`);
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();

    const handleDataChanged = () => {
      fetchEvents();
    };

    window.addEventListener("wahap_data_changed", handleDataChanged);
    return () => window.removeEventListener("wahap_data_changed", handleDataChanged);
  }, []);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const apiBanners = await fetchHeroBanners();
        setHeroBanners(apiBanners);
      } catch (error) {
        console.error("Failed to load hero banners:", error);
        setHeroBanners(DEFAULT_HERO_BANNERS);
      }
    };

    loadBanners();
  }, []);


  const formatImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  const rankedEvents = useMemo(() => {
    return events
      .sort((a, b) => {
        const timeA = new Date(a.date || 0).getTime() || 0;
        const timeB = new Date(b.date || 0).getTime() || 0;
        if (timeA !== timeB) return timeA - timeB;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [events]);

  const groupedEvents = useMemo(() => {
    const grouped = rankedEvents.reduce((acc, event) => {
      const key = normalizeType(event.type || "") || "others";
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {});

    const orderedFromMaster = EVENT_TYPES.map((typeItem) => typeItem.value).filter(
      (key) => grouped[key]?.length
    );

    const dynamicKeys = Object.keys(grouped)
      .filter((key) => !orderedFromMaster.includes(key))
      .sort((a, b) => formatTypeLabel(a).localeCompare(formatTypeLabel(b)));

    return [...orderedFromMaster, ...dynamicKeys].map((typeKey) => ({
      typeKey,
      label: formatTypeLabel(typeKey),
      previewItems: grouped[typeKey].slice(0, HOME_SECTION_PREVIEW_LIMIT),
    }));
  }, [rankedEvents]);

  const buildViewAllLink = useCallback(
    (typeKey) => {
      const query = new URLSearchParams();
      query.set("type", typeKey);
      return `/events?${query.toString()}`;
    },
    []
  );

  const updateArrowState = useCallback((typeKey) => {
    const rowEl = rowRefs.current[typeKey];
    if (!rowEl) return;

    const maxLeft = rowEl.scrollWidth - rowEl.clientWidth;
    const showLeft = rowEl.scrollLeft > 8;
    const showRight = maxLeft - rowEl.scrollLeft > 8;

    setRowArrows((prev) => {
      const existing = prev[typeKey] || { showLeft: false, showRight: false };
      if (existing.showLeft === showLeft && existing.showRight === showRight) {
        return prev;
      }

      return {
        ...prev,
        [typeKey]: { showLeft, showRight },
      };
    });
  }, []);

  const scrollRowBy = useCallback(
    (typeKey, direction) => {
      const rowEl = rowRefs.current[typeKey];
      if (!rowEl) return;

      const cardWidth = rowEl.querySelector(".event-card-link")?.clientWidth || 220;
      const step = Math.max(cardWidth * 2, 300);
      rowEl.scrollBy({ left: direction * step, behavior: "smooth" });

      window.setTimeout(() => updateArrowState(typeKey), 340);
    },
    [updateArrowState]
  );

  useEffect(() => {
    groupedEvents.forEach((group) => updateArrowState(group.typeKey));

    const handleResize = () => {
      groupedEvents.forEach((group) => updateArrowState(group.typeKey));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [groupedEvents, updateArrowState]);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  return (
    <div className="home-page">


      {/* BANNERS */}
      <section className="hero-banner-section">
        <div className="hero-inner">
          <div className="carousel-container">
            <div className="carousel-track" style={{ transform: `translateX(-${heroIndex * 100}%)` }}>
              {heroBanners.map((banner, idx) => (
                <div key={banner._id || banner.id || idx} className="carousel-item">
                  <img src={banner.image} alt={banner.alt || "Event Banner"} className="hero-img" />
                </div>
              ))}
            </div>

            {heroBanners.length > 1 && (
              <>
                <button
                  className="carousel-btn prev"
                  onClick={() => setHeroIndex((heroIndex - 1 + heroBanners.length) % heroBanners.length)}
                  aria-label="Previous Banner"
                >
                  <FaChevronLeft />
                </button>
                <button
                  className="carousel-btn next"
                  onClick={() => setHeroIndex((heroIndex + 1) % heroBanners.length)}
                  aria-label="Next Banner"
                >
                  <FaChevronRight />
                </button>

                <div className="carousel-pagination">
                  {heroBanners.map((_, idx) => (
                    <button
                      key={idx}
                      className={`nav-dot ${heroIndex === idx ? 'active' : ''}`}
                      onClick={() => setHeroIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>




     

      {groupedEvents.length === 0 ? (
        <div className="empty-results">
          <h3>No events matched your search.</h3>
          <p>Try another keyword, choose a different city, or clear the query.</p>
        </div>
      ) : (
        groupedEvents.map((group) => (
          <section className="type-section" key={group.typeKey}>
            <div className="type-row-head">
              <h3>{group.label}</h3>
              <Link to={buildViewAllLink(group.typeKey)} className="view-all-link">
                View all
              </Link>
            </div>

            <div className="event-row-shell">
              {rowArrows[group.typeKey]?.showLeft && (
                <button
                  type="button"
                  className="row-arrow left"
                  aria-label={`Scroll ${group.label} left`}
                  onClick={() => scrollRowBy(group.typeKey, -1)}
                >
                  <FaChevronLeft />
                </button>
              )}

              <div
                className="event-row"
                ref={(el) => {
                  rowRefs.current[group.typeKey] = el;
                }}
                onScroll={() => updateArrowState(group.typeKey)}
              >
                {group.previewItems.map((event) => (
                  <Link to={`/event/${event._id}`} key={event._id} className="event-card-link">
                    <article className="event-card">
                      <div className="event-poster-wrap">
                        <img
                          src={formatImageUrl(event.eventImage || event.bannerImage || event.venueLayoutImage)}
                          className="event-poster"
                          alt={event.name || event.title}
                        />
                        <div className="event-bottom-strip">{formatEventDate(event.date, event.endDate)}</div>
                      </div>
                      <div className="event-caption">
                        <h4>{event.name || event.title}</h4>
                        <p>{formatTypeLabel(event.type)}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {rowArrows[group.typeKey]?.showRight && (
                <button
                  type="button"
                  className="row-arrow right"
                  aria-label={`Scroll ${group.label} right`}
                  onClick={() => scrollRowBy(group.typeKey, 1)}
                >
                  <FaChevronRight />
                </button>
              )}
            </div>
          </section>
        ))
      )}


      {/* ===== WHY WAHAP — GLASS FEATURE CARDS ===== */}
      <section className="why-section">
        <div className="why-header">
          <span className="why-badge">Why choose us</span>
          <h2 className="why-title">Everything you need for<br />an unforgettable experience</h2>
          <p className="why-subtitle">WAHAP brings curated events, venue maps, and QR entry — all in one place.</p>
        </div>

        <div className="why-grid">
          <div className="glass-card">
            <div className="glass-card-icon" style={{ background: 'linear-gradient(135deg,#ff0844,#ff4b2b)' }}>
              <FaRegCalendarAlt />
            </div>
            <h3>Curated Events</h3>
            <p>Handpicked concerts, festivals, workshops, and more from top organizers.</p>
          </div>

          <div className="glass-card glass-card--accent">
            <div className="glass-card-icon" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              <FaMapMarkedAlt />
            </div>
            <h3>Venue Maps</h3>
            <p>Navigate venues with interactive stall maps and find your way around.</p>
          </div>

          <div className="glass-card">
            <div className="glass-card-icon" style={{ background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)' }}>
              <FaQrcode />
            </div>
            <h3>QR-Based Entry</h3>
            <p>Enter events with a unique QR code — fast, secure, and paperless.</p>
          </div>

          <div className="glass-card">
            <div className="glass-card-icon" style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>
              <FaBolt />
            </div>
            <h3>Instant Discovery</h3>
            <p>Search by city, type, or date and find the perfect event in seconds.</p>
          </div>

          <div className="glass-card glass-card--accent">
            <div className="glass-card-icon" style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
              <FaShieldAlt />
            </div>
            <h3>Verified &amp; Secure</h3>
            <p>Every event is reviewed so you only attend legit, quality experiences.</p>
          </div>

          <div className="glass-card">
            <div className="glass-card-icon" style={{ background: 'linear-gradient(135deg,#ec4899,#f472b6)' }}>
              <FaUsers />
            </div>
            <h3>Community-Driven</h3>
            <p>Join event-lovers who trust WAHAP for their plans every week.</p>
          </div>
        </div>
      </section>


    </div>
  );
}

export default Home;