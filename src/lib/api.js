// Central API base for every backend call.
//
// Falls back to same-origin `/api` when REACT_APP_BACKEND_URL is not set:
// in dev the craco dev-server proxies `/api` to the FastAPI backend, and in
// production the API can be served from the same origin (or behind a reverse
// proxy). Without this fallback the template literal produced
// "undefined/api/courses", which silently 404'd.
const raw = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/+$/, "");
export const API = `${raw}/api`;