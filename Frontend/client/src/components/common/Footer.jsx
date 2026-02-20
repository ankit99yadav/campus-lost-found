import { Link } from 'react-router-dom';
import { RiGithubLine, RiInstagramLine, RiTwitterXLine } from 'react-icons/ri';
import DiamondSectionBg from './DiamondSectionBg';

export default function Footer() {
  return (
    <footer className="dsb-section bg-slate-950 text-slate-400 mt-auto">
      <DiamondSectionBg dark={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <span className="text-2xl">🎓</span> Campus Lost & Found
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Helping campus community reunite with their lost belongings through 
              a trusted, transparent platform.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[RiGithubLine, RiInstagramLine, RiTwitterXLine].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-slate-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-slate-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/items?type=lost', label: 'Lost Items' },
                { to: '/items?type=found', label: 'Found Items' },
                { to: '/report/lost', label: 'Report Lost' },
                { to: '/report/found', label: 'Report Found' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Admin</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Campus Lost & Found. All rights reserved.</p>
          <p className="text-sm">Built with ❤️ for the campus community</p>
        </div>
      </div>
    </footer>
  );
}
