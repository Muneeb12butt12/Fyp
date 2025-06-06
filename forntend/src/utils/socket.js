import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
  withCredentials: true,
  autoConnect: false, // We'll manually connect after auth
});

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
  return socket;
};

export default socket;