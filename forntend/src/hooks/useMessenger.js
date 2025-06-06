import { useEffect, useState } from 'react';
import axios from 'axios';
import { connectSocket } from '../utils/socket';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

export default function useMessenger() {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState({
    conversations: false,
    messages: false,
    sending: false
  });
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Add auth token to all requests
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Initialize socket and check auth status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    if (token) {
      const newSocket = connectSocket(token);
      setSocket(newSocket);

      // Socket event listeners
      newSocket.on('newMessage', (message) => {
        if (message.conversation._id === currentChat?._id) {
          setMessages(prev => [...prev, message]);
        }
        updateConversationList(message);
      });

      return () => {
        newSocket.off('newMessage');
        newSocket.disconnect();
      };
    }
  }, [currentChat]);

  const getConversations = async () => {
    setLoading(prev => ({ ...prev, conversations: true }));
    setError(null);
    
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
    } catch (err) {
      handleAuthError(err);
      setError('Failed to load conversations');
    } finally {
      setLoading(prev => ({ ...prev, conversations: false }));
    }
  };

  const getMessages = async (conversationId) => {
    if (!conversationId) return;
    
    setLoading(prev => ({ ...prev, messages: true }));
    try {
      const { data } = await api.get(`/messages/${conversationId}/messages`);
      setMessages(data);
    } catch (err) {
      handleAuthError(err);
      setError('Failed to load messages');
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChat) return;
    
    setLoading(prev => ({ ...prev, sending: true }));
    try {
      const { data } = await api.post('/messages/send', {
        text: newMessage,
        conversationId: currentChat._id
      });

      setMessages(prev => [...prev, data]);
      updateConversationList(data);
      setNewMessage('');
      
      socket?.emit('newMessage', data);
      
      return data;
    } catch (err) {
      handleAuthError(err);
      setError('Failed to send message');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
    console.error('API Error:', err);
  };

  const updateConversationList = (newMessage) => {
    setConversations(prev => 
      prev.map(conv => 
        conv._id === newMessage.conversation._id
          ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
          : conv
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  };

  return {
    socket,
    isAuthenticated,
    conversations,
    currentChat,
    messages,
    newMessage,
    setNewMessage,
    setCurrentChat,
    loading,
    error,
    getConversations,
    getMessages,
    sendMessage
  };
}