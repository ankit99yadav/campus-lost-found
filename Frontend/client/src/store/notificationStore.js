import { create } from 'zustand';
import API from '../services/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { data } = await API.get(`/notifications?page=${page}&limit=20`);
      if (page === 1) {
        set({ notifications: data.notifications, unreadCount: data.unreadCount, isLoading: false });
      } else {
        set((state) => ({
          notifications: [...state.notifications, ...data.notifications],
          unreadCount: data.unreadCount,
          isLoading: false,
        }));
      }
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await API.get('/notifications/unread-count');
      set({ unreadCount: data.unreadCount });
    } catch { /* ignore */ }
  },

  markAllAsRead: async () => {
    try {
      await API.patch('/notifications/read', { markAll: true });
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch { /* ignore */ }
  },

  markAsRead: async (ids) => {
    try {
      await API.patch('/notifications/read', { notificationIds: ids });
      set((state) => ({
        notifications: state.notifications.map((n) =>
          ids.includes(n._id) ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - ids.length),
      }));
    } catch { /* ignore */ }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  deleteNotification: async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
      }));
    } catch { /* ignore */ }
  },
}));

export { useNotificationStore };
export default useNotificationStore;
