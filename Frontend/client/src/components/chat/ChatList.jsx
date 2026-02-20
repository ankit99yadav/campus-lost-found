import { RiChat3Line } from 'react-icons/ri';

export default function ChatList({ chats, activeChatId, onSelect, currentUserId }) {
  if (chats.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 px-4 text-center">
        <RiChat3Line className="w-10 h-10 mb-3 opacity-30" />
        <p className="font-medium text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Start a chat from an item page</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 overflow-y-auto h-full">
      {chats.map((chat) => {
        const other = chat.otherParticipant;
        // unreadCount is a Map-like object keyed by userId; extract current user's count
        const rawUnread = chat.unreadCount;
        const unread = typeof rawUnread === 'number' ? rawUnread : (rawUnread && currentUserId ? (rawUnread[currentUserId] || 0) : 0);
        const isActive = chat._id === activeChatId;

        return (
          <button
            key={chat._id}
            onClick={() => onSelect(chat)}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${isActive ? 'bg-primary-50 border-r-2 border-primary-500' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center text-primary-600 font-bold text-sm">
                  {other?.avatar?.url ? (
                    <img src={other.avatar.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    other?.name?.[0]?.toUpperCase()
                  )}
                </div>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {other?.name}
                  </p>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {chat.relatedItem?.title ? `re: ${chat.relatedItem.title}` : 'Campus Lost & Found'}
                </p>
                {chat.lastMessage && (
                  <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                    {chat.lastMessage.content}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
