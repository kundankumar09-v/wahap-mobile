import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import API_URL from "../config";
import "leaflet/dist/leaflet.css";
import "./VenueMap.css";

const TYPE_CFG = {
  stall:    { icon: "🛍️", color: "#ffffff", label: "Stall", labelColor: "#E35D50" },
  stage:    { icon: "🎤", color: "#FFEAA7", label: "Stage", labelColor: "#FDCB6E" },
  restroom: { icon: "🚻", color: "#55EFC4", label: "Restroom", labelColor: "#00B894" },
  food:     { icon: "🍔", color: "#FAB1A0", label: "Food Court", labelColor: "#E17055" },
  entry:    { icon: "🚪", color: "#E056FD", label: "Entry Gate", labelColor: "#BE2EDD" },
  exit:     { icon: "🏁", color: "#C8D6E5", label: "Exit", labelColor: "#576574" },
  help:     { icon: "🧭", color: "#FEEAA7", label: "Help Desk", labelColor: "#F39C12" },
};
const cfg = (t) => TYPE_CFG[t] || { icon: "📍", color: "#ffffff", label: t, labelColor: "#E35D50" };

const BG_SVG = (() => {
  const W = 800, H = 800, rw = 32;
  const xs = [0, 200, 400, 600, W];
  let s = `<rect width="${W}" height="${H}" fill="#E35D50"/>`;
  
  // Ground patches
  for (let r = 0; r < xs.length - 1; r++) {
    for (let c = 0; c < xs.length - 1; c++) {
      const bx = xs[c] + rw, by = xs[r] + rw;
      const bw = xs[c+1] - xs[c] - rw*2, bh = xs[r+1] - xs[r] - rw*2;
      if (bw > 0 && bh > 0) {
        s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#DC5548" rx="12" />`;
      }
    }
  }
  
  // Corridors
  xs.forEach(x => s += `<rect x="${x}" y="0" width="${rw}" height="${H}" fill="#F07164"/>`);
  xs.forEach(y => s += `<rect x="0" y="${y}" width="${W}" height="${rw}" fill="#F07164"/>`);
  s += `<rect x="${W-rw}" y="0" width="${rw}" height="${H}" fill="#F07164"/>`;
  s += `<rect x="0" y="${H-rw}" width="${W}" height="${rw}" fill="#F07164"/>`;
  
  // Decorative trees
  const rng = (seed, mx) => (Math.sin(seed * 9.341) * 0.5 + 0.5) * mx;
  for (let i = 0; i < 90; i++) {
    const sx = rng(i*7+1,W), sy = rng(i*13+3,H);
    const onPath = xs.some(x => Math.abs(x + rw/2 - sx) < rw/2 + 8) || xs.some(y => Math.abs(y + rw/2 - sy) < rw/2 + 8);
    if (!onPath) {
      s += `<ellipse cx="${sx}" cy="${sy+6}" rx="7" ry="3" fill="#B34237" opacity="0.6"/>`;
      s += `<rect x="${sx-1.5}" y="${sy-4}" width="3" height="10" fill="#7A362F" rx="1"/>`;
      s += `<path d="M${sx-7},${sy-1} Q${sx},${sy-16} ${sx+7},${sy-1} Z" fill="#CC4B40" />`;
    }
  }
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${s}</svg>`);
})();

const MAP_BOUNDS = [[0, 0], [100, 100]];

function buildRoutes(from, to) {
  // Corridor snap centers (in the 100-unit map space)
  const snap = [12.5, 37.5, 62.5, 87.5];
  const near = (v) => snap.reduce((p, c) => Math.abs(c-v) < Math.abs(p-v) ? c : p);
  const midX = near((from.x + to.x) / 2);
  const midY = near((from.y + to.y) / 2);
  // Each point is stored as [lat, lng] = [100-y, x] for Leaflet
  // Route 1: horizontal first (bend at midX)
  const p1 = [
    [100 - from.y, from.x],
    [100 - from.y, midX],
    [100 - to.y,   midX],
    [100 - to.y,   to.x],
  ];
  // Route 2: vertical first (bend at midY)
  const p2 = [
    [100 - from.y, from.x],
    [100 - midY,   from.x],
    [100 - midY,   to.x],
    [100 - to.y,   to.x],
  ];
  const diffX = Math.abs(from.x - to.x);
  const diffY = Math.abs(from.y - to.y);
  return (diffX > 1 && diffY > 1) ? [p1, p2] : [p1];
}

const makeIcon = (stall, visited, active, onPath = false) => {
  const c = cfg(stall.type);
  return L.divIcon({
    className: "",
    html: `
      <div class="vm-marker-wrap ${active ? 'vm-active' : ''} ${onPath ? 'vm-on-path' : ''}">
        <div class="vm-room-label" style="--label-color:${c.labelColor}">
          ${stall.name}
          ${visited ? '<span class="vm-visited-badge">✔</span>' : ""}
        </div>
        <div class="vm-iso-building">
          <div class="vm-iso-roof" style="--bg:${c.color}">
             <span class="vm-room-emoji">${c.icon}</span>
          </div>
          <div class="vm-iso-face-front" style="--bg:${c.color}"></div>
          <div class="vm-iso-face-side" style="--bg:${c.color}"></div>
        </div>
      </div>
    `,
    iconSize: [80, 80],
    iconAnchor: [40, 60],
    popupAnchor: [0, -70],
  });
};

const VenueMap = ({ eventId, fullView = false }) => {
  const [stalls, setStalls]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [feedback, setFeedback]         = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [routeStart, setRouteStart]     = useState(null);
  const [routeEnd, setRouteEnd]         = useState(null);
  const [visitedIds, setVisitedIds]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("vm_visited_" + eventId) || "[]"); }
    catch { return []; }
  });
  const [isFullView, setIsFullView]     = useState(fullView);
  const [map, setMap]                   = useState(null);

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    axios.get(`${API_URL}/api/stalls/${eventId}`)
      .then(r => { 
        setStalls(r.data); 
        const e = r.data.find(s => s.type === "entry"); 
        if (e) setRouteStart(e); 
      })
      .catch(console.error).finally(() => setLoading(false));
  }, [eventId]);

  const handleAutoFit = useCallback(() => {
    if (map && stalls.length > 0) {
      const latLngs = stalls.map(s => [100 - s.y, s.x]);
      const contentBounds = L.latLngBounds(latLngs);
      if (latLngs.length === 1) {
        contentBounds.extend([latLngs[0][0] + 5, latLngs[0][1] + 5]);
        contentBounds.extend([latLngs[0][0] - 5, latLngs[0][1] - 5]);
      } else {
        contentBounds.extend(MAP_BOUNDS);
      }
      const padding = window.innerWidth < 768 ? [60, 60] : [150, 150];
      map.flyToBounds(contentBounds, { padding, duration: 1.2 });
    }
  }, [map, stalls]);

  useEffect(() => {
    handleAutoFit();
  }, [handleAutoFit]);

  useEffect(() => {
    if (map) {
      map.on('popupclose', handleAutoFit);
      return () => { map.off('popupclose', handleAutoFit); };
    }
  }, [map, handleAutoFit]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => map?.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  const fetchFeedback = (sid) => axios.get(`${API_URL}/api/visits/feedback/${sid}`).then(r => setFeedbackList(r.data)).catch(console.error);
  const handleSetStart = (stall) => { setRouteStart(stall); alert(`🚩 Start: ${stall.name}`); };
  const handleSetEnd   = (stall) => { setRouteEnd(stall === routeEnd ? null : stall); };
  const handleVisit = async (stall) => {
    const username = localStorage.getItem("wahap_temp_user") || "Anonymous";
    if (!feedback.trim()) return alert("Please write feedback first!");
    await axios.post(`${API_URL}/api/visits/record`, { username, stallId: stall._id, eventId, feedback });
    const updated = [...new Set([...visitedIds, stall._id])];
    setVisitedIds(updated);
    localStorage.setItem("vm_visited_" + eventId, JSON.stringify(updated));
    setFeedback(""); fetchFeedback(stall._id); alert("✅ Marked as visited!");
  };

  // Show all stalls on the active route path
  const getStallsOnPath = () => {
    if (!routeStart || !routeEnd) return [];
    const snap = [12.5, 37.5, 62.5, 87.5];
    const near = (v) => snap.reduce((p, c) => Math.abs(c-v) < Math.abs(p-v) ? c : p);
    
    const startX = routeStart.x, startY = routeStart.y;
    const endX = routeEnd.x, endY = routeEnd.y;
    const midX = near((startX + endX) / 2);
    const midY = near((startY + endY) / 2);
    
    // Get all stalls that are roughly along the path
    const stallsOnPath = stalls.filter(s => {
      if (s._id === routeStart._id || s._id === routeEnd._id) return true;
      
      // Check if stall is along horizontal journey
      if (Math.abs(s.y - startY) < 5 && Math.min(startX, endX) - 10 <= s.x && s.x <= Math.max(startX, endX) + 10) return true;
      
      // Check if stall is along vertical journey
      if (Math.abs(s.x - midX) < 5 && Math.min(startY, endY) - 10 <= s.y && s.y <= Math.max(startY, endY) + 10) return true;
      
      return false;
    });
    
    return stallsOnPath.map(s => s._id);
  };

  const stallsOnActivePath = getStallsOnPath();

  const allPaths = routeStart && !routeEnd
    ? stalls.filter(s => s._id !== routeStart._id).flatMap(s =>
        buildRoutes(routeStart, s).map((pts, idx) => ({
          id: `${s._id}-${idx}`, pts, color: cfg(s.type).color,
          isActive: false,
        })))
    : [];

  const activeRoutes = routeEnd && routeStart ? buildRoutes(routeStart, routeEnd) : [];

  if (loading) return (
    <div className="vm-loading">
      <div className="vm-loading-hex">⬡</div>
      <p>Scanning Venue…</p>
    </div>
  );

  return (
    <div className={`vm-wrapper ${isFullView ? 'vm-full' : 'vm-inline'}`}>
      <div className="vm-legend">
        <span className="vm-legend-title">🗺️ Venue Map</span>
        {Object.entries(TYPE_CFG).map(([t, c]) => (
          <div key={t} className="vm-legend-item">
            <span className="vm-legend-dot" style={{ background: c.color, boxShadow: `0 0 5px ${c.color}` }} />
            {c.label}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="vm-action-btn" onClick={() => setIsFullView(!isFullView)}>
            {isFullView ? "Collapse" : "Adjust Height"}
          </button>
          {routeEnd && <button className="vm-clear-route" onClick={() => setRouteEnd(null)}>✖ Clear</button>}
        </div>
      </div>

      {stalls.length > 0 && (
        <div className="vm-progress-bar">
          <span>🚀 Explored: <strong>{visitedIds.length}</strong> / {stalls.length}</span>
          <div className="vm-progress-track">
            <div className="vm-progress-fill" style={{ width: `${(visitedIds.length/stalls.length)*100}%` }} />
          </div>
        </div>
      )}

      <MapContainer 
        crs={L.CRS.Simple} 
        bounds={MAP_BOUNDS}
        className={`vm-container ${isFullView ? 'vm-full' : ''}`}
        zoomControl 
        scrollWheelZoom={false}
        ref={setMap}>

        <ImageOverlay url={BG_SVG} bounds={MAP_BOUNDS} />

        {/* SVG Zone rooms (removed for 3D marker style) */}

        {/* Faint background paths to all stalls - ONLY show when no destination selected */}
        {!routeEnd && allPaths.map(r => (
          <Polyline key={`fp-${r.id}`} positions={r.pts}
            pathOptions={{
              color: '#ffffff', weight: 3, opacity: 0.35,
              dashArray: '4 8', lineCap: 'round', lineJoin: 'round'
            }}
          />
        ))}

        {/* Active animated route(s) — thick, bright, clearly visible */}
        {activeRoutes.map((pts, idx) => (
          <React.Fragment key={`ar-${idx}`}>
            {/* Strong glow underlayer - ENHANCED */}
            <Polyline positions={pts}
              pathOptions={{
                color: idx === 1 ? '#ff6b00' : '#FFD700',
                weight: 28, opacity: 0.15,
                lineCap: 'round', lineJoin: 'round'
              }}
            />
            {/* Secondary glow */}
            <Polyline positions={pts}
              pathOptions={{
                color: idx === 1 ? '#ff8533' : '#FFED4E',
                weight: 20, opacity: 0.25,
                lineCap: 'round', lineJoin: 'round'
              }}
            />
            {/* Main solid path - THICKER */}
            <Polyline positions={pts}
              pathOptions={{
                color: '#ffffff',
                weight: 8, opacity: 1,
                lineCap: 'round', lineJoin: 'round'
              }}
            />
            {/* Animated dashes overlay */}
            <Polyline positions={pts}
              pathOptions={{
                color: idx === 1 ? '#ff6b00' : '#FFD700', 
                weight: 3, opacity: 0.9,
                dashArray: '6 10', lineCap: 'round', lineJoin: 'round'
              }}
            />
          </React.Fragment>
        ))}

        {stalls.map((s, i) => (
          <Marker key={i} position={[100-s.y, s.x]}
            icon={makeIcon(s, visitedIds.includes(s._id), routeEnd?._id===s._id || routeStart?._id===s._id, stallsOnActivePath.includes(s._id))}
            eventHandlers={{ click: () => fetchFeedback(s._id) }}>
            <Popup maxWidth={280} minWidth={250} autoPan={true} autoPanPadding={[20, 100]}>
              <div className="vm-popup">
                <div className="vm-popup-header" style={{ borderBottom: `1px solid ${cfg(s.type).color}33` }}>
                  <span className="vm-popup-emoji">{cfg(s.type).icon}</span>
                  <div>
                    <h3 className="vm-popup-title">{s.name}</h3>
                    <p className="vm-popup-type" style={{ color: cfg(s.type).color }}>{cfg(s.type).label}</p>
                  </div>
                  {visitedIds.includes(s._id) && <span className="vm-popup-visited-tag">✔ Done</span>}
                  {stallsOnActivePath.includes(s._id) && routeEnd && <span className="vm-popup-route-tag">📍 On Route</span>}
                </div>
                <div className="vm-popup-actions">
                  <div style={{ display:'flex', gap:'6px' }}>
                    <button className="vm-btn vm-btn-start" style={{ flex:1 }} onClick={() => handleSetStart(s)}>🚩 Start</button>
                    <button className="vm-btn vm-btn-nav" style={{ flex:1 }} onClick={() => handleSetEnd(s)}>
                      {routeEnd?._id===s._id ? "✖ Clear" : "🧭 Route"}
                    </button>
                  </div>
                </div>
                <div className="vm-feedback-list">
                  <strong>💬 Reviews</strong>
                  {feedbackList.length===0 ? <p className="vm-no-feedback">No reviews yet!</p>
                    : feedbackList.map((f,j) => (
                      <div key={j} className="vm-feedback-item">
                        <span className="vm-feedback-user">{f.username}</span> {f.feedback}
                      </div>
                    ))}
                </div>
                <div className="vm-visit-form">
                  <textarea className="vm-textarea" placeholder="Share your experience…" value={feedback} onChange={e => setFeedback(e.target.value)}/>
                  <button className="vm-btn vm-btn-submit" onClick={() => handleVisit(s)}>✔ Mark Visited</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default VenueMap;
