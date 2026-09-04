import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";
import {
  addHeroBanner,
  DEFAULT_HERO_BANNERS,
  deleteHeroBanner,
  fetchHeroBanners,
  moveHeroBanner,
  resetHeroBanners,
} from "../constants/heroBanners";
import "./ManagerBanners.css";

const getApiErrorMessage = (error, fallback) => {
  const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
  if (serverMessage) return serverMessage;
  if (error?.code === "ERR_NETWORK") return "Cannot reach server. Please start backend on port 5000.";
  return fallback;
};

function ManagerBanners() {
  const [image, setImage] = useState("");
  const [alt, setAlt] = useState("");
  const [banners, setBanners] = useState(DEFAULT_HERO_BANNERS);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);

  const canReset = useMemo(() => {
    if (banners.length !== DEFAULT_HERO_BANNERS.length) return true;

    return banners.some((item, idx) => {
      const fallback = DEFAULT_HERO_BANNERS[idx];
      return item.image !== fallback.image || item.alt !== fallback.alt;
    });
  }, [banners]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  };

  const checkServer = useCallback(async () => {
    try {
      await axios.get(`${API_URL}/api/banners`);
      setServerOnline(true);
      return true;
    } catch {
      setServerOnline(false);
      return false;
    }
  }, []);

  const loadBanners = useCallback(async () => {
    try {
      const apiBanners = await fetchHeroBanners();
      setBanners(apiBanners);
      setServerOnline(true);
    } catch (error) {
      console.error("Failed to load banners:", error);
      setBanners(DEFAULT_HERO_BANNERS);
      setServerOnline(false);
      setMessage(getApiErrorMessage(error, "Could not load server banners. Showing defaults."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!image.trim()) {
      showMessage("Please add a valid image URL.");
      return;
    }

    try {
      const online = await checkServer();
      if (!online) {
        showMessage("Cannot reach server. Start backend and try again.");
        return;
      }

      const updated = await addHeroBanner({
        image: image.trim(),
        alt: alt.trim() || "Website hero banner",
      });

      setBanners(updated);
      setImage("");
      setAlt("");
      showMessage("Banner added.");
    } catch (error) {
      console.error("Failed to add banner:", error);
      showMessage(getApiErrorMessage(error, "Failed to add banner."));
    }
  };

  const handleDelete = async (id) => {
    try {
      const updated = await deleteHeroBanner(id);
      setBanners(updated);
      showMessage("Banner removed.");
    } catch (error) {
      console.error("Failed to delete banner:", error);
      showMessage(getApiErrorMessage(error, "Failed to remove banner."));
    }
  };

  const moveItem = async (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= banners.length) return;

    const targetId = banners[index]._id;
    const moveDirection = direction < 0 ? "up" : "down";

    try {
      const updated = await moveHeroBanner(targetId, moveDirection);
      setBanners(updated);
    } catch (error) {
      console.error("Failed to move banner:", error);
      showMessage(getApiErrorMessage(error, "Failed to reorder banner."));
    }
  };

  const handleReset = async () => {
    try {
      const updated = await resetHeroBanners();
      setBanners(updated);
      showMessage("Banners reset to default.");
    } catch (error) {
      console.error("Failed to reset banners:", error);
      showMessage(getApiErrorMessage(error, "Failed to reset banners."));
    }
  };

  return (
    <div className="manager-page">
      <div className="manager-head">
        <h1>Website Hero Banner Manager</h1>
        <Link to="/" className="manager-back-link">Back to Home</Link>
      </div>

      <p className="manager-note">
        Use this page for website-level banner images (top hero section). Event organizers should only add event-specific posters in event creation.
      </p>

      {!serverOnline && !loading && (
        <p className="manager-note" style={{ color: "#b91c1c", fontWeight: 600 }}>
          Server is offline. Start backend using: npm start (inside server folder)
        </p>
      )}

      <form className="manager-form" onSubmit={handleAdd}>
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Banner image URL"
          required
        />
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Short alt text (optional)"
        />
        <button type="submit">Add Banner</button>
      </form>

      {message && <p className="manager-message">{message}</p>}

      <div className="manager-list">
        {loading && <p className="manager-note">Loading banners...</p>}

        {!loading && banners.map((item, idx) => (
          <article key={item._id || item.id} className="manager-card">
            <img src={item.image} alt={item.alt} />
            <div className="manager-card-body">
              <h3>Banner {idx + 1}</h3>
              <p>{item.alt}</p>
              <div className="manager-actions">
                <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0 || !item._id}>Move Up</button>
                <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx === banners.length - 1 || !item._id}>Move Down</button>
                <button type="button" className="danger" onClick={() => handleDelete(item._id)} disabled={!item._id}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="manager-footer-actions">
        <button type="button" onClick={handleReset} disabled={!canReset}>Reset to Default</button>
      </div>
    </div>
  );
}

export default ManagerBanners;
