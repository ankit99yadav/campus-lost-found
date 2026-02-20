import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, token } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Connect to socket
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Notifications
    socket.on('notification', (notification) => {
      addNotification(notification);
      // Show toast
      const icons = {
        item_match: '🎉',
        new_message: '💬',
        item_approved: '✅',
        item_rejected: '❌',
        token_reward: '🏅',
        item_claimed: '📦',
        claim_verified: '✅',
        system: 'ℹ️',
        item_dispute: '⚠️',
      };
      const icon = icons[notification.type] || 'ℹ️';
      toast(`${icon} ${notification.title}`, {
        duration: 5000,
        style: { background: '#1e1b4b', color: '#fff', borderRadius: '12px' },
      });
    });

    // Online users
    socket.on('user_online', ({ userId }) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    socket.on('user_offline', ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.on('online_users', (userIds) => {
      setOnlineUsers(userIds);
    });

    socket.emit('get_online_users');

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token]);

  const joinChat = (chatId) => {
    socketRef.current?.emit('join_chat', chatId);
  };

  const leaveChat = (chatId) => {
    socketRef.current?.emit('leave_chat', chatId);
  };

  const startTyping = (chatId) => {
    socketRef.current?.emit('typing_start', { chatId });
  };

  const stopTyping = (chatId) => {
    socketRef.current?.emit('typing_stop', { chatId });
  };

  const markMessagesRead = (chatId) => {
    socketRef.current?.emit('messages_read', { chatId });
  };

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        onlineUsers,
        isUserOnline,
        joinChat,
        leaveChat,
        startTyping,
        stopTyping,
        markMessagesRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export default SocketContext;
