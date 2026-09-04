import { getBaseApiUrl } from '../api/client';

export const resolveImageUrl = (path) => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80';
  }
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalized = path.replace(/\\/g, '/');
  const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  const baseUrl = getBaseApiUrl();

  return `${baseUrl}${cleanPath}`;
};

export const formatEventDate = (dateString) => {
  if (!dateString) return 'TBA';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};
