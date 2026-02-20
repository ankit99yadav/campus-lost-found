import { useState, useRef } from 'react';
import { RiUser3Line, RiEdit2Line, RiSaveLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiCamera2Line } from 'react-icons/ri';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    rollNumber: user?.rollNumber || '',
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  const fileRef = useRef();

  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const handlePass = (k) => (e) => setPassForm({ ...passForm, [k]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put('/users/me', form);
      updateUser(res.data.user);
      setEditMode(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePass = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    if (passForm.newPassword.length < 8) return toast.error('Min 8 characters');
    setChangingPass(true);
    try {
      await API.post('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPassForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await API.post('/auth/upload-avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data.user);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="page-title">My Profile</h1>

      {/* Avatar + Basic */}
      <div className="card">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative w-20 h-20 flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-primary-100 overflow-hidden flex items-center justify-center">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <RiUser3Line className="w-10 h-10 text-primary-400" />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
            >
              <RiCamera2Line className="w-3.5 h-3.5 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge badge-approved text-xs capitalize">{user?.role}</span>
              {user?.isEmailVerified && <span className="text-emerald-600 text-xs font-medium">✓ Verified</span>}
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="ml-auto btn-outline btn-sm flex items-center gap-1"
          >
            <RiEdit2Line className="w-3.5 h-3.5" /> {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" disabled={!editMode} value={form.name} onChange={handle('name')} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" disabled={!editMode} value={form.phone} onChange={handle('phone')} placeholder="+91 XXXXXXXXXX" />
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input" disabled={!editMode} value={form.department} onChange={handle('department')} placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label className="label">Roll Number</label>
            <input className="input" disabled={!editMode} value={form.rollNumber} onChange={handle('rollNumber')} placeholder="e.g. CS2021001" />
          </div>
        </div>

        {editMode && (
          <button onClick={handleSave} disabled={saving} className="mt-5 btn-primary flex items-center gap-2">
            {saving ? <><span className="w-4 h-4 spinner" /> Saving…</> : <><RiSaveLine className="w-4 h-4" /> Save Changes</>}
          </button>
        )}
      </div>

      {/* Token Summary */}
      <div className="card bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
        <h2 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">🪙 Token Wallet</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-extrabold text-amber-700">{user?.tokenBalance || 0}</p>
            <p className="text-sm text-amber-600">Current Balance</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-amber-700">{user?.totalTokensEarned || 0}</p>
            <p className="text-sm text-amber-600">Total Earned</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <RiLockLine className="w-4 h-4 text-primary-600" /> Security
          </h2>
          <button
            onClick={() => setShowPassForm(!showPassForm)}
            className="btn-outline btn-sm"
          >
            {showPassForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPassForm && (
          <form onSubmit={handleChangePass} className="space-y-4 border-t border-gray-100 pt-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input pr-10"
                  value={passForm.currentPassword} onChange={handlePass('currentPassword')} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input"
                value={passForm.newPassword} onChange={handlePass('newPassword')} required minLength={8} />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input"
                value={passForm.confirmPassword} onChange={handlePass('confirmPassword')} required />
            </div>
            <button type="submit" disabled={changingPass} className="btn-primary flex items-center gap-2">
              {changingPass ? <><span className="w-4 h-4 spinner" /> Updating…</> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
