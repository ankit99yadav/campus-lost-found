import { Link } from 'react-router-dom';
import { RiSearchLine, RiHome2Line } from 'react-icons/ri';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link to="/" className="btn-primary flex items-center gap-2">
          <RiHome2Line className="w-4 h-4" /> Go Home
        </Link>
        <Link to="/items" className="btn-outline flex items-center gap-2">
          <RiSearchLine className="w-4 h-4" /> Browse Items
        </Link>
      </div>
    </div>
  );
}
