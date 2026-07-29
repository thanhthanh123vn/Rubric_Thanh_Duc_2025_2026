const BROWSER_ID_STORAGE_KEY = "lms_browser_id";

function createBrowserId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `browser-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getBrowserId() {
  const existingBrowserId = localStorage.getItem(BROWSER_ID_STORAGE_KEY);
  if (existingBrowserId && existingBrowserId.trim().length > 0) {
    return existingBrowserId;
  }

  const nextBrowserId = createBrowserId();
  localStorage.setItem(BROWSER_ID_STORAGE_KEY, nextBrowserId);
  return nextBrowserId;
}
let isTokenInitializedInThisTab = false;

export const getBrowserToken = (): string => {
  let token = sessionStorage.getItem('tab_device_token');


  if (!token || !isTokenInitializedInThisTab) {
    token = 'tab_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('tab_device_token', token);
    isTokenInitializedInThisTab = true;
  }

  return token;
}