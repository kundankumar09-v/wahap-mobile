import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";
import { MapContainer, ImageOverlay, SVGOverlay, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./AdminMapeditor.css";
import "../components/VenueMap.css";

const BG_SVG = (() => {
  const W = 800, H = 800, rw = 32;
  const xs = [0, 200, 400, 600, W];
  let s = `<rect width="${W}" height="${H}" fill="#E35D50"/>`;
  for (let r = 0; r < xs.length - 1; r++) {
    for (let c = 0; c < xs.length - 1; c++) {
      const bx = xs[c] + rw, by = xs[r] + rw;
      const bw = xs[c+1] - xs[c] - rw*2, bh = xs[r+1] - xs[r] - rw*2;
      if (bw > 0 && bh > 0) {
        s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#DC5548" rx="12" />`;
      }
    }
  }
  xs.forEach(x => s += `<rect x="${x}" y="0" width="${rw}" height="${H}" fill="#F07164"/>`);
  xs.forEach(y => s += `<rect x="0" y="${y}" width="${W}" height="${rw}" fill="#F07164"/>`);
  s += `<rect x="${W-rw}" y="0" width="${rw}" height="${H}" fill="#F07164"/>`;
  s += `<rect x="0" y="${H-rw}" width="${W}" height="${rw}" fill="#F07164"/>`;
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


function MapClickHandler({ setClickPos }) {
  useMapEvents({
    click(e) {
      const snapPoints = [12.5, 37.5, 62.5, 87.5];
      const snap = (v) => snapPoints.reduce((p, c) => Math.abs(c - v) < Math.abs(p - v) ? c : p);
      
      let rawX = Math.max(0, Math.min(100, e.latlng.lng));
      let rawY = Math.max(0, Math.min(100, 100 - e.latlng.lat));
      
      setClickPos({ x: snap(rawX), y: snap(rawY) });
    },
  });
  return null;
}

const mapBounds = [[0, 0], [100, 100]];

function AdminMapEditor() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();

  // 🔥 read layout from URL
  const layoutImage = searchParams.get("layout");

  const [stalls, setStalls] = useState([]);
  const [clickPos, setClickPos] = useState(null);
  const [stallName, setStallName] = useState("");
  const [stallType, setStallType] = useState("stall");
  const [map, setMap]             = useState(null);

  // 🧪 DEBUG
  const handleAutoFit = useCallback(() => {
    if (map) {
      map.flyToBounds(mapBounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [map]);

  useEffect(() => {
    handleAutoFit();
    if (map) {
      map.on('popupclose', handleAutoFit);
      return () => { map.off('popupclose', handleAutoFit); };
    }
  }, [map, handleAutoFit]);

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/stalls/${eventId}`);
        setStalls(res.data);
      } catch (err) {
        console.error("Error fetching stalls:", err);
      }
    };
    if (eventId) fetchStalls();
  }, [eventId]);

  useEffect(() => {
    const handleResize = () => map?.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  const getIcon = (type, name = "") => {
    const c = {
      stall:   { emoji: "🛍️", color: "#ffffff", labelColor: "#E35D50" },
      stage:   { emoji: "🎤", color: "#FFEAA7", labelColor: "#FDCB6E" },
      restroom:{ emoji: "🚻", color: "#55EFC4", labelColor: "#00B894" },
      food:    { emoji: "🍔", color: "#FAB1A0", labelColor: "#E17055" },
      entry:   { emoji: "🚪", color: "#E056FD", labelColor: "#BE2EDD" },
      exit:    { emoji: "🏁", color: "#C8D6E5", labelColor: "#576574" },
      help:    { emoji: "🧭", color: "#FEEAA7", labelColor: "#F39C12" },
      pointer: { emoji: "📍", color: "#ffffff", labelColor: "#E35D50" },
    }[type] || { emoji: "📍", color: "#ffffff", labelColor: "#E35D50" };
    return L.divIcon({
      className: "",
      html: `
        <div class="vm-marker-wrap">
          ${name ? `<div class="vm-room-label" style="--label-color:${c.labelColor}">${name}</div>` : ""}
          <div class="vm-iso-building">
            <div class="vm-iso-roof" style="--bg:${c.color}">
               <span class="vm-room-emoji">${c.emoji}</span>
            </div>
            <div class="vm-iso-face-front" style="--bg:${c.color}"></div>
            <div class="vm-iso-face-side" style="--bg:${c.color}"></div>
          </div>
        </div>`,
      iconSize: [80, 80],
      iconAnchor: [40, 60],
      popupAnchor: [0, -70],
    });
  };

  // ✅ save stall
  const addStall = async () => {
    if (!clickPos || !stallName.trim()) {
      alert("Click map and enter name");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/stalls/add`, {
        eventId,
        name: stallName,
        type: stallType,
        x: clickPos.x,
        y: clickPos.y,
      });

      // update locally with the returned stall (including _id)
      setStalls((prev) => [
        ...prev,
        res.data.stall,
      ]);

      setStallName("");
      setClickPos(null);
      alert("✅ Stall added successfully");
    } catch (err) {
      console.error("STALL SAVE ERROR:", err);
      alert("Error saving stall");
    }
  };

  // 🗑️ delete stall
  const deleteStall = async (stallId, stallName) => {
    if (!window.confirm(`Delete "${stallName}"?`)) return;
    
    // Remove from UI immediately
    setStalls((prev) => prev.filter((s) => s._id !== stallId));
    
    // Try to delete from backend
    try {
      await axios.delete(`${API_URL}/api/stalls/delete/${stallId}`);
      console.log("✅ Stall deleted from database");
    } catch (err) {
      console.warn("⚠️ Backend delete failed, but UI updated:", err.message);
      // Stall is already removed from UI, so we're good
    }
  };

  // 🚨 guard: no layout
  if (!layoutImage) {
    return (
      <div style={{ padding: "20px" }}>
        <h3>❌ Layout not found</h3>
        <p>Make sure event creation redirect worked.</p>
      </div>
    );
  }








  return (
    <div className="map-editor-container">
      {/* 🗺️ MAP */}
      <div className="map-editor-wrapper">
        <MapContainer
          center={[50, 50]}
          zoom={2}
          crs={L.CRS.Simple}
          minZoom={0}
          maxZoom={4}
          style={{ height: "100%", width: "100%", backgroundColor: "transparent" }}
          bounds={mapBounds}
          maxBounds={[[ -20, -20 ], [ 120, 120 ]]} // Allow some dragging outside but bounce back
          ref={setMap}
        >
          {/* Beige block-map — always shown */}
          <ImageOverlay url={BG_SVG} bounds={mapBounds} />

          {/* Dynamic Selection indicator */}
          <SVGOverlay bounds={mapBounds} attributes={{ style: "overflow:visible;pointer-events:none" }}>
            {clickPos && (
              <g>
                <rect x={clickPos.x - 6} y={(100 - clickPos.y) - 6} width={12} height={12} fill="white" fillOpacity="0.4" rx="2" />
                <rect x={clickPos.x - 8.5} y={(100 - clickPos.y) - 8.5} width={17} height={17} fill="none" stroke="white" strokeWidth="0.8" strokeDasharray="2,2"/>
              </g>
            )}
          </SVGOverlay>

          <MapClickHandler setClickPos={setClickPos} />

          {/* 🔴 saved markers */}
          {stalls.map((s, i) => (
            <Marker key={i} position={[100 - s.y, s.x]} icon={getIcon(s.type, s.name)}>
              <Popup autoPan={true} autoPanPadding={[20, 100]}>
                <strong>{s.name}</strong> <br /> 
                <span style={{ textTransform: "capitalize" }}>{s.type}</span>
                <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => deleteStall(s._id, s.name)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#ff6b6b",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    ✕ Delete
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 🟢 temporary click marker */}
          {clickPos && (
            <Marker position={[100 - clickPos.y, clickPos.x]} icon={getIcon("pointer")}>
              <Popup autoPan={true} autoPanPadding={[20, 100]}>New Element Here</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* 🎛️ SIDE PANEL */}
      <div className="map-sidebar">
        <h3>Design Venue</h3>

        <input
          placeholder="Element Name"
          value={stallName}
          onChange={(e) => setStallName(e.target.value)}
          className="map-input"
        />

        <select
          value={stallType}
          onChange={(e) => setStallType(e.target.value)}
          className="map-select"
        >
          <option value="stall">🛍️ Stall</option>
          <option value="stage">🎤 Stage</option>
          <option value="restroom">🚻 Restroom</option>
          <option value="food">🍔 Food Court</option>
          <option value="entry">🚪 Entry</option>
          <option value="exit">🏁 Exit</option>
          <option value="help">🧭 Help Desk</option>
        </select>

        <button 
          onClick={addStall} 
          className="map-save-btn"
        >
          Save to Map
        </button>

        {clickPos ? (
          <div className="status-box status-success">
            ✅ Highlighted location perfectly captured! Start typing the name and save this element.
          </div>
        ) : (
          <div className="status-box status-info">
            👉 Tap precisely where you want to drop a new venue element on your interactive canvas.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMapEditor;