import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RiChat3Line } from 'react-icons/ri';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';

export default function ChatPage() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get('/chat');
        const fetched = res.data.chats || [];
        // Attach `otherParticipant` helper
        const processed = fetched.map((c) => ({
          ...c,
          otherParticipant: c.participants?.find((p) => p._id !== user._id),
        }));
        setChats(processed);

        // Auto-select chat if coming from ItemDetail
        const incoming = location.state?.chatId;
        if (incoming) {
          const match = processed.find((c) => c._id === incoming);
          if (match) setActiveChat(match);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="w-10 h-10 spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="page-title mb-4">Messages</h1>
      <div className="flex border border-gray-200 rounded-2xl overflow-hidden bg-white" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Sidebar */}
        <aside className={`w-80 border-r border-gray-100 flex-shrink-0 ${activeChat ? 'hidden md:block' : ''}`}>
          <ChatList chats={chats} activeChatId={activeChat?._id} onSelect={handleSelectChat} currentUserId={user?._id} />
        </aside>

        {/* Chat area */}
        <main className="flex-1 min-w-0">
          {activeChat ? (
            <ChatWindow chat={activeChat} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <RiChat3Line className="w-14 h-14 mb-3 opacity-20" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose one from the sidebar or start a chat from an item page.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
