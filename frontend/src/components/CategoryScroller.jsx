// CategoryScroller.jsx
import { useRef, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import educationImg from '../assets/categories/HopeCare_Education.png';
import healthcareImg from '../assets/categories/HopeCare_Healthcare.png';
import environmentImg from '../assets/categories/HopeCare_Environment.png';
import foodHungerImg from '../assets/categories/HopeCare_Food_and_Hunger.png';
import womenEmpowermentImg from '../assets/categories/HopeCare_Women_Empowerment.png';
import animalsImg from '../assets/categories/HopeCare_Animals.png';

// Maps a category name (as it appears on your campaigns) to its illustration image
// and a count color that matches the badge in that image.
const IMAGE_MAP = {
  'Education':          { image: educationImg,         count: '#16a34a' },
  'Healthcare':          { image: healthcareImg,        count: '#16a34a' },
  'Environment':         { image: environmentImg,       count: '#16a34a' },
  'Food & Hunger':       { image: foodHungerImg,        count: '#ea580c' },
  'Women Empowerment':   { image: womenEmpowermentImg,  count: '#16a34a' },
  'Animals':             { image: animalsImg,           count: '#2563eb' },
};
const DEFAULT_META = { image: educationImg, count: '#6b7280' };

// If you want fixed categories to always show (even with 0 campaigns),
// list them here in display order. Set to null to only show categories
// that actually appear in `campaigns`.
const FIXED_ORDER = ['Education', 'Healthcare', 'Environment', 'Food & Hunger', 'Women Empowerment', 'Animals'];

export default function CategoryScroller({ campaigns = [] }) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const pauseTimerRef = useRef(null);

  const categories = useMemo(() => {
    const counts = {};
    campaigns.forEach((c) => {
      const name = c.category || 'Other';
      counts[name] = (counts[name] || 0) + 1;
    });

    const names = FIXED_ORDER ? FIXED_ORDER : Object.keys(counts);

    return names.map((name) => ({
      name,
      campaignCount: counts[name] || 0,
    }));
  }, [campaigns]);

  const scrollByAmount = (dir) => {
    if (!trackRef.current) return;
    setPaused(true);
    trackRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' });
    clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setPaused(false), 4000);
  };

  if (categories.length === 0) return null;

  const looped = [...categories, ...categories];

  return (
    <div className="cat-scroller-wrap">
      <button
        className="cat-arrow cat-arrow-left"
        onClick={() => scrollByAmount(-1)}
        aria-label="Scroll categories left"
      >
        <ChevronLeft size={18} />
      </button>

      <div
        className={`cat-track-viewport ${paused ? 'is-paused' : ''}`}
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="cat-track">
          {looped.map((cat, i) => {
            const meta = IMAGE_MAP[cat.name] || DEFAULT_META;
            return (
              <div className="cat-card" key={`${cat.name}-${i}`}>
                <img
                  src={meta.image}
                  alt={cat.name}
                  className="cat-illo-img"
                  loading="lazy"
                />
                <div className="cat-body">
                  <div className="cat-title">{cat.name}</div>
                  <div className="cat-count" style={{ color: meta.count }}>
                    {cat.campaignCount} Campaigns
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="cat-arrow cat-arrow-right"
        onClick={() => scrollByAmount(1)}
        aria-label="Scroll categories right"
      >
        <ChevronRight size={18} />
      </button>

      <style>{`
        .cat-scroller-wrap {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 8px;
          background: linear-gradient(90deg, #f0fdf4 0%, #ecfdf5 50%, #fefce8 100%);
        }
        [data-theme="dark"] .cat-scroller-wrap {
          background: linear-gradient(90deg, #0f2419 0%, #14261a 50%, #1a1f0f 100%);
        }

        .cat-track-viewport {
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
        }
        .cat-track-viewport::-webkit-scrollbar { display: none; }

        .cat-track {
          display: inline-flex;
          gap: 16px;
          animation: cat-marquee-scroll 32s linear infinite;
        }
        .cat-track-viewport.is-paused .cat-track,
        .cat-track-viewport:hover .cat-track {
          animation-play-state: paused;
        }
        @keyframes cat-marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .cat-card {
          flex: 0 0 auto;
          width: 200px;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        [data-theme="dark"] .cat-card {
          background: #16241c;
          border-color: #1f3327;
        }

        .cat-illo-img {
          width: 100%;
          height: 130px;
          object-fit: contain;
          background: #fafafa;
          display: block;
        }
        [data-theme="dark"] .cat-illo-img {
          background: #0f1a13;
        }

        .cat-body {
          padding: 14px 16px 16px;
        }

        .cat-title {
          font-weight: 700; font-size: 15px; color: #111827;
        }
        [data-theme="dark"] .cat-title { color: #e5e7eb; }
        .cat-count {
          font-size: 13px; font-weight: 600; margin-top: 2px;
        }

        .cat-arrow {
          flex-shrink: 0;
          width: 34px; height: 34px; border-radius: 50%;
          border: none; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #374151; z-index: 2;
        }
        .cat-arrow:hover { background: #f0fdf4; color: #16a34a; }
      `}</style>
    </div>
  );
}