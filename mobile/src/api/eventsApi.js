import api from './client';

export const eventsApi = {
  getEvents: async (params = {}) => {
    const cleanParams = {};
    if (params.city && params.city !== 'All') cleanParams.city = params.city;
    if (params.type && params.type !== 'All') cleanParams.type = params.type;
    if (params.query) cleanParams.query = params.query;

    const res = await api.get('/api/events', { params: cleanParams });
    return res.data;
  },

  getEventById: async (id) => {
    const res = await api.get(`/api/events/${id}`);
    return res.data;
  },

  createEvent: async (formData) => {
    const res = await api.post('/api/events/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateEvent: async (id, formData) => {
    const res = await api.put(`/api/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteEvent: async (id) => {
    const res = await api.delete(`/api/events/${id}`);
    return res.data;
  },
};

export default eventsApi;
