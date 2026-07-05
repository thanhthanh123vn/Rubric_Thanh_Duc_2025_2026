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
