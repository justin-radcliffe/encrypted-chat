import { PORT } from '../config/config.js';

export const apiCall = (method, path, payload, successHandler) => {
  let url = `http://localhost:${PORT}/${path}`;
  const req = {
    method: method,
    headers: {
    'Content-type': 'application/json',
    },
  };

  if (['POST', 'PUT'].includes(method)) {
    req.body = JSON.stringify(payload);
  } else {
    url += `?${payload}`;
  }

  return fetch(url, req)
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      throw new Error(data.error);
    } else {
      return successHandler(data);
    }
  });
};