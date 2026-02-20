import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resetToken } = location.state || {};

  if (!resetToken) {
    return (
      <div className="text-center">
        <p className="text-red-500 mb-4">Invalid reset session. Please start over.</p>
        <Link to="/forgot-password" className="btn-primary">Try Again</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await API.post('/auth/reset-password', {
        resetToken,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
          ✅
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
        <p className="text-gray-500 text-sm">Your password has been updated. Redirecting to login...</p>
        <div className="w-8 h-8 spinner mx-auto mt-4" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Set New Password 🔐</h1>
        <p className="text-gray-500 text-sm">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              className="input pl-10 pr-10"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Confirm New Password</label>
          <div className="relative">
            <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="password"
              placeholder="Repeat new password"
              className="input pl-10"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
          {loading ? <><span className="w-5 h-5 spinner" /> Resetting...</> : 'Reset Password ✓'}
        </button>
      </form>
    </div>
  );
}
