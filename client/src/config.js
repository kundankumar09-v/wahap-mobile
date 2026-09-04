import { Capacitor } from "@capacitor/core";

const getBaseApiUrl = () => {
  // 1. Explicit environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. Custom override in localStorage (useful for physical phone testing)
  try {
    const customUrl = localStorage.getItem("wahap_custom_api_url");
    if (customUrl) return customUrl;
  } catch (e) {
    // ignore
  }

  // 3. Android native emulator loopback
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
    return "http://10.0.2.2:5000";
  }

  // 4. Default web development loopback
  return "http://localhost:5000";
};

const API_URL = getBaseApiUrl();

// For real Google Login to work, replace this with your own Client ID
export const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

export default API_URL;
