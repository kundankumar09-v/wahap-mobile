import api from './client';

export const visitsApi = {
  recordVisit: async ({ username, stallId, eventId, feedback, rating }) => {
    const res = await api.post('/api/visits/record', {
      username,
      stallId,
      eventId,
      feedback,
      rating,
    });
    return res.data;
  },

  getStallFeedback: async (stallId) => {
    const res = await api.get(`/api/visits/feedback/${stallId}`);
    return res.data;
  },
};

export default visitsApi;
