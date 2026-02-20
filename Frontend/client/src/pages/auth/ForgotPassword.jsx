import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiMailLine, RiArrowRightLine } from 'react-icons/ri';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('OTP sent to your email!');
      if (data.userId) {
        setTimeout(() => navigate('/verify-email', {
          state: { userId: data.userId, email, type: 'reset' },
        }), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
          📧
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
        <p className="text-gray-500 text-sm mb-1">We've sent a password reset OTP to</p>
        <p className="text-primary-600 font-semibold">{email}</p>
        <p className="text-gray-400 text-xs mt-4">Redirecting to OTP verification...</p>
        <div className="w-8 h-8 spinner mx-auto mt-3" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password? 🔑</h1>
        <p className="text-gray-500 text-sm">Enter your email and we'll send you a reset OTP</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              placeholder="you@campus.edu"
              className="input pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
          {loading ? <><span className="w-5 h-5 spinner" /> Sending...</> : <>Send OTP <RiArrowRightLine /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remembered your password?{' '}
        <Link to="/login" className="text-primary-600 font-semibold">Back to Login</Link>
      </p>
    </div>
  );
}
