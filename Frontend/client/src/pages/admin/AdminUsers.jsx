import { useEffect, useState } from 'react';
import {
  RiSearchLine, RiShieldLine, RiMoreLine,
  RiForbidLine, RiCheckLine, RiCoinLine,
} from 'react-icons/ri';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);

  const fetchUsers = async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 20 });
      if (query) params.set('search', query);
      const res = await API.get(`/admin/users?${params}`);
      setUsers(res.data.users || []);
      setTotalPages(res.data.pagination?.total || 1);
      setPage(pg);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleBan = async (userId) => {
    try {
      const res = await API.patch(`/admin/users/${userId}/ban`);
      toast.success(res.data.message);
      fetchUsers(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
    setOpenMenu(null);
  };

  const handleGrantTokens = async (userId) => {
    const amount = prompt('Enter token amount to grant:');
    if (!amount || isNaN(amount)) return;
    try {
      await API.post(`/admin/users/${userId}/tokens`, { amount: Number(amount) });
      toast.success('Tokens granted');
      fetchUsers(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setOpenMenu(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="page-title">Manage Users</h1>
        <form onSubmit={(e) => { e.preventDefault(); fetchUsers(1); }} className="flex gap-2">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" className="input pl-9 w-60" placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary btn-sm">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><span className="w-8 h-8 spinner" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">User ID</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Tokens</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs overflow-hidden">
                        {u.avatar?.url ? (
                          <img src={u.avatar.url} className="w-full h-full object-cover" />
                        ) : u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-600">{u._id}</code>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge text-xs capitalize ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' && <RiShieldLine className="w-3 h-3 mr-1 inline" />}{u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{u.department || '—'}</td>
                  <td className="px-5 py-3 font-semibold text-amber-600">{u.tokenBalance || 0}</td>
                  <td className="px-5 py-3">
                    {u.isBanned ? (
                      <span className="badge bg-red-100 text-red-600 text-xs">Banned</span>
                    ) : (
                      <span className="badge bg-emerald-100 text-emerald-600 text-xs">Active</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right relative">
                    <button onClick={() => setOpenMenu(openMenu === u._id ? null : u._id)}
                      className="text-gray-400 hover:text-gray-600">
                      <RiMoreLine className="w-5 h-5" />
                    </button>
                    {openMenu === u._id && (
                      <div className="absolute right-5 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 animate-fade-in">
                        <button onClick={() => handleToggleBan(u._id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                          {u.isBanned ? <><RiCheckLine className="w-4 h-4 text-emerald-500" /> Unban User</> : <><RiForbidLine className="w-4 h-4 text-red-500" /> Ban User</>}
                        </button>
                        <button onClick={() => handleGrantTokens(u._id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                          <RiCoinLine className="w-4 h-4 text-amber-500" /> Grant Tokens
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button key={pg} onClick={() => fetchUsers(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${pg === page ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                  {pg}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
