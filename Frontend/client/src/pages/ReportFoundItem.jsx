import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RiGiftLine, RiMapPinLine, RiPaletteLine, RiPriceTagLine,
  RiFileTextLine, RiCalendarLine,
} from 'react-icons/ri';
import API from '../services/api';
import ImageUploader from '../components/items/ImageUploader';
import toast from 'react-hot-toast';

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

const INIT = {
  title: '', description: '', category: '', color: '', brand: '',
  building: '', floor: '', area: '', locationDesc: '',
  dateLostFound: '', timeLostFound: '',
};

export default function ReportFoundItem() {
  const [form, setForm] = useState(INIT);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.dateLostFound) {
      return toast.error('Please fill in title, description, category, and date.');
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('type', 'found');
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      fd.append('location[building]', form.building);
      fd.append('location[floor]', form.floor);
      fd.append('location[area]', form.area);
      fd.append('location[description]', form.locationDesc);
      files.forEach((f) => fd.append('images', f));

      const res = await API.post('/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Found item reported! You may earn tokens when it\'s claimed. 🪙');
      navigate(`/items/${res.data.item._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <RiGiftLine className="w-5 h-5 text-emerald-600" />
          </div>
          <h1 className="page-title">Report Found Item</h1>
        </div>
        <p className="text-gray-500 text-sm">
          Found something? Report it and earn <strong>token rewards</strong> when the owner claims it!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <RiFileTextLine className="w-4 h-4 text-primary-600" /> Item Details
          </h2>
          <div>
            <label className="label">Item Title *</label>
            <input type="text" className="input" placeholder="e.g. Blue JBL Earphones" value={form.title} onChange={handle('title')} required />
          </div>
          <div>
            <label className="label">Category *</label>
            <select className="input" value={form.category} onChange={handle('category')} required>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[100px] resize-none" placeholder="Describe what you found — any distinctive marks, contents, etc." value={form.description} onChange={handle('description')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1"><RiPaletteLine className="w-3.5 h-3.5" /> Color</label>
              <input type="text" className="input" placeholder="e.g. Blue" value={form.color} onChange={handle('color')} />
            </div>
            <div>
              <label className="label flex items-center gap-1"><RiPriceTagLine className="w-3.5 h-3.5" /> Brand</label>
              <input type="text" className="input" placeholder="e.g. Apple" value={form.brand} onChange={handle('brand')} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <RiMapPinLine className="w-4 h-4 text-primary-600" /> Where did you find it?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Building</label>
              <select className="input" value={form.building} onChange={handle('building')}>
                <option value="">Select building</option>
                {BUILDINGS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Floor</label>
              <input type="text" className="input" placeholder="e.g. Ground, 2nd" value={form.floor} onChange={handle('floor')} />
            </div>
          </div>
          <div>
            <label className="label">Specific Area</label>
            <input type="text" className="input" placeholder="e.g. Near stairs, Classroom 305" value={form.area} onChange={handle('area')} />
          </div>
          <div>
            <label className="label">Additional notes about location</label>
            <input type="text" className="input" placeholder="Any other details" value={form.locationDesc} onChange={handle('locationDesc')} />
          </div>
        </div>

        {/* Date */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <RiCalendarLine className="w-4 h-4 text-primary-600" /> When did you find it?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input" value={form.dateLostFound} onChange={handle('dateLostFound')} required />
            </div>
            <div>
              <label className="label">Approximate Time</label>
              <input type="time" className="input" value={form.timeLostFound} onChange={handle('timeLostFound')} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900">Photos</h2>
          <p className="text-sm text-gray-500">Upload clear photos to help the owner verify.</p>
          <ImageUploader files={files} setFiles={setFiles} />
        </div>

        {/* Token info */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          🪙 <strong>Earn up to 100 tokens</strong> when the owner successfully claims this item!
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary btn-lg flex-1 flex items-center justify-center gap-2">
            {loading ? <><span className="w-5 h-5 spinner" /> Submitting…</> : '📦 Submit Report'}
          </button>
          <Link to="/dashboard" className="btn-ghost btn-lg">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
