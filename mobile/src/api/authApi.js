import api from './client';

export const authApi = {
  signin: async (email, password) => {
    const res = await api.post('/api/auth/signin', { email, password });
    return res.data;
  },

  signup: async (name, email, password) => {
    const res = await api.post('/api/auth/signup', { name, email, password });
    return res.data;
  },

  getUserById: async (id) => {
    const res = await api.get(`/api/auth/${id}`);
    return res.data;
  },
};

export default authApi;
