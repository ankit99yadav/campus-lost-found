import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RiAddCircleFill, RiSearchEyeLine, RiGiftLine, RiCheckboxCircleLine,
  RiTimeLine, RiCoinLine, RiBellLine,
} from 'react-icons/ri';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import ItemCard from '../components/items/ItemCard';

const TAB = { MY_ITEMS: 'my', CLAIMED: 'claimed' };

export default function Dashboard() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [tab, setTab] = useState(TAB.MY_ITEMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await API.get('/users/me/items');
        const all = res.data.items || [];
        setItems(all);
        setStats({
          total: all.length || 0,
          resolved: all.filter((i) => i.status === 'resolved').length || 0,
          pending: all.filter((i) => i.status === 'pending').length || 0,
        });
      } catch {
        setItems([]);
        setStats({ total: 0, resolved: 0, pending: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const displayed = tab === TAB.MY_ITEMS ? items : items.filter((i) => i.claimedBy);

  const handleItemNotFound = (itemId) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item._id !== itemId);
      // Recalculate stats after item removed
      setStats({
        total: updated.length,
        resolved: updated.filter((i) => i.status === 'resolved').length,
        pending: updated.filter((i) => i.status === 'pending').length,
      });
      return updated;
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-secondary-600 p-6 md:p-7 mb-8 text-white shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Dashboard</h1>
            <p className="text-primary-100 text-sm mt-1">Welcome back, <strong className="text-white">{user?.name}</strong>!</p>
          </div>
          <div className="flex gap-3">
            <Link to="/report/lost" className="btn !bg-white !text-primary-700 hover:!bg-primary-50 flex items-center gap-2">
              <RiSearchEyeLine className="w-4 h-4" /> Report Lost
            </Link>
            <Link to="/report/found" className="btn !bg-white/20 !text-white border border-white/40 hover:!bg-white/30 flex items-center gap-2">
              <RiGiftLine className="w-4 h-4" /> Report Found
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Reports', value: stats.total, icon: '📋', color: 'bg-blue-50 text-blue-700 border-blue-100' },
          { label: 'Resolved', value: stats.resolved, icon: '✅', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: 'bg-amber-50 text-amber-700 border-amber-100' },
          { label: 'Token Balance', value: user?.tokenBalance || 0, icon: '🪙', color: 'bg-purple-50 text-purple-700 border-purple-100' },
        ].map((s) => (
          <div key={s.label} className={`card ${s.color} border`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-2xl font-extrabold">{(s.value ?? 0).toLocaleString()}</p>
            <p className="text-sm opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link to="/chat" className="card card-hover flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <RiBellLine className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Messages</p>
            <p className="text-xs text-gray-400">Open chats with others</p>
          </div>
        </Link>
        <Link to="/profile" className="card card-hover flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
            <RiCoinLine className="w-5 h-5 text-secondary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Token History</p>
            <p className="text-xs text-gray-400">View your earnings</p>
          </div>
        </Link>
        <Link to="/items" className="card card-hover flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Browse Items</p>
            <p className="text-xs text-gray-400">Search lost & found</p>
          </div>
        </Link>
      </div>

      {/* My Items */}
      <div>
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          {[
            { key: TAB.MY_ITEMS, label: 'My Reports' },
            { key: TAB.CLAIMED, label: 'Claimed Items' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${tab === t.key ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><span className="w-8 h-8 spinner" /></div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-medium">No items yet</p>
            <div className="flex gap-3 justify-center mt-4">
              <Link to="/report/lost" className="btn-primary btn-sm">Report Lost</Link>
              <Link to="/report/found" className="btn-outline btn-sm">Report Found</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((item) => (
              <ItemCard key={item._id} item={item} onItemNotFound={handleItemNotFound} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
