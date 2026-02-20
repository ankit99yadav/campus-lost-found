import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RiMapPinLine, RiCalendarLine, RiTimeLine } from 'react-icons/ri';

const STATUS_COLORS = {
  pending: 'badge-pending',
  approved: 'badge-approved',
  resolved: 'badge-resolved',
  rejected: 'badge-rejected',
  disputed: 'badge-disputed',
};

export default function ItemCard({ item, onItemNotFound }) {
  const thumb = item.images?.[0]?.url;
  const location = [item.location?.building, item.location?.area].filter(Boolean).join(', ');

  // On mount, check if item exists (404 = deleted)
  useEffect(() => {
    let ignore = false;
    async function checkItem() {
      try {
        const response = await fetch(`/api/items/${item._id}`);
        if (!response.ok && response.status === 404 && onItemNotFound && !ignore) {
          onItemNotFound(item._id);
        }
      } catch {}
    }
    checkItem();
    return () => { ignore = true; };
  }, [item._id, onItemNotFound]);

  const handleClick = async (e) => {
    try {
      const response = await fetch(`/api/items/${item._id}`);
      if (!response.ok && response.status === 404) {
        e.preventDefault();
        if (onItemNotFound) onItemNotFound(item._id);
      }
    } catch {
      e.preventDefault();
    }
  };

  return (
    <Link
      to={`/items/${item._id}`}
      className="card card-hover group block overflow-hidden !p-0"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {item.type === 'lost' ? '🔍' : '📦'}
          </div>
        )}
        {/* Type badge */}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide shadow-sm ${
            item.type === 'lost'
              ? 'bg-red-500 text-white'
              : 'bg-emerald-500 text-white'
          }`}
        >
          {item.type}
        </span>
        {/* Status badge */}
        <span className={`badge ${STATUS_COLORS[item.status] || 'badge-pending'} absolute top-3 right-3`}>
          {item.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-[11px] text-primary-600 font-semibold uppercase tracking-wide mb-1.5">
          {item.category}
        </p>
        <h3 className="font-bold text-slate-900 text-base mb-1 truncate">{item.title}</h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-3">{item.description}</p>

        <div className="flex flex-col gap-1.5 text-xs text-slate-500">
          {location && (
            <span className="flex items-center gap-1">
              <RiMapPinLine className="w-3.5 h-3.5 text-primary-400" />
              {location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <RiCalendarLine className="w-3.5 h-3.5 text-primary-400" />
            {new Date(item.dateLostFound).toLocaleDateString()}
            {item.timeLostFound && (
              <>
                <RiTimeLine className="w-3.5 h-3.5 ml-1" />
                {item.timeLostFound}
              </>
            )}
          </span>
        </div>

        {item.color && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Color:</span>
            <span className="text-xs font-medium text-slate-700 capitalize">{item.color}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
