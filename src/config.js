const API_BASE = import.meta.env.VITE_API_DOMAIN || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3002' : '/api');

export default API_BASE;

