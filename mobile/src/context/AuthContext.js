import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authApi from '../api/authApi';
import { setBaseApiUrl, getBaseApiUrl } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrlState] = useState(getBaseApiUrl());

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('wahap_user_email');
      const storedName = await AsyncStorage.getItem('wahap_temp_user');
      const storedId = await AsyncStorage.getItem('wahap_user_id');
      const storedUrl = await AsyncStorage.getItem('wahap_custom_api_url');

      if (storedUrl) {
        setApiUrlState(storedUrl);
        setBaseApiUrl(storedUrl);
      }

      if (storedEmail) {
        const isAdmin =
          storedEmail.toLowerCase() === 'admin@wahap.com' ||
          storedEmail.toLowerCase() === 'admin@gmail.com';

        setUser({
          id: storedId,
          email: storedEmail,
          name: storedName || storedEmail.split('@')[0],
          isAdmin,
        });
      }
    } catch (e) {
      console.error('Failed to load session from storage', e);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const res = await authApi.signin(email, password);
    if (res.success && res.user) {
      const userData = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        isAdmin:
          res.user.isAdmin ||
          res.user.email.toLowerCase() === 'admin@wahap.com' ||
          res.user.email.toLowerCase() === 'admin@gmail.com',
      };

      setUser(userData);
      await AsyncStorage.setItem('wahap_user_email', userData.email);
      await AsyncStorage.setItem('wahap_temp_user', userData.name);
      if (userData.id) await AsyncStorage.setItem('wahap_user_id', userData.id);
      return { success: true };
    }
    return { success: false, message: res.message || 'Sign in failed' };
  };

  const signUp = async (name, email, password) => {
    const res = await authApi.signup(name, email, password);
    if (res.success && res.user) {
      const userData = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        isAdmin:
          res.user.isAdmin ||
          res.user.email.toLowerCase() === 'admin@wahap.com' ||
          res.user.email.toLowerCase() === 'admin@gmail.com',
      };

      setUser(userData);
      await AsyncStorage.setItem('wahap_user_email', userData.email);
      await AsyncStorage.setItem('wahap_temp_user', userData.name);
      if (userData.id) await AsyncStorage.setItem('wahap_user_id', userData.id);
      return { success: true };
    }
    return { success: false, message: res.message || 'Sign up failed' };
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('wahap_user_email');
    await AsyncStorage.removeItem('wahap_temp_user');
    await AsyncStorage.removeItem('wahap_user_id');
    await AsyncStorage.removeItem('wahap_token');
  };

  const updateApiUrl = async (newUrl) => {
    if (newUrl) {
      setApiUrlState(newUrl);
      setBaseApiUrl(newUrl);
      await AsyncStorage.setItem('wahap_custom_api_url', newUrl);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: !!user?.isAdmin,
        loading,
        apiUrl,
        updateApiUrl,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
