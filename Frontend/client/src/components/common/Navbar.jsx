import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  RiNotification3Line, RiUser3Line, RiSearchLine, RiMenuLine,
  RiCloseLine, RiSettings3Line, RiLogoutBoxLine, RiDashboardLine,
  RiAddCircleLine, RiChat3Line, RiShieldLine,
} from 'react-icons/ri';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import NotificationPanel from '../notifications/NotificationPanel';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/items?type=lost', label: 'Lost Items' },
    { to: '/items?type=found', label: 'Found Items' },
    { to: '/items', label: 'Browse All' },
  ];

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg shadow-md">
              🎓
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-gray-900 text-base leading-none">Campus</span>
              <span className="text-primary-600 font-bold text-base leading-none"> L&F</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-xl transition-all ${
                    isActive ? 'text-primary-700 bg-white shadow-sm border border-primary-100' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Report Lost button */}
                <Link to="/report/lost" className="hidden sm:flex btn-primary btn-sm items-center gap-1.5">
                  <RiAddCircleLine className="w-4 h-4" />
                  Report Lost
                </Link>

                {/* Report Found button */}
                <Link to="/report/found" className="hidden sm:flex btn-sm items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl px-3 py-2 text-sm font-medium transition-colors">
                  <RiAddCircleLine className="w-4 h-4" />
                  Found Item
                </Link>

                {/* Chat */}
                <Link to="/chat" className="btn-icon relative hidden sm:flex !bg-white border border-slate-200 hover:!bg-slate-50">
                  <RiChat3Line className="w-5 h-5" />
                </Link>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                    className="btn-icon relative !bg-white border border-slate-200 hover:!bg-slate-50"
                    aria-label="Notifications"
                  >
                    <RiNotification3Line className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <NotificationPanel onClose={() => setNotifOpen(false)} />
                  )}
                </div>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-slide-down z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            🏅 {user?.tokenBalance || 0} tokens
                          </span>
                        </div>
                      </div>
                      <div className="py-1">
                        {[
                          { to: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
                          { to: '/profile', label: 'Profile', icon: RiUser3Line },
                          { to: '/chat', label: 'Messages', icon: RiChat3Line },
                          ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel', icon: RiShieldLine }] : []),
                        ].map(({ to, label, icon: Icon }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <RiLogoutBoxLine className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost btn-sm hidden sm:flex">Login</Link>
                <Link to="/register" className="btn-primary btn-sm">Register</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-icon md:hidden"
            >
              {mobileOpen ? <RiCloseLine className="w-5 h-5" /> : <RiMenuLine className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100 animate-slide-down">
            <div className="space-y-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  {label}
                </NavLink>
              ))}
              {isAuthenticated && (
                <>
                  <Link to="/report/lost" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-lg">
                    + Report Lost Item
                  </Link>
                  <Link to="/report/found" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg">
                    + Report Found Item
                  </Link>
                </>
              )}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-2 px-4">
                  <Link to="/login" className="btn-outline btn-sm flex-1 justify-center" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link to="/register" className="btn-primary btn-sm flex-1 justify-center" onClick={() => setMobileOpen(false)}>Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
