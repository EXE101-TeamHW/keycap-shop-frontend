const DEFAULT_BACKEND_URL = 'http://localhost:8080';

export const BACKEND_URL = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, '');
export const API_BASE_URL = `${BACKEND_URL}/api`;
export const WEBSOCKET_URL = `${BACKEND_URL.replace(/^http/, 'ws')}/ws`;
