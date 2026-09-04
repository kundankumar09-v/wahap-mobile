import axios from "axios";
import API_URL from "../config";

export const DEFAULT_HERO_BANNERS = [
  {
    id: "banner-1",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1400&h=460",
    alt: "Crowd enjoying a live show",
  },
  {
    id: "banner-2",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&h=460",
    alt: "Music performance stage",
  },
  {
    id: "banner-3",
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1400&h=460",
    alt: "Festival lights and audience",
  },
];

const normalizeBanners = (items = []) =>
  items
    .map((item, idx) => ({
      _id: item._id || item.id || `banner-${idx + 1}`,
      image: item.image || "",
      alt: item.alt || `Hero banner ${idx + 1}`,
    }))
    .filter((item) => item.image);

export const fetchHeroBanners = async () => {
  const res = await axios.get(`${API_URL}/api/banners`);
  const normalized = normalizeBanners(res.data);
  return normalized.length > 0 ? normalized : DEFAULT_HERO_BANNERS;
};

export const addHeroBanner = async ({ image, alt }) => {
  const res = await axios.post(`${API_URL}/api/banners`, { image, alt });
  const normalized = normalizeBanners(res.data);
  return normalized.length > 0 ? normalized : DEFAULT_HERO_BANNERS;
};

export const deleteHeroBanner = async (id) => {
  const res = await axios.delete(`${API_URL}/api/banners/${id}`);
  const normalized = normalizeBanners(res.data);
  return normalized.length > 0 ? normalized : DEFAULT_HERO_BANNERS;
};

export const moveHeroBanner = async (id, direction) => {
  const res = await axios.patch(`${API_URL}/api/banners/${id}/move`, { direction });
  const normalized = normalizeBanners(res.data);
  return normalized.length > 0 ? normalized : DEFAULT_HERO_BANNERS;
};

export const resetHeroBanners = async () => {
  const res = await axios.post(`${API_URL}/api/banners/reset`);
  const normalized = normalizeBanners(res.data);
  return normalized.length > 0 ? normalized : DEFAULT_HERO_BANNERS;
};
