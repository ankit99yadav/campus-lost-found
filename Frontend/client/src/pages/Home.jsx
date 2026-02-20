import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiSearchLine,
  RiMapPinLine,
  RiMedalLine,
  RiArrowRightLine,
  RiAddCircleFill,
} from 'react-icons/ri';
import API from '../services/api';
import ItemCard from '../components/items/ItemCard';
import DiamondSectionBg from '../components/common/DiamondSectionBg';

const STEPS = [
  {
    icon: '📣',
    title: 'Report',
    desc: 'Report a lost or found item with details and photos.',
  },
  {
    icon: '🔍',
    title: 'Smart Match',
    desc: 'Our algorithm matches lost & found items automatically.',
  },
  {
    icon: '💬',
    title: 'Connect',
    desc: 'Chat with the finder/owner privately and verify ownership.',
  },
  {
    icon: '🪙',
    title: 'Earn Tokens',
    desc: 'Finders earn tokens when items are successfully returned.',
  },
];

const STATS_INIT = { totalItems: 0, resolvedItems: 0, activeUsers: 0 };

export default function Home() {
  const [stats, setStats] = useState(STATS_INIT);
  const [recentItems, setRecentItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          API.get('/items/stats'),
          API.get('/items?limit=6&status=approved'),
        ]);
        setStats(statsRes.data.stats || STATS_INIT);
        setRecentItems(itemsRes.data.items || []);
      } catch {
        // silently ignore — public page
      } finally {
        setLoadingItems(false);
      }
    };
    fetchData();
  }, []);

  const handleItemNotFound = (itemId) => {
    setRecentItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
  };

  return (
    <div>
      {/* Hero */}
      <section className="dsb-section bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 text-white py-14 px-4">
        <DiamondSectionBg />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight"
          >
            Lost something? <br />
            <span className="text-yellow-300">We'll help you find it.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-primary-100 text-base md:text-lg mb-7 max-w-2xl mx-auto"
          >
            Campus Lost &amp; Found connects students who've lost items with those who've found them — powered by smart matching and token rewards.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/items" className="btn-lg bg-white text-primary-700 hover:bg-primary-50 font-bold rounded-xl flex items-center gap-2 justify-center">
              <RiSearchLine className="w-5 h-5" /> Browse Items
            </Link>
            <Link to="/report/lost" className="btn-lg bg-primary-500 bg-opacity-30 border border-white/30 hover:bg-opacity-50 font-bold rounded-xl flex items-center gap-2 justify-center">
              <RiAddCircleFill className="w-5 h-5" /> Report Lost Item
            </Link>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Fast reporting', value: 'Under 1 min' },
              { label: 'Smart matching', value: 'AI powered' },
              { label: 'Community trust', value: 'Verified users' },
            ].map((m) => (
              <div key={m.label} className="bg-white/15 border border-white/20 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white text-lg font-bold">{m.value}</p>
                <p className="text-white/80 text-sm">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="dsb-section bg-white border-b border-slate-100 py-12">
        <DiamondSectionBg />
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {[
            { label: 'Items Reported', value: stats.totalItems },
            { label: 'Items Resolved', value: stats.resolvedItems },
            { label: 'Active Users', value: stats.activeUsers },
          ].map((s) => (
            <div key={s.label} className="card !p-5">
              <p className="text-3xl font-extrabold gradient-text">{(s.value ?? 0).toLocaleString()}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="section-title text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card text-center"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Items */}
      <section className="dsb-section bg-gray-50 py-16">
        <DiamondSectionBg />
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Recent Reports</h2>
            <Link to="/items" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View all <RiArrowRightLine className="w-4 h-4" />
            </Link>
          </div>
          {loadingItems ? (
            <div className="flex justify-center py-12">
              <span className="w-8 h-8 spinner" />
            </div>
          ) : recentItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No items reported yet. Be the first!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItems.map((item) => (
                <ItemCard key={item._id} item={item} onItemNotFound={handleItemNotFound} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Found something on campus? 📦
        </h2>
        <p className="text-gray-500 mb-8 max-w-xl mx-auto">
          Report it and earn token rewards when the owner claims it. Your good deed won't go unnoticed!
        </p>
        <Link to="/report/found" className="btn-primary btn-lg inline-flex items-center gap-2">
          <RiMedalLine className="w-5 h-5" /> Report Found Item
        </Link>
      </section>
    </div>
  );
}
