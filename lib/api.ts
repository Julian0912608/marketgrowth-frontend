// lib/api.ts — Axios client that talks to the Railway backend
import axios from 'axios';

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined'
    ? sessionStorage.getItem('access_token')
    : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Track of we al bezig zijn met refreshen — voorkomt oneindige loop
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// Response interceptor — 401 refresh + 403 upgrade modal
api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;

    // ── 401: probeer token éénmalig te verversen ──────────────
    if (
      error.response?.status === 401 &&
      !original._retry &&
      // Voorkom loop: refresh endpoint zelf nooit opnieuw proberen
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      original._retry = true;

      if (isRefreshing) {
        // Wacht op lopende refresh en probeer daarna opnieuw
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.accessToken;
        sessionStorage.setItem('access_token', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        onRefreshed(newToken);
        isRefreshing = false;
        return api(original);
      } catch {
        isRefreshing = false;
        refreshSubscribers = [];
        sessionStorage.removeItem('access_token');
        // Alleen redirect naar login als we echt in de browser zitten
        // en het geen team/accept pagina is (die heeft eigen flow)
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/team/accept')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    // ── 403 feature_not_available: toon upgrade modal ─────────
    if (
      error.response?.status === 403 &&
      error.response?.data?.error === 'feature_not_available' &&
      typeof window !== 'undefined'
    ) {
      const { feature, requiredPlan, message } = error.response.data;
      window.dispatchEvent(new CustomEvent('upgrade-required', {
        detail: {
          feature,
          requiredPlan: requiredPlan ?? 'growth',
          message:      message ?? 'Deze functie is niet beschikbaar in je huidige plan.',
        },
      }));
      return Promise.reject(error);
    }

    // ── 429 usage_limit_reached: toon upgrade modal ───────────
    if (
      error.response?.status === 429 &&
      error.response?.data?.error === 'usage_limit_reached' &&
      typeof window !== 'undefined'
    ) {
      window.dispatchEvent(new CustomEvent('upgrade-required', {
        detail: {
          feature:      error.response.data.feature ?? 'ai-recommendations',
          requiredPlan: 'growth',
          message:      'Je AI credits zijn op voor deze maand. Upgrade voor meer credits.',
        },
      }));
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
