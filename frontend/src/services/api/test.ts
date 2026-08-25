import axios from 'axios';

export const testBackend = async () => {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  const response = await axios.get(
    `${backendUrl}/health`
  );

  return response.data;
};