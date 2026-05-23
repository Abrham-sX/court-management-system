export const resolveMediaUrl = (path?: string | null) => {
  if (!path) return null;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');

  return `${serverBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};
