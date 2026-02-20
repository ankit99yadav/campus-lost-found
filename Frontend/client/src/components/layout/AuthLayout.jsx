import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-transparent relative z-[1]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-secondary-600 relative overflow-hidden flex-col justify-between p-12">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-300 rounded-full blur-3xl" />
        </div>

        <Link to="/" className="relative text-white font-bold text-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl">
            🎓
          </div>
          Campus Lost & Found
        </Link>

        <div className="relative max-w-lg">
          <h2 className="text-4xl font-bold text-white leading-tight mb-5 tracking-tight">
            Reuniting People<br />
            with Their Belongings
          </h2>
          <p className="text-white/85 text-lg leading-relaxed mb-9">
            Report lost or found items on campus and help your community. 
            Every item returned is a story of kindness.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Items Returned', value: '500+' },
              { label: 'Active Users', value: '1.2K' },
              { label: 'Success Rate', value: '78%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/70 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-white/60 text-sm">
          © 2024 Campus Lost & Found. All rights reserved.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-xl">
              <span className="text-2xl">🎓</span> Campus Lost & Found
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
