import { RiFilterLine, RiCloseLine } from 'react-icons/ri';

const CATEGORIES = [
  'Electronics',
  'Books & Stationery',
  'Clothing & Accessories',
  'ID Cards & Documents',
  'Keys',
  'Bags & Wallets',
  'Jewellery',
  'Sports Equipment',
  'Musical Instruments',
  'Other',
];

const BUILDINGS = [
  'Main Building', 'Library', 'Hostel A', 'Hostel B', 'Canteen',
  'Sports Complex', 'Labs', 'Auditorium', 'Admin Block', 'Other',
];

export default function SearchFilters({ filters, onChange, onClear }) {
  const handle = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <RiFilterLine className="w-4 h-4 text-primary-600" />
          Filters
        </h3>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <RiCloseLine className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="label">Type</label>
        <select className="input" value={filters.type || ''} onChange={handle('type')}>
          <option value="">All</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <select className="input" value={filters.category || ''} onChange={handle('category')}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="label">Building / Location</label>
        <select className="input" value={filters.building || ''} onChange={handle('building')}>
          <option value="">Anywhere</option>
          {BUILDINGS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Color */}
      <div>
        <label className="label">Color</label>
        <input
          type="text"
          className="input"
          placeholder="e.g. Red, Black..."
          value={filters.color || ''}
          onChange={handle('color')}
        />
      </div>

      {/* Date range */}
      <div>
        <label className="label">Date From</label>
        <input
          type="date"
          className="input"
          value={filters.dateFrom || ''}
          onChange={handle('dateFrom')}
        />
      </div>
      <div>
        <label className="label">Date To</label>
        <input
          type="date"
          className="input"
          value={filters.dateTo || ''}
          onChange={handle('dateTo')}
        />
      </div>

      {/* Status */}
      <div>
        <label className="label">Status</label>
        <select className="input" value={filters.status || ''} onChange={handle('status')}>
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="resolved">Resolved</option>
          <option value="pending">Pending</option>
        </select>
      </div>
    </div>
  );
}
