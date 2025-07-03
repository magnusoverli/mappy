const CACHE_NAME = 'mappy-session';
const SESSION_KEY = 'session';

export async function loadSession() {
  if (!('caches' in window)) return null;
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(SESSION_KEY);
  if (!response) return null;
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    await cache.delete(SESSION_KEY);
    return null;
  }
}

export async function saveSession(data) {
  if (!('caches' in window)) return;
  const cache = await caches.open(CACHE_NAME);
  const resp = new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
  await cache.put(SESSION_KEY, resp);
}

export async function clearSession() {
  if (!('caches' in window)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.delete(SESSION_KEY);
}
