import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  RiSearchLine, RiMoreLine, RiCheckLine,
  RiCloseLine, RiAlertLine, RiEyeLine,
} from 'react-icons/ri';
import API from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  resolved: 'bg-blue-100 text-blue-700',
  disputed: 'bg-orange-100 text-orange-700',
};

export default function AdminItems() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);

  const fetchItems = async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 20 });
      if (query) params.set('search', query);
      if (statusFilter) params.set('status', statusFilter);
      const res = await API.get(`/admin/items?${params}`);
      setItems(res.data.items || []);
      setTotalPages(res.data.pagination?.total || 1);
      setPage(pg);
    } catch {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [statusFilter]);

  const handleAction = async (id, action) => {
    try {
      const endpoint = `/admin/items/${id}/${action}`;
      const res = await API.patch(endpoint);
      toast.success(res.data.message || `Item ${action}d`);
      fetchItems(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
    setOpenMenu(null);
  };

  return (
    <div>
      <h1 className="page-title mb-6">Manage Items</h1>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <form onSubmit={(e) => { e.preventDefault(); fetchItems(1); }} className="flex gap-2">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" className="input pl-9 w-60" placeholder="Search items…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary btn-sm">Search</button>
        </form>
        <select className="input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="resolved">Resolved</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><span className="w-8 h-8 spinner" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Reporter</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {item.images?.[0]?.url ? (
                        <img src={item.images[0].url} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                          {item.type === 'lost' ? '🔍' : '📦'}
                        </div>
                      )}
                      <p className="font-medium text-gray-900 truncate max-w-[160px]">{item.title}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge text-xs uppercase font-bold ${item.type === 'lost' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{item.category}</td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.reportedBy?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{item.reportedBy?.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(item.dateLostFound).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className={`badge text-xs capitalize ${STATUS_COLOR[item.status] || 'bg-gray-100 text-gray-600'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right relative">
                    <button onClick={() => setOpenMenu(openMenu === item._id ? null : item._id)}
                      className="text-gray-400 hover:text-gray-600">
                      <RiMoreLine className="w-5 h-5" />
                    </button>
                    {openMenu === item._id && (
                      <div className="absolute right-5 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 animate-fade-in">
                        <Link to={`/items/${item._id}`}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                          <RiEyeLine className="w-4 h-4 text-primary-500" /> View Details
                        </Link>
                        {item.status === 'pending' && (
                          <>
                            <button onClick={() => handleAction(item._id, 'approve')}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                              <RiCheckLine className="w-4 h-4 text-emerald-500" /> Approve
                            </button>
                            <button onClick={() => handleAction(item._id, 'reject')}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                              <RiCloseLine className="w-4 h-4 text-red-500" /> Reject
                            </button>
                          </>
                        )}
                        <button onClick={() => handleAction(item._id, 'dispute')}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                          <RiAlertLine className="w-4 h-4 text-orange-500" /> Mark Disputed
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button key={pg} onClick={() => fetchItems(pg)}
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
