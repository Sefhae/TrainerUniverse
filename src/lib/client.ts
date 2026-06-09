import axios from 'axios';

// Auth is now carried by the Supabase session cookie, which the browser sends
// automatically on same-origin requests — so there's no Authorization header to
// attach here anymore. `withCredentials` keeps cookies flowing if the API is
// ever served from a different origin.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export default api;
