import { useAuthStore } from '../../store/authStore';
import { RiCheckDoubleLine, RiCheckLine } from 'react-icons/ri';

export default function MessageBubble({ message, showAvatar }) {
  const { user } = useAuthStore();
  const isMine = message.sender?._id === user?._id;
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-4 py-1">{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 mb-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isMine && showAvatar ? (
        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0 overflow-hidden">
          {message.sender?.avatar?.url ? (
            <img src={message.sender.avatar.url} alt="" className="w-full h-full object-cover" />
          ) : (
            message.sender?.name?.[0]?.toUpperCase()
          )}
        </div>
      ) : (
        !isMine && <div className="w-7 flex-shrink-0" />
      )}

      <div className={`max-w-xs sm:max-w-sm lg:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        {message.type === 'image' ? (
          <img
            src={message.content}
            alt="Sent image"
            className={`rounded-2xl max-w-full max-h-64 object-cover cursor-pointer ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
            onClick={() => window.open(message.content, '_blank')}
          />
        ) : (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isMine
                ? 'bg-primary-600 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
            }`}
          >
            {message.content}
          </div>
        )}
        <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-gray-400">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMine && (
            message.readBy?.length > 1
              ? <RiCheckDoubleLine className="w-3.5 h-3.5 text-primary-400" />
              : <RiCheckLine className="w-3.5 h-3.5 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}
