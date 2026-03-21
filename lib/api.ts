// lib/api.ts — Axios client that talks to the Railway backend
// Wijziging: 403 feature_not_available interceptor toegevoegd
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

// Response interceptor — 401 refresh + 403 upgrade modal
api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;

    // ── 401: probeer token te verversen ──────────────────────
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await api.post('/auth/refresh');
        sessionStorage.setItem('access_token', res.data.accessToken);
        original.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(original);
      } catch {
        sessionStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }

    // ── 403 feature_not_available: toon upgrade modal ────────
    if (
      error.response?.status === 403 &&
      error.response?.data?.error === 'feature_not_available' &&
      typeof window !== 'undefined'
    ) {
      const { feature, upgrade, requiredPlan, message } = error.response.data;
      window.dispatchEvent(
        new CustomEvent('upgrade-required', {
          detail: {
            feature,
            requiredPlan: requiredPlan ?? upgrade ?? 'growth',
            message:      message ?? 'Deze functie is niet beschikbaar in je huidige plan.',
          },
        })
      );
      // Reject zodat de component zelf geen extra error hoeft te tonen
      return Promise.reject(error);
    }

    // ── 429 usage_limit_reached: toon upgrade modal ──────────
    if (
      error.response?.status === 429 &&
      error.response?.data?.error === 'usage_limit_reached' &&
      typeof window !== 'undefined'
    ) {
      window.dispatchEvent(
        new CustomEvent('upgrade-required', {
          detail: {
            feature:      error.response.data.feature ?? 'ai-recommendations',
            requiredPlan: 'growth',
            message:      'Je AI credits zijn op voor deze maand. Upgrade voor meer credits.',
          },
        })
      );
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
