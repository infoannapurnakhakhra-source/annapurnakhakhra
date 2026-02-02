/**
 * Safe storage helper to prevent crashes in In-App Browsers (Instagram, Facebook)
 * where localStorage/sessionStorage usage might throw SecurityError.
 */
const safeStorage = {
  getItem: (key, type = "localStorage") => {
    try {
      if (typeof window === "undefined") return null;
      return window[type] ? window[type].getItem(key) : null;
    } catch (e) {
      console.warn(`safeStorage: failed to get ${key}`, e);
      return null;
    }
  },

  setItem: (key, value, type = "localStorage") => {
    try {
      if (typeof window === "undefined") return;
      if (window[type]) {
        window[type].setItem(key, value);
      }
    } catch (e) {
      console.warn(`safeStorage: failed to set ${key}`, e);
    }
  },

  removeItem: (key, type = "localStorage") => {
    try {
      if (typeof window === "undefined") return;
      if (window[type]) {
        window[type].removeItem(key);
      }
    } catch (e) {
      console.warn(`safeStorage: failed to remove ${key}`, e);
    }
  },
};

export default safeStorage;
