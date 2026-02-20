import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  RiMapPinLine, RiCalendarLine, RiArrowLeftLine, RiChat3Line,
  RiUser3Line, RiCheckboxCircleLine, RiEdit2Line, RiDeleteBinLine,
} from 'react-icons/ri';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'badge-pending', approved: 'badge-approved',
  resolved: 'badge-resolved', rejected: 'badge-rejected', disputed: 'badge-disputed',
};

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/items/${id}`);
        setItem(res.data.item);
      } catch {
        toast.error('Item not found');
        navigate('/items');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleClaim = async () => {
    if (!user) return navigate('/login');
    setClaiming(true);
    try {
      await API.post(`/items/${id}/claim`);
      toast.success('Claim request sent!');
      const res = await API.get(`/items/${id}`);
      setItem(res.data.item);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim');
    } finally {
      setClaiming(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await API.delete(`/items/${id}`);
      toast.success('Item deleted');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleResolve = async () => {
    if (!window.confirm('Mark this item as resolved? This means the item has been returned to its owner.')) return;
    setResolving(true);
    try {
      await API.post(`/items/${id}/resolve`);
      toast.success('Item marked as resolved!');
      const res = await API.get(`/items/${id}`);
      setItem(res.data.item);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve');
    } finally {
      setResolving(false);
    }
  };

  const handleChat = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await API.post('/chat/start', { itemId: id, participantId: item.reportedBy._id });
      navigate('/chat', { state: { chatId: res.data.chat._id } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start chat');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><span className="w-10 h-10 spinner" /></div>;
  if (!item) return null;

  const isOwner = user && item.reportedBy?._id === user._id;
  const isAdmin = user?.role === 'admin';
  const isClaimer = user && item.claimedBy && (item.claimedBy === user._id || item.claimedBy?._id === user._id);
  const canClaim = user && !isOwner && item.status === 'approved' && !item.claimedBy;
  const canChat = user && !isOwner && item.status === 'approved';
  const canResolve = (isOwner || isClaimer || isAdmin) && item.status === 'approved';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 mb-6 text-sm">
        <RiArrowLeftLine className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] mb-3">
            {item.images?.length > 0 ? (
              <img
                src={item.images[currentImg]?.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">
                {item.type === 'lost' ? '🔍' : '📦'}
              </div>
            )}
          </div>
          {item.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {item.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImg ? 'border-primary-500' : 'border-transparent'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
            <div>
              <span className={`badge ${item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'} text-xs font-bold uppercase mr-2`}>
                {item.type}
              </span>
              <span className={`badge ${STATUS_COLORS[item.status]}`}>{item.status}</span>
            </div>
            {(isOwner || isAdmin) && (
              <div className="flex gap-2">
                {isOwner && (
                  <Link to={`/items/${id}/edit`} className="btn-outline btn-sm flex items-center gap-1">
                    <RiEdit2Line className="w-3.5 h-3.5" /> Edit
                  </Link>
                )}
                <button onClick={handleDelete} className="btn-danger btn-sm flex items-center gap-1">
                  <RiDeleteBinLine className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{item.title}</h1>
          <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-4">{item.category}</p>
          <p className="text-gray-600 leading-relaxed mb-6">{item.description}</p>

          <dl className="space-y-3 text-sm mb-6">
            {item.color && (
              <div className="flex gap-3">
                <dt className="font-medium text-gray-500 w-24">Color</dt>
                <dd className="text-gray-900 capitalize">{item.color}</dd>
              </div>
            )}
            {item.brand && (
              <div className="flex gap-3">
                <dt className="font-medium text-gray-500 w-24">Brand</dt>
                <dd className="text-gray-900">{item.brand}</dd>
              </div>
            )}
            <div className="flex gap-3">
              <dt className="font-medium text-gray-500 w-24 flex items-center gap-1">
                <RiMapPinLine className="w-3.5 h-3.5" /> Location
              </dt>
              <dd className="text-gray-900">
                {[item.location?.building, item.location?.floor, item.location?.area].filter(Boolean).join(', ')}
                {item.location?.description && <span className="text-gray-400 ml-1">— {item.location.description}</span>}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="font-medium text-gray-500 w-24 flex items-center gap-1">
                <RiCalendarLine className="w-3.5 h-3.5" /> Date
              </dt>
              <dd className="text-gray-900">
                {new Date(item.dateLostFound).toLocaleDateString()} {item.timeLostFound && `at ${item.timeLostFound}`}
              </dd>
            </div>
            {item.tokenReward > 0 && (
              <div className="flex gap-3">
                <dt className="font-medium text-gray-500 w-24">🪙 Reward</dt>
                <dd className="text-amber-600 font-bold">{item.tokenReward} tokens</dd>
              </div>
            )}
          </dl>

          {/* Reporter */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {item.reportedBy?.avatar?.url ? (
                <img src={item.reportedBy.avatar.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <RiUser3Line className="w-5 h-5 text-primary-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.reportedBy?.name}</p>
              <p className="text-xs text-gray-400">{item.reportedBy?.department}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {/* Claimed indicator */}
            {item.claimedBy && item.status !== 'resolved' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm font-medium text-center">
                ⏳ This item has been claimed — waiting for verification & resolution.
              </div>
            )}

            {/* Resolve button for owner / claimer / admin */}
            {canResolve && (
              <button onClick={handleResolve} disabled={resolving} className="btn-primary btn-lg w-full flex items-center justify-center gap-2 !bg-emerald-600 hover:!bg-emerald-700">
                {resolving ? <><span className="w-5 h-5 spinner" /> Resolving…</> : <><RiCheckboxCircleLine className="w-5 h-5" /> Mark as Resolved</>}
              </button>
            )}

            {/* Claim button for others */}
            {canClaim && (
              <button onClick={handleClaim} disabled={claiming} className="btn-primary btn-lg w-full flex items-center justify-center gap-2">
                {claiming ? <><span className="w-5 h-5 spinner" /> Processing…</> : item.type === 'found' ? <><RiCheckboxCircleLine className="w-5 h-5" /> This is Mine — Claim</> : <><RiCheckboxCircleLine className="w-5 h-5" /> I Found This Item</>}
              </button>
            )}

            {/* Resolved badge */}
            {item.status === 'resolved' && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm font-bold text-center">
                ✅ This item has been resolved!
              </div>
            )}

            {canChat && (
              <button onClick={handleChat} className="btn-outline btn-lg w-full flex items-center justify-center gap-2">
                <RiChat3Line className="w-5 h-5" /> Message Reporter
              </button>
            )}
            {!user && (
              <Link to="/login" className="btn-primary btn-lg w-full text-center">
                Login to Claim or Chat
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
