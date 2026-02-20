import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RiSearchLine, RiFilterLine } from 'react-icons/ri';
import API from '../services/api';
import ItemCard from '../components/items/ItemCard';
import SearchFilters from '../components/items/SearchFilters';
import { useDebounce } from '../hooks/useDebounce';

const EMPTY_FILTERS = { type: '', category: '', building: '', color: '', dateFrom: '', dateTo: '', status: '' };

export default function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    type: searchParams.get('type') || '',
    status: searchParams.get('status') || '',
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  const fetchItems = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 12 });
      if (debouncedQuery) params.set('search', debouncedQuery);
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

      const res = await API.get(`/items?${params}`);
      setItems(res.data.items || []);
      setTotalPages(res.data.pagination?.total || 1);
      setPage(pg);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filters]);

  useEffect(() => { fetchItems(1); }, [fetchItems]);

  useEffect(() => {
    const urlType = searchParams.get('type') || '';
    if (urlType !== filters.type) {
      setFilters((f) => ({ ...f, type: urlType }));
    }
  }, [searchParams]);

  useEffect(() => {
    if ((filters.type || '') !== (searchParams.get('type') || '')) {
      const params = new URLSearchParams(searchParams);
      if (filters.type) params.set('type', filters.type);
      else params.delete('type');
      setSearchParams(params, { replace: true });
    }
  }, [filters.type]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(1);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setQuery('');
  };

  let heading = 'Browse All Items';
  if (filters.type === 'lost') heading = 'Lost Items';
  else if (filters.type === 'found') heading = 'Found Items';

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="page-title mb-2">{heading}</h1>
        <p className="text-gray-500">Search and filter lost & found items reported on campus.</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, category, brand…"
            className="input pl-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary px-5">Search</button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-outline flex items-center gap-2 lg:hidden ${showFilters ? 'border-primary-500 text-primary-600' : ''}`}
        >
          <RiFilterLine className="w-4 h-4" /> Filters
        </button>
      </form>

      <div className="flex gap-6">
        {/* Sidebar filters — desktop always visible */}
        <aside className={`w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <SearchFilters filters={filters} onChange={(f) => setFilters(f)} onClear={clearFilters} />
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="w-10 h-10 spinner" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">🤷</div>
              <p className="font-medium text-lg">No items found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{items.length} item{items.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {items.map((item) => <ItemCard key={item._id} item={item} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => fetchItems(pg)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        pg === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
