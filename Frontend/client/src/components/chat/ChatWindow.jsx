import { useEffect, useRef, useState } from 'react';
import { RiSendPlane2Fill, RiImageAddLine, RiCloseLine } from 'react-icons/ri';
import API from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../context/SocketContext';
import MessageBubble from './MessageBubble';
import toast from 'react-hot-toast';

export default function ChatWindow({ chat }) {
  const { user } = useAuthStore();
  const { socket, startTyping, stopTyping, markMessagesRead, isUserOnline } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const bottomRef = useRef(null);
  const fileRef = useRef();
  const typingTimeout = useRef(null);

  const other = chat.otherParticipant;

  // Fetch messages & join room
  useEffect(() => {
    if (!chat._id) return;
    const fetchMessages = async () => {
      try {
        const res = await API.get(`/chat/${chat._id}/messages`);
        setMessages(res.data.messages || []);
        markMessagesRead(chat._id);
      } catch {
        toast.error('Failed to load messages');
      }
    };
    fetchMessages();

    socket?.emit('join_chat', chat._id);
    return () => socket?.emit('leave_chat', chat._id);
  }, [chat._id]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;
    const handleMsg = (msg) => {
      if (msg.chat === chat._id) {
        setMessages((prev) => [...prev, msg]);
        markMessagesRead(chat._id);
      }
    };
    const handleTyping = ({ userId }) => {
      if (userId !== user._id) setIsTyping(true);
    };
    const handleStopTyping = ({ userId }) => {
      if (userId !== user._id) setIsTyping(false);
    };
    socket.on('new_message', handleMsg);
    socket.on('typing_start', handleTyping);
    socket.on('typing_stop', handleStopTyping);
    return () => {
      socket.off('new_message', handleMsg);
      socket.off('typing_start', handleTyping);
      socket.off('typing_stop', handleStopTyping);
    };
  }, [socket, chat._id]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTypingInput = (val) => {
    setInput(val);
    startTyping(chat._id);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => stopTyping(chat._id), 2000);
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !imageFile) return;
    setSending(true);
    try {
      if (imageFile) {
        // Send image via FormData (multer needs multipart)
        const fd = new FormData();
        fd.append('images', imageFile);
        fd.append('type', 'image');
        fd.append('content', input.trim() || '');
        await API.post(`/chat/${chat._id}/messages`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Send text as JSON (no need for FormData)
        await API.post(`/chat/${chat._id}/messages`, {
          content: input.trim(),
          type: 'text',
        });
      }
      setInput('');
      clearImage();
      stopTyping(chat._id);
    } catch {
      toast.error('Message failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white">
        <div className="relative w-10 h-10 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center text-primary-600 font-bold">
            {other?.avatar?.url ? (
              <img src={other.avatar.url} alt="" className="w-full h-full object-cover" />
            ) : (
              other?.name?.[0]?.toUpperCase()
            )}
          </div>
          {isUserOnline(other?._id) && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{other?.name}</p>
          {chat.relatedItem && (
            <p className="text-xs text-gray-400 truncate max-w-[200px]">re: {chat.relatedItem.title}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            showAvatar={i === 0 || messages[i - 1]?.sender?._id !== msg.sender?._id}
          />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-400 text-xs mt-1 pl-2">
            <span className="flex gap-1">
              {[0, 1, 2].map((d) => (
                <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </span>
            {other?.name} is typing…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 pb-2 flex items-start gap-2">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
            <img src={imagePreview} alt="" className="w-full h-full object-cover" />
            <button onClick={clearImage} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5">
              <RiCloseLine className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-white">
        <button type="button" onClick={() => fileRef.current?.click()} className="text-gray-400 hover:text-primary-600 transition-colors">
          <RiImageAddLine className="w-5 h-5" />
        </button>
        <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleImagePick} />
        <input
          type="text"
          value={input}
          onChange={(e) => handleTypingInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 input py-2"
          disabled={!!imageFile}
        />
        <button
          type="submit"
          disabled={sending || (!input.trim() && !imageFile)}
          className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {sending ? <span className="w-4 h-4 spinner border-white" /> : <RiSendPlane2Fill className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
