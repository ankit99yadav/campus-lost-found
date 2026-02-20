import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { RiRefreshLine, RiShieldCheckLine } from 'react-icons/ri';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email, type = 'email' } = location.state || {};

  useEffect(() => {
    if (!userId) {
      navigate('/register');
      return;
    }
    inputRefs.current[0]?.focus();
    startCountdown();
  }, []);

  const startCountdown = () => {
    setCanResend(false);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (index, val) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit on last digit
    if (index === 5 && val) {
      const fullOtp = [...newOtp.slice(0, 5), val].join('');
      if (fullOtp.length === 6) handleSubmit(fullOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    if (pastedData.length === 6) handleSubmit(pastedData);
    else inputRefs.current[pastedData.length]?.focus();
  };

  const handleSubmit = async (otpValue) => {
    const finalOtp = otpValue || otp.join('');
    if (finalOtp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (type === 'reset') {
        const { data } = await API.post('/auth/verify-reset-otp', { userId, otp: finalOtp });
        navigate('/reset-password', { state: { resetToken: data.resetToken } });
        return;
      }

      // Email verification — handled via auth store
      const { useAuthStore } = await import('../../store/authStore');
      const store = useAuthStore.getState();
      result = await store.verifyEmail(userId, finalOtp);
      if (result.success) {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await API.post('/auth/resend-otp', { userId, type });
      toast.success('New OTP sent to your email!');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      startCountdown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="animate-fade-in text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <RiShieldCheckLine className="w-10 h-10 text-primary-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
      <p className="text-gray-500 text-sm mb-2">
        We've sent a 6-digit OTP to
      </p>
      <p className="font-semibold text-primary-600 text-sm mb-8">{email || 'your email'}</p>

      {/* OTP Input */}
      <div className="flex justify-center gap-2 mb-8">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all duration-200 ${
              digit
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-white text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
            }`}
          />
        ))}
      </div>

      <button
        onClick={() => handleSubmit()}
        disabled={loading || otp.join('').length !== 6}
        className="btn-primary btn-lg w-full mb-4"
      >
        {loading ? <><span className="w-5 h-5 spinner" /> Verifying...</> : 'Verify OTP ✓'}
      </button>

      {/* Resend */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1.5"
          >
            {resending ? <><span className="w-4 h-4 spinner" /> Sending...</> : <><RiRefreshLine className="w-4 h-4" /> Resend OTP</>}
          </button>
        ) : (
          <p className="text-gray-500">
            Resend OTP in <span className="text-primary-600 font-semibold">{countdown}s</span>
          </p>
        )}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        ⚠️ Check your spam folder if you don't see the email.
      </div>
    </div>
  );
}
