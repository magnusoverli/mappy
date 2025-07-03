const SESSION_KEY = 'mappy-session';

export function loadSession() {
  const text = localStorage.getItem(SESSION_KEY);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(data) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors (e.g., quota exceeded)
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
