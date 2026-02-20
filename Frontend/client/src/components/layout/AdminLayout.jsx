import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  RiDashboardLine, RiUserLine, RiSearchLine,
  RiNotification3Line, RiArrowLeftLine,
} from 'react-icons/ri';
import useAuthStore from '../../store/authStore';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: RiDashboardLine, end: true },
  { to: '/admin/users', label: 'Users', icon: RiUserLine },
  { to: '/admin/items', label: 'Items', icon: RiSearchLine },
];

export default function AdminLayout() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex bg-transparent relative z-[1]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20">
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              🎓
            </div>
            <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="" className="avatar-sm" />
            ) : (
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                {user?.name?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-primary-600 font-medium">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors text-sm">
            <RiArrowLeftLine className="w-4 h-4" />
            Back to Site
          </Link>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
