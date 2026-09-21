import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, FileText, Gift } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import UserHistoryTabs from '../../components/UserHistoryTabs';
import { userService } from '../../services/userService';
import { useTheme } from '../../context/ThemeContext';
import leavesFrame from '../../assets/images/backgrounds/leaves-frame.jpg';

function ActivityIllustration({ isDark }) {
  const iconColor = isDark ? '#4ade80' : '#16a34a';
  const iconColorLight = isDark ? '#166534' : '#86efac';
  const clipboardBg = isDark ? '#1e293b' : '#ffffff';
  const clipboardBorder = isDark ? '#334155' : '#dcfce7';
  const potColor = isDark ? '#166534' : '#15803d';
  const leafColor = isDark ? '#4ade80' : '#22c55e';

  return (
    <svg viewBox="0 0 320 220" width="150" height="104">
      <defs>
        <linearGradient id="actClipGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={iconColorLight} />
          <stop offset="100%" stopColor={iconColor} />
        </linearGradient>
      </defs>

      {/* soft background blob */}
      <ellipse cx="150" cy="150" rx="140" ry="70" fill={isDark ? '#14532d' : '#dcfce7'} opacity="0.6" />

      {/* floating dots + hearts */}
      <circle cx="30" cy="40" r="3" fill={iconColor} opacity="0.5" />
      <path d="M170 30 c-2.5-3-8-1.5-8 2.5 c0 4 8 8 8 8 s8-4 8-8 c0-4-5.5-5.5-8-2.5z" fill={iconColor} opacity="0.6" />
      <path d="M120 60 c-2-2.5-6.5-1.2-6.5 2 c0 3.2 6.5 6.5 6.5 6.5 s6.5-3.3 6.5-6.5 c0-3.2-4.5-4.5-6.5-2z" fill={iconColor} opacity="0.5" />

      {/* clipboard */}
      <g transform="translate(100,10)">
        <rect x="0" y="0" width="90" height="130" rx="14" fill={clipboardBg} stroke={clipboardBorder} strokeWidth="2" />
        <rect x="22" y="-8" width="46" height="18" rx="6" fill="url(#actClipGrad)" />

        {/* heart with check */}
        <path d="M45 30 c-8-9-24-4-24 7 c0 12 24 26 24 26 s24-14 24-26 c0-11-16-16-24-7z" fill="url(#actClipGrad)" />
        <path d="M35 43 l7 7 14-14" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* checklist lines */}
        {[78, 96, 114].map((y) => (
          <g key={y}>
            <circle cx="14" cy={y} r="5" fill="none" stroke={iconColor} strokeWidth="2" />
            <path d={`M11 ${y} l2 2.5 l5 -5.5`} stroke={iconColor} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="26" y={y - 2.5} width="48" height="5" rx="2.5" fill={isDark ? '#334155' : '#e5e7eb'} />
          </g>
        ))}
      </g>

      {/* plant pot */}
      <g transform="translate(230,120)">
        <path d="M0 55 L10 90 L50 90 L60 55 Z" fill={potColor} />
        <ellipse cx="30" cy="55" rx="30" ry="7" fill={isDark ? '#22c55e' : '#16a34a'} />
        <path d="M30 55 C 30 30, 15 20, 8 5" stroke={leafColor} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M30 55 C 30 25, 40 15, 45 -5" stroke={leafColor} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M30 55 C 30 35, 30 25, 30 5" stroke={leafColor} strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="10" cy="8" rx="6" ry="11" transform="rotate(-30 10 8)" fill={leafColor} />
        <ellipse cx="43" cy="-2" rx="6" ry="11" transform="rotate(20 43 -2)" fill={leafColor} />
        <ellipse cx="30" cy="8" rx="6" ry="11" fill={leafColor} />
      </g>
    </svg>
  );
}

function SummaryCards({ history, isDark }) {
  const donations = history?.donations || [];
  const applications = history?.applications || [];
  const aidReceived = history?.aidReceived || [];

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

  const cards = [
    {
      icon: Heart,
      iconBg: '#16a34a',
      bg: isDark ? 'rgba(20,83,45,0.92)' : 'rgba(240,253,244,0.92)',
      label: 'Total Donations',
      value: `₹${totalDonated.toLocaleString()}`,
      sub: `${donations.length} Donations`,
    },
    {
      icon: FileText,
      iconBg: '#2563eb',
      bg: isDark ? 'rgba(30,58,138,0.92)' : 'rgba(239,246,255,0.92)',
      label: 'Total Applications',
      value: applications.length,
      sub: 'Applications Submitted',
    },
    {
      icon: Gift,
      iconBg: '#ea580c',
      bg: isDark ? 'rgba(124,45,18,0.92)' : 'rgba(255,247,237,0.92)',
      label: 'Aid Received',
      value: aidReceived.length,
      sub: 'Aid Received',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: -8,
      }}
    >
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            style={{
              background: c.bg,
              borderRadius: 14,
              padding: '13px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 11,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: c.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: isDark ? '#cbd5e1' : '#374151', fontWeight: 600 }}>
                {c.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: isDark ? '#f1f5f9' : '#111827', marginTop: 1 }}>
                {c.value}
              </div>
              <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 1 }}>
                {c.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MyActivity() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    userService.getMyHistory().then(setHistory).finally(() => setLoading(false));
  }, []);

  const headingColor = isDark ? '#f1f5f9' : '#111827';
  const subColor = isDark ? '#94a3b8' : '#6b7280';
  const cardBg = isDark ? '#1e293b' : '#fff';

  // Tint applied to the WHOLE photo (see the overlay div below), including
  // the strip behind/above the sticky navbar — previously this tint only
  // started below the navbar, so that strip stayed on the raw bright photo
  // no matter what theme was active.
  const pageBg = isDark ? 'rgba(2,6,4,0.94)' : 'rgba(255,255,255,0.2)';

  return (
    <div
      style={{
        position: 'relative',
        backgroundImage: `url(${leavesFrame})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Tints the ENTIRE photo — including the strip behind/above the
          sticky navbar — so that area also goes dark in dark mode instead
          of staying on the raw bright image. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: pageBg,
          pointerEvents: 'none',
          transition: 'background 0.25s ease',
        }}
      />

      <div style={{ position: 'relative' }}>
        <div style={{ height: 5, background: isDark ? '#166534' : '#15803d', width: '100%' }} />
        <Navbar />

        {/* This wrapper no longer needs its own `background` — the overlay
            above already tints the whole page, navbar included. */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            paddingBottom: 60,
          }}
        >
          <div
            className="container"
            style={{
              padding: '28px 0 20px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 12,
            }}
          >
            <div>
              <h1 style={{ marginBottom: 4, fontWeight: 800, fontSize: 26, color: headingColor }}>
                {t('myActivity.title')}
              </h1>
              <div style={{ width: 34, height: 2, background: isDark ? '#4ade80' : '#15803d', marginBottom: 6 }} />
              <p style={{ color: subColor, fontSize: 13 }}>{t('myActivity.subtitle')}</p>
            </div>
            <ActivityIllustration isDark={isDark} />
          </div>

          {!loading && (
            <div className="container" style={{ paddingBottom: 8 }}>
              <SummaryCards history={history} isDark={isDark} />
            </div>
          )}

          {/* White activity card sits directly on the vibrant hero, overlapping
              it slightly (negative margin) rather than dropping onto a flat,
              dimmer page background below. */}
          <div className="container" style={{ marginTop: 16 }}>
            <div
              style={{
                background: cardBg,
                padding: 0,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              }}
            >
              {loading ? (
                <div style={{ padding: 24 }}><Loader /></div>
              ) : (
                <UserHistoryTabs history={history} isDark={isDark} />
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}