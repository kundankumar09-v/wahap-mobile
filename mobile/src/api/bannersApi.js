import api from './client';

export const bannersApi = {
  getBanners: async () => {
    const res = await api.get('/api/banners');
    return res.data;
  },

  createBanner: async (formData) => {
    const res = await api.post('/api/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteBanner: async (id) => {
    const res = await api.delete(`/api/banners/${id}`);
    return res.data;
  },

  moveBanner: async (id, direction) => {
    const res = await api.patch(`/api/banners/${id}/move`, { direction });
    return res.data;
  },

  resetBanners: async () => {
    const res = await api.post('/api/banners/reset');
    return res.data;
  },
};

export default bannersApi;
