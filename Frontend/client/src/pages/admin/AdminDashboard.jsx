import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RiUser3Line, RiBox3Line, RiCheckboxCircleLine, RiTimeLine,
  RiAlertLine, RiBarChart2Line, RiArrowRightLine, RiRefreshLine,
  RiShieldLine, RiEyeLine,
} from 'react-icons/ri';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, itemsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/items?page=1&limit=5'),
        API.get('/admin/users?page=1&limit=5'),
      ]);
      setStats(statsRes.data.stats);
      setRecentItems(itemsRes.data.items || []);
      setRecentUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Admin dashboard error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      toast.error('Dashboard data load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <span className="w-10 h-10 spinner" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error || 'Failed to load dashboard'}</p>
        <button onClick={fetchAll} className="btn-primary btn-sm inline-flex items-center gap-2">
          <RiRefreshLine className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats.users?.total || 0, icon: <RiUser3Line className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600', link: '/admin/users' },
    { label: 'Total Items', value: stats.items?.total || 0, icon: <RiBox3Line className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600', link: '/admin/items' },
    { label: 'Pending Approval', value: stats.items?.pending || 0, icon: <RiTimeLine className="w-6 h-6" />, color: 'bg-amber-50 text-amber-600', link: '/admin/items?status=pending' },
    { label: 'Resolved', value: stats.items?.resolved || 0, icon: <RiCheckboxCircleLine className="w-6 h-6" />, color: 'bg-emerald-50 text-emerald-600', link: '/admin/items?status=resolved' },
    { label: 'Lost Items', value: stats.items?.lost || 0, icon: <RiAlertLine className="w-6 h-6" />, color: 'bg-red-50 text-red-600', link: '/admin/items?type=lost' },
    { label: 'Found Items', value: stats.items?.found || 0, icon: <RiBarChart2Line className="w-6 h-6" />, color: 'bg-indigo-50 text-indigo-600', link: '/admin/items?type=found' },
  ];

  const STATUS_COLOR = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    resolved: 'bg-blue-100 text-blue-700',
    disputed: 'bg-orange-100 text-orange-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title">Admin Dashboard</h1>
        <button onClick={fetchAll} className="btn-outline btn-sm flex items-center gap-1.5">
          <RiRefreshLine className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {cards.map((c) => (
          <Link key={c.label} to={c.link} className={`card card-hover ${c.color} border-0`}>
            <div className="flex items-center justify-between mb-3">
              <span className="opacity-70">{c.icon}</span>
              <RiArrowRightLine className="w-4 h-4 opacity-40" />
            </div>
            <p className="text-3xl font-extrabold">{c.value}</p>
            <p className="text-sm opacity-70 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <Link to="/admin/items?status=pending" className="card card-hover bg-amber-50 border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Pending Items</h3>
              <p className="text-sm text-amber-700">Review and approve {stats.items?.pending || 0} pending items</p>
            </div>
            <RiArrowRightLine className="w-6 h-6 text-amber-600" />
          </div>
        </Link>

        <Link to="/admin/users" className="card card-hover bg-blue-50 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Manage Users</h3>
              <p className="text-sm text-blue-700">View and manage {stats.users?.total || 0} registered users</p>
            </div>
            <RiArrowRightLine className="w-6 h-6 text-blue-600" />
          </div>
        </Link>
      </div>

      {/* Recent Activity Stats */}
      <div className="card mb-10">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Activity (Last 7 Days)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{stats.users?.recentNew || 0}</p>
            <p className="text-sm text-gray-500 mt-1">New Users</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{stats.items?.recentNew || 0}</p>
            <p className="text-sm text-gray-500 mt-1">New Items</p>
          </div>
        </div>
      </div>

      {/* Recent Items Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Items</h2>
            <Link to="/admin/items" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <RiArrowRightLine className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentItems.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No items yet</p>
          ) : (
            <div className="space-y-3">
              {recentItems.map((item) => (
                <Link key={item._id} to={`/items/${item._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                    {item.images?.[0]?.url ? (
                      <img src={item.images[0].url} className="w-full h-full object-cover" />
                    ) : (
                      item.type === 'lost' ? '🔍' : '📦'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.reportedBy?.name} · {new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge text-xs capitalize ${item.type === 'lost' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {item.type}
                    </span>
                    <span className={`badge text-xs capitalize ${STATUS_COLOR[item.status] || 'bg-gray-100 text-gray-600'}`}>
                      {item.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Users</h2>
            <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <RiArrowRightLine className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No users yet</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0 overflow-hidden">
                    {u.avatar?.url ? (
                      <img src={u.avatar.url} className="w-full h-full object-cover" />
                    ) : u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge text-xs capitalize ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' && <RiShieldLine className="w-3 h-3 mr-0.5 inline" />}{u.role}
                    </span>
                    {u.isBanned ? (
                      <span className="badge bg-red-100 text-red-600 text-xs">Banned</span>
                    ) : (
                      <span className="badge bg-emerald-100 text-emerald-600 text-xs">Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
