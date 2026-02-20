import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiBellLine, RiCheckDoubleLine, RiDeleteBinLine, RiCloseLine } from 'react-icons/ri';
import { useNotificationStore } from '../../store/notificationStore';

const TYPE_ICON = {
  item_match: '🔍',
  item_claimed: '📦',
  item_approved: '✅',
  item_rejected: '❌',
  item_resolved: '🎉',
  new_message: '💬',
  token_reward: '🪙',
  claim_verified: '✔️',
  system: '📢',
  item_dispute: '⚠️',
};

export default function NotificationPanel({ onClose }) {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationStore();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationLink = (notif) => {
    if (notif.data?.chatId) return `/chat`;
    if (notif.data?.itemId) return `/items/${notif.data.itemId}`;
    return null;
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) await markAsRead([notif._id]);
    const link = getNotificationLink(notif);
    if (link) {
      navigate(link);
      onClose();
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <RiBellLine className="w-4 h-4 text-primary-600" />
          <span className="font-semibold text-gray-900 text-sm">Notifications</span>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              title="Mark all as read"
            >
              <RiCheckDoubleLine className="w-3.5 h-3.5" />
              All read
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <RiCloseLine className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <span className="w-6 h-6 spinner" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <RiBellLine className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No notifications yet
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notif.isRead ? 'bg-primary-50/50' : ''
              }`}
              onClick={() => handleClick(notif)}
            >
              <span className="text-xl flex-shrink-0">{TYPE_ICON[notif.type] || '📢'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(notif.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif._id);
                }}
                className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors mt-0.5"
                title="Delete"
              >
                <RiDeleteBinLine className="w-3.5 h-3.5" />
              </button>
              {!notif.isRead && (
                <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
