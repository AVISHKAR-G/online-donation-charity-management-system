import { useEffect, useState } from 'react';
import { donationService } from '../services/donationService';

export default function DonationTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const load = () => {
      donationService.getRecentPublic()
        .then((data) => { if (isMounted) setItems(data); })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  if (items.length === 0) return null;

  const looped = [...items, ...items];

  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {looped.map((item, i) => (
          <span className="ticker-item" key={i}>
            <strong>{item.donorName}</strong> just donated{' '}
            <span className="ticker-amount">₹{item.amount.toLocaleString()}</span>
            {item.campaignTitle && <> to {item.campaignTitle}</>}
            <span className="ticker-dot">●</span>
          </span>
        ))}
      </div>

      <style>{`
        .ticker-wrap {
          overflow: hidden;
          background: #f0fdf4;
          border-top: 1px solid #bbf7d0;
          border-bottom: 1px solid #bbf7d0;
          padding: 12px 0;
          white-space: nowrap;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        [data-theme="dark"] .ticker-wrap {
          background: #0f2419;
          border-top: 1px solid #14532d;
          border-bottom: 1px solid #14532d;
        }
        .ticker-track {
          display: inline-flex;
          animation: ticker-scroll 40s linear infinite;
        }
        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 24px;
          font-size: 14px;
          color: #1f2937;
        }
        [data-theme="dark"] .ticker-item {
          color: #e5e7eb;
        }
        .ticker-amount {
          color: #16a34a;
          font-weight: 700;
        }
        [data-theme="dark"] .ticker-amount {
          color: #4ade80;
        }
        .ticker-dot {
          color: #22c55e;
          margin-left: 10px;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .ticker-wrap:hover .ticker-track {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}