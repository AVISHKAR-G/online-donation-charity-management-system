import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import UserHistoryTabs from '../../components/UserHistoryTabs';
import { userService } from '../../services/userService';

function ActivityIllustration() {
  return (
    <svg viewBox="0 0 220 170" width="180" height="140">
      <defs>
        <linearGradient id="actClipGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* leaves */}
      <g opacity="0.6" stroke="#86efac" strokeWidth="2" fill="none">
        <path d="M40 150 C 25 130, 30 100, 55 80" />
        <ellipse cx="42" cy="105" rx="6" ry="12" transform="rotate(-25 42 105)" fill="#bbf7d0" stroke="none" />
      </g>
      <g opacity="0.6" stroke="#86efac" strokeWidth="2" fill="none">
        <path d="M180 150 C 195 130, 190 100, 165 80" />
        <ellipse cx="178" cy="105" rx="6" ry="12" transform="rotate(25 178 105)" fill="#bbf7d0" stroke="none" />
      </g>

      {/* phone / clipboard */}
      <rect x="80" y="15" width="60" height="110" rx="14" fill="#ffffff" stroke="#e0e7ff" strokeWidth="2" />
      <rect x="98" y="8" width="24" height="12" rx="5" fill="url(#actClipGrad)" />

      {/* heart with check */}
      <path d="M110 48 c-7-8-20-4-20 6 c0 10 20 22 20 22 s20-12 20-22 c0-10-13-14-20-6z" fill="url(#actClipGrad)" />
      <path d="M101 58 l6 6 12-12" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* small sparkles / dots */}
      <circle cx="55" cy="30" r="3.5" fill="#60a5fa" />
      <circle cx="170" cy="25" r="3" fill="#fbbf24" />
      <circle cx="185" cy="55" r="4" fill="#f472b6" opacity="0.8" />
      <circle cx="50" cy="60" r="2.5" fill="#a78bfa" />
    </svg>
  );
}

export default function MyActivity() {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getMyHistory().then(setHistory).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ background: 'linear-gradient(120deg, #ecfdf5 0%, #eff6ff 55%, #f5f3ff 100%)' }}>
        <div className="container" style={{ padding: '48px 0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ marginBottom: 6, fontWeight: 800, fontSize: 34, color: '#111827' }}>My Activity</h1>
            <p style={{ color: '#6b7280', fontSize: 15 }}>Track your donations, applications and aid received.</p>
          </div>
          <ActivityIllustration />
        </div>
      </div>

      <div className="container" style={{ padding: '0 0 40px' }}>
        <div className="card" style={{ padding: 0, marginTop: -8, borderRadius: 16, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 24 }}><Loader /></div> : <UserHistoryTabs history={history} />}
        </div>
      </div>
      <Footer />
    </>
  );
}