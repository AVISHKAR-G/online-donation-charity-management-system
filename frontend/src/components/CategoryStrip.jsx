import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft, ChevronRight, GraduationCap, Stethoscope, Leaf,
  ShoppingBasket, HandHeart, PawPrint,
} from 'lucide-react';

// Flat, hand-drawn-style SVG illustrations — built in-house (no external
// image assets) so there's no licensing dependency. Backgrounds are left
// transparent so the artwork sits directly on the card's own background
// and reads correctly in both light and dark theme.

function EducationIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120">
      {/* globe */}
      <circle cx="38" cy="70" r="22" fill="#bfdbfe" />
      <path d="M16 70h44M38 48v44M22 56c8 6 24 6 32 0M22 84c8-6 24-6 32 0" stroke="#2563eb" strokeWidth="2" fill="none" />
      {/* stack of books */}
      <rect x="66" y="94" width="34" height="10" rx="2" fill="#60a5fa" />
      <rect x="70" y="84" width="30" height="10" rx="2" fill="#f87171" />
      <rect x="66" y="74" width="34" height="10" rx="2" fill="#34d399" />
      {/* parent figure */}
      <circle cx="126" cy="46" r="12" fill="#fbbf24" />
      <path d="M108 100c0-18 8-30 18-30s18 12 18 30" fill="#f472b6" />
      {/* kid 1 */}
      <circle cx="98" cy="66" r="9" fill="#fde68a" />
      <path d="M84 100c0-12 6-22 14-22s14 10 14 22" fill="#60a5fa" />
      {/* kid 2 raising arm */}
      <circle cx="156" cy="62" r="9" fill="#fcd34d" />
      <path d="M142 100c0-13 6-24 14-24s14 11 14 24" fill="#34d399" />
      <path d="M170 78 L182 62" stroke="#34d399" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function HealthcareIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120">
      <path
        d="M100 100c-28-17-49-34-49-56 0-15 12-26 26-26 10 0 18 6 23 14 5-8 13-14 23-14 14 0 26 11 26 26 0 22-21 39-49 56Z"
        fill="#f87171"
      />
      <path d="M52 58h22l9-20 11 34 9-18h24" stroke="#fff" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* stethoscope wrap */}
      <path d="M40 60c-10 6-14 16-8 26 5 8 16 10 22 2" stroke="#fecaca" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="56" cy="90" r="6" fill="#fecaca" />
    </svg>
  );
}

function EnvironmentIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120">
      <path d="M100 96V54" stroke="#166534" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="40" r="20" fill="#4ade80" />
      <circle cx="80" cy="52" r="15" fill="#86efac" />
      <circle cx="120" cy="52" r="15" fill="#86efac" />
      {/* cupped hands */}
      <path
        d="M46 96c0-10 8-16 18-16h72c10 0 18 6 18 16 0 8-9 12-20 12-14 0-18-6-34-6s-20 6-34 6c-11 0-20-4-20-12Z"
        fill="#fbbf24"
      />
      <path d="M46 96c6-14 20-22 30-14" stroke="#f59e0b" strokeWidth="2" fill="none" />
      <path d="M154 96c-6-14-20-22-30-14" stroke="#f59e0b" strokeWidth="2" fill="none" />
    </svg>
  );
}

function FoodIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120">
      <path d="M56 100 L68 54 H132 L144 100 Z" fill="#c2843d" />
      <path d="M56 100 H144" stroke="#8a5a24" strokeWidth="3" />
      <path d="M68 54 H132 L128 66 H72 Z" fill="#a8712f" />
      <circle cx="82" cy="44" r="11" fill="#ef4444" />
      <circle cx="82" cy="44" r="11" fill="none" stroke="#dc2626" strokeWidth="1.5" />
      <circle cx="104" cy="36" r="13" fill="#facc15" />
      <circle cx="126" cy="44" r="10" fill="#4ade80" />
      <rect x="94" y="20" width="10" height="18" rx="4" fill="#22c55e" transform="rotate(-15 99 29)" />
      <circle cx="114" cy="32" r="7" fill="#fb7185" />
    </svg>
  );
}

function WomenEmpowermentIllustration() {
  const figures = [
    { x: 46, head: '#fbcfe8', dress: '#f472b6' },
    { x: 100, head: '#fda4af', dress: '#e11d48' },
    { x: 154, head: '#fbcfe8', dress: '#a855f7' },
  ];
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120">
      {figures.map((f, i) => (
        <g key={i} transform={`translate(${f.x - 20},18)`}>
          <circle cx="20" cy="12" r="11" fill={f.head} />
          <path d="M20 23 V60" stroke={f.dress} strokeWidth="8" strokeLinecap="round" />
          <path d="M20 30 L2 8 M20 30 L38 8" stroke={f.dress} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M6 60 L2 82 M34 60 L38 82" stroke={f.dress} strokeWidth="6" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

function AnimalsIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120">
      {/* dog */}
      <g transform="translate(48,36)">
        <ellipse cx="20" cy="46" rx="22" ry="18" fill="#c17a3d" />
        <circle cx="20" cy="20" r="16" fill="#d99257" />
        <path d="M6 8 C-4 0 -2 20 6 22 Z" fill="#c17a3d" />
        <path d="M34 8 C44 0 42 20 34 22 Z" fill="#c17a3d" />
        <circle cx="14" cy="19" r="2.2" fill="#3f2a14" />
        <circle cx="26" cy="19" r="2.2" fill="#3f2a14" />
        <ellipse cx="20" cy="27" rx="3" ry="2.2" fill="#3f2a14" />
      </g>
      {/* cat */}
      <g transform="translate(112,42)">
        <ellipse cx="20" cy="42" rx="20" ry="16" fill="#e5e7eb" />
        <circle cx="20" cy="16" r="14" fill="#f3f4f6" />
        <path d="M8 6 L2 -8 L14 2 Z" fill="#f3f4f6" />
        <path d="M32 6 L38 -8 L26 2 Z" fill="#f3f4f6" />
        <circle cx="15" cy="15" r="1.8" fill="#374151" />
        <circle cx="25" cy="15" r="1.8" fill="#374151" />
        <path d="M17 20 q3 3 6 0" stroke="#374151" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M8 20 h-6M8 23 h-6M32 20 h6M32 23 h6" stroke="#9ca3af" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

const CATEGORIES = [
  {
    key: 'Education', label: 'Education', match: ['education'],
    Icon: GraduationCap, accent: '#16a34a', Illustration: EducationIllustration,
  },
  {
    key: 'Healthcare', label: 'Healthcare', match: ['health', 'healthcare', 'medical'],
    Icon: Stethoscope, accent: '#e11d48', Illustration: HealthcareIllustration,
  },
  {
    key: 'Environment', label: 'Environment', match: ['environment'],
    Icon: Leaf, accent: '#16a34a', Illustration: EnvironmentIllustration,
  },
  {
    key: 'Food', label: 'Food & Hunger', match: ['food', 'nutrition', 'hunger', 'poverty'],
    Icon: ShoppingBasket, accent: '#ea580c', Illustration: FoodIllustration,
  },
  {
    key: 'Women Empowerment', label: 'Women Empowerment', match: ['women', 'empowerment'],
    Icon: HandHeart, accent: '#db2777', Illustration: WomenEmpowermentIllustration,
  },
  {
    key: 'Animals', label: 'Animals', match: ['animal', 'wildlife', 'pet'],
    Icon: PawPrint, accent: '#2563eb', Illustration: AnimalsIllustration,
  },
];

function getCategoryOf(campaign) {
  return (campaign?.category || campaign?.Category || '').toString().toLowerCase();
}

export default function CategoryStrip({ campaigns = [] }) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  const counts = CATEGORIES.map(({ key, match }) => {
    const count = campaigns.filter((c) => {
      const cat = getCategoryOf(c);
      return match.some((m) => cat.includes(m));
    }).length;
    return { key, count };
  });

  const scrollBy = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  return (
    <section style={{ position: 'relative', padding: '24px 0' }}>
      <div className="container" style={{ position: 'relative' }}>
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          style={{
            position: 'absolute', left: -18, top: 62, zIndex: 2,
            width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border)',
            background: 'var(--card-bg)', boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <ChevronLeft size={17} color="var(--text-muted)" />
        </button>

        <div
          ref={scrollRef}
          style={{
            display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory',
            padding: '4px 2px 8px', scrollbarWidth: 'none',
          }}
        >
          {CATEGORIES.map(({ key, label, Icon, accent, Illustration }) => {
            const { count } = counts.find((c) => c.key === key) || { count: 0 };
            return (
              <Link
                key={key}
                to={`/campaigns?category=${encodeURIComponent(key)}`}
                className="card"
                style={{
                  flex: '0 0 210px', scrollSnapAlign: 'start', padding: 14,
                  textDecoration: 'none', color: 'inherit', display: 'flex',
                  flexDirection: 'column', gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: `${accent}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={19} color={accent} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--dark)', whiteSpace: 'nowrap' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: accent, marginTop: 1 }}>
                      {t('home.campaignCount', { count, defaultValue: `${count} Campaigns` })}
                    </div>
                  </div>
                </div>
                <div style={{ borderRadius: 12, overflow: 'hidden', height: 110 }}>
                  <Illustration />
                </div>
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          style={{
            position: 'absolute', right: -18, top: 62, zIndex: 2,
            width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border)',
            background: 'var(--card-bg)', boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <ChevronRight size={17} color="var(--text-muted)" />
        </button>
      </div>
    </section>
  );
}