import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  RiEdit2Line, RiMapPinLine, RiPaletteLine, RiPriceTagLine,
  RiFileTextLine, RiCalendarLine, RiDeleteBinLine, RiArrowLeftLine,
} from 'react-icons/ri';
import API from '../services/api';
import ImageUploader from '../components/items/ImageUploader';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Electronics', 'Books & Stationery', 'Clothing & Accessories',
  'ID Cards & Documents', 'Keys', 'Bags & Wallets',
  'Jewellery', 'Sports Equipment', 'Musical Instruments', 'Other',
];

const BUILDINGS = [
  'Main Building', 'Library', 'Hostel A', 'Hostel B', 'Canteen',
  'Sports Complex', 'Labs', 'Auditorium', 'Admin Block', 'Other',
];

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '', color: '', brand: '',
    building: '', floor: '', area: '', locationDesc: '',
    dateLostFound: '', timeLostFound: '',
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [itemType, setItemType] = useState('lost');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await API.get(`/items/${id}`);
        const item = res.data.item;
        setItemType(item.type);
        setForm({
          title: item.title || '',
          description: item.description || '',
          category: item.category || '',
          color: item.color || '',
          brand: item.brand || '',
          building: item.location?.building || '',
          floor: item.location?.floor || '',
          area: item.location?.area || '',
          locationDesc: item.location?.description || '',
          dateLostFound: item.dateLostFound ? new Date(item.dateLostFound).toISOString().split('T')[0] : '',
          timeLostFound: item.timeLostFound || '',
        });
        setExistingImages(item.images || []);
      } catch {
        toast.error('Failed to load item');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      return toast.error('Title and description are required.');
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('color', form.color);
      fd.append('brand', form.brand);
      fd.append('timeLostFound', form.timeLostFound);
      fd.append('location[building]', form.building);
      fd.append('location[floor]', form.floor);
      fd.append('location[area]', form.area);
      fd.append('location[description]', form.locationDesc);

      // Add new images
      newFiles.forEach((f) => fd.append('images', f));

      await API.put(`/items/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Item updated successfully! It may need re-approval.');
      navigate(`/items/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="w-10 h-10 spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 mb-6 text-sm">
        <RiArrowLeftLine className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${itemType === 'lost' ? 'bg-red-100' : 'bg-emerald-100'}`}>
            <RiEdit2Line className={`w-5 h-5 ${itemType === 'lost' ? 'text-red-600' : 'text-emerald-600'}`} />
          </div>
          <h1 className="page-title">Edit {itemType === 'lost' ? 'Lost' : 'Found'} Item</h1>
        </div>
        <p className="text-gray-500 text-sm">Update the details of your reported item. Edits may require re-approval.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <RiFileTextLine className="w-4 h-4 text-primary-600" /> Item Details
          </h2>
          <div>
            <label className="label">Item Title *</label>
            <input type="text" className="input" placeholder="e.g. Black Nike Wallet" value={form.title} onChange={handle('title')} required />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={handle('category')}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input min-h-[100px] resize-none" placeholder="Describe the item in detail" value={form.description} onChange={handle('description')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1"><RiPaletteLine className="w-3.5 h-3.5" /> Color</label>
              <input type="text" className="input" placeholder="e.g. Red" value={form.color} onChange={handle('color')} />
            </div>
            <div>
              <label className="label flex items-center gap-1"><RiPriceTagLine className="w-3.5 h-3.5" /> Brand</label>
              <input type="text" className="input" placeholder="e.g. Samsung" value={form.brand} onChange={handle('brand')} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <RiMapPinLine className="w-4 h-4 text-primary-600" /> Location
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
            <input type="text" className="input" placeholder="e.g. Near vending machine" value={form.area} onChange={handle('area')} />
          </div>
          <div>
            <label className="label">Additional location notes</label>
            <input type="text" className="input" placeholder="Any other details" value={form.locationDesc} onChange={handle('locationDesc')} />
          </div>
        </div>

        {/* Date & Time */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <RiCalendarLine className="w-4 h-4 text-primary-600" /> Date & Time
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.dateLostFound} onChange={handle('dateLostFound')} />
            </div>
            <div>
              <label className="label">Approximate Time</label>
              <input type="time" className="input" value={form.timeLostFound} onChange={handle('timeLostFound')} />
            </div>
          </div>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-900">Current Photos</h2>
            <div className="flex gap-3 flex-wrap">
              {existingImages.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <RiDeleteBinLine className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Hover and click to remove. Max 5 images total.</p>
          </div>
        )}

        {/* New Images */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900">Add New Photos</h2>
          <ImageUploader files={newFiles} setFiles={setNewFiles} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary btn-lg flex-1 flex items-center justify-center gap-2">
            {saving ? <><span className="w-5 h-5 spinner" /> Saving…</> : <><RiEdit2Line className="w-4 h-4" /> Save Changes</>}
          </button>
          <Link to={`/items/${id}`} className="btn-ghost btn-lg">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
