export const EVENT_TYPES = [
  { value: "amusement-park", label: "Amusement Parks" },
  { value: "comedy", label: "Laughter Shows" },
  { value: "music", label: "Music" },
  { value: "theatre", label: "Theatre" },
  { value: "fest", label: "Fests" },
  { value: "exhibition", label: "Exhibitions" },
  { value: "sports", label: "Sports" },
  { value: "workshop", label: "Workshops" },
  { value: "conference", label: "Conferences" },
  { value: "kids", label: "Kids" },
  { value: "movies", label: "Movies" },
  { value: "food", label: "Food & Culinary" },
  { value: "nightlife", label: "Nightlife" },
  { value: "wedding", label: "Weddings" },
  { value: "community", label: "Community" }
];

export const EVENT_TYPE_LABELS = EVENT_TYPES.reduce((acc, typeItem) => {
  acc[typeItem.value] = typeItem.label;
  return acc;
}, {});

export const normalizeType = (value = "") => value.toLowerCase().trim();

export const formatTypeLabel = (typeValue = "") => {
  const normalized = normalizeType(typeValue);
  if (!normalized) return "Others";
  if (EVENT_TYPE_LABELS[normalized]) return EVENT_TYPE_LABELS[normalized];

  return normalized
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
};
