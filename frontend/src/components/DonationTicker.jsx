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
          background: #eff6ff;
          border-top: 1px solid #dbeafe;
          border-bottom: 1px solid #dbeafe;
          padding: 12px 0;
          white-space: nowrap;
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
        .ticker-amount {
          color: #2563eb;
          font-weight: 700;
        }
        .ticker-dot {
          color: #3b82f6;
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