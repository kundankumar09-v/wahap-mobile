import api from './client';

export const stallsApi = {
  getStallsByEvent: async (eventId) => {
    const res = await api.get(`/api/stalls/${eventId}`);
    return res.data;
  },

  addStall: async (stallData) => {
    const res = await api.post('/api/stalls/add', stallData);
    return res.data;
  },

  deleteStall: async (stallId) => {
    const res = await api.delete(`/api/stalls/delete/${stallId}`);
    return res.data;
  },
};

export default stallsApi;
