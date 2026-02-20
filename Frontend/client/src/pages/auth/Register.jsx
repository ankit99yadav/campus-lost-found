import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RiUserLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine,
  RiPhoneLine, RiBookOpenLine, RiArrowRightLine,
} from 'react-icons/ri';
import useAuthStore from '../../store/authStore';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', department: '', rollNumber: '', adminCode: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1 = basic info, 2 = student details
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone,
      department: form.department,
      rollNumber: form.rollNumber,
      adminCode: form.adminCode,
    });

    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  };

  const strengthLevel = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = form.password ? strengthLevel(form.password) : 0;
  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account 🎓</h1>
        <p className="text-gray-500 text-sm">Join your campus community</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{s}</div>
              {s < 2 && <div className={`h-0.5 w-8 transition-all ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
          <span className="text-xs text-gray-500 ml-2">Step {step} of 2</span>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-4">
          {/* Name */}
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="John Doe"
                className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                placeholder="you@campus.edu"
                className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
              </button>
            </div>
            {/* Password strength */}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${strength >= i ? strengthColors[strength - 1] : 'bg-gray-200'}`} />
                  ))}
                </div>
                <p className={`text-xs mt-1 font-medium ${strength >= 4 ? 'text-emerald-600' : strength >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {strengthLabels[strength - 1] || 'Too weak'}
                </p>
              </div>
            )}
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                placeholder="Repeat your password"
                className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn-primary btn-lg w-full">
            Continue <RiArrowRightLine className="w-5 h-5" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">
            📋 This info helps identify you and your items better. All optional.
          </p>

          {/* Phone */}
          <div>
            <label className="label">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="relative">
              <RiPhoneLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                placeholder="+91 9876543210"
                className="input pl-10"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="label">Department <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="relative">
              <RiBookOpenLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="e.g. Computer Science"
                className="input pl-10"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
          </div>

          {/* Roll Number */}
          <div>
            <label className="label">Roll Number <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. 21CSE1234"
              className="input"
              value={form.rollNumber}
              onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
            />
          </div>

          {/* Admin Code - Collapsible */}
          <details className="group">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors list-none flex items-center gap-1">
              <span className="transform group-open:rotate-90 transition-transform">▸</span>
              Admin Access Code
            </summary>
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 mb-2">🔐 If you're an admin, enter the secret code below</p>
              <input
                type="password"
                placeholder="Enter admin secret code"
                className="input text-sm"
                value={form.adminCode}
                onChange={(e) => setForm({ ...form, adminCode: e.target.value })}
              />
            </div>
          </details>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
              ← Back
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? <><span className="w-4 h-4 spinner" /> Creating...</> : 'Create Account 🎉'}
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in →</Link>
      </p>
    </div>
  );
}
