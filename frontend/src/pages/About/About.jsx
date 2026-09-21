import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import aboutHeroImg from '../../assets/images/image.png';
import Footer from '../../components/Footer';
import { useTheme } from '../../context/ThemeContext';
import leavesFrame from '../../assets/images/backgrounds/leaves-frame.jpg';
import {
  Users, Heart, Handshake, Sprout, Target, ShieldCheck, Users2,
  Leaf, Globe, Play, ArrowRight, HandHeart, X, GraduationCap, Cross,
} from 'lucide-react';

/* ---------- decorative bits ---------- */

function DotGrid({ style, color }) {
  return (
    <svg width="90" height="70" viewBox="0 0 90 70" style={style}>
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={10 + col * 18} cy={10 + row * 18} r="3" fill={color} />
        ))
      )}
    </svg>
  );
}

function LeafSprig({ style, color }) {
  return (
    <svg width="26" height="46" viewBox="0 0 26 46" style={style}>
      <path d="M13 2 C 22 11, 22 33, 13 44 C 4 33, 4 11, 13 2 Z" fill={color} />
      <path d="M13 2 L13 44" stroke="#fff" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function BirdDoodle({ style, color }) {
  return (
    <svg width="26" height="14" viewBox="0 0 26 14" style={style}>
      <path d="M0 8 C4 2, 9 2, 13 7 C17 2, 22 2, 26 8 C21 6, 17 7, 13 11 C9 7, 5 6, 0 8 Z" fill={color} />
    </svg>
  );
}

/* Wavy divider transitioning the hero into the page background below */
function WaveDivider({ isDark }) {
  const bands = isDark
    ? ['#0f766e', '#115e59', '#0f172a']
    : ['#5eead4', '#2dd4bf', '#f0fdfa'];
  return (
    <svg
      viewBox="0 0 1440 140"
      preserveAspectRatio="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: -1, width: '100%', height: 110, display: 'block' }}
    >
      <path d="M0,60 C240,120 480,10 720,50 C960,90 1200,30 1440,70 L1440,140 L0,140 Z" fill={bands[0]} opacity="0.55" />
      <path d="M0,90 C240,50 480,130 720,90 C960,50 1200,110 1440,80 L1440,140 L0,140 Z" fill={bands[1]} opacity="0.6" />
      <path d="M0,115 C240,140 480,95 720,120 C960,145 1200,105 1440,120 L1440,140 L0,140 Z" fill={bands[2]} />
    </svg>
  );
}

function IconBadge({ icon: Icon, style, isDark }) {
  return (
    <div
      style={{
        position: 'absolute', width: 60, height: 60, borderRadius: 16,
        background: isDark ? '#1e293b' : '#fff',
        boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.4)' : '0 10px 25px rgba(22,163,74,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}
    >
      <Icon size={24} color={isDark ? '#4ade80' : '#16a34a'} />
    </div>
  );
}

/* ---------- video modal ---------- */

function VideoModal({ videoId, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', width: '100%', maxWidth: 800 }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: -44, right: 0, background: '#fff',
            border: 'none', borderRadius: '50%', width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <X size={18} color="#0f172a" />
        </button>
        <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="HopeCare video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- mission card illustration (hands + globe + sprout) ---------- */

function GlobeSproutIllustration({ isDark }) {
  return (
    <svg viewBox="0 0 260 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="260" height="220" fill={isDark ? '#0b3b2e' : '#ecfdf5'} />
      <ellipse cx="130" cy="150" rx="150" ry="70" fill={isDark ? '#0f172a' : '#d1fae5'} opacity="0.5" />
      {/* hands */}
      <path d="M40 190 C40 150, 70 140, 90 150 L170 150 C190 140, 220 150, 220 190 Z" fill={isDark ? '#166534' : '#a7f3d0'} />
      {/* globe */}
      <circle cx="130" cy="120" r="55" fill={isDark ? '#14532d' : '#34d399'} />
      <ellipse cx="130" cy="120" rx="55" ry="20" fill="none" stroke={isDark ? '#166534' : '#a7f3d0'} strokeWidth="2" opacity="0.7" />
      <path d="M130 65 C 110 90, 110 150, 130 175" fill="none" stroke={isDark ? '#166534' : '#a7f3d0'} strokeWidth="2" opacity="0.7" />
      <path d="M130 65 C 150 90, 150 150, 130 175" fill="none" stroke={isDark ? '#166534' : '#a7f3d0'} strokeWidth="2" opacity="0.7" />
      {/* sprout */}
      <path d="M130 90 C 130 60, 110 45, 100 20" stroke={isDark ? '#4ade80' : '#16a34a'} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M130 90 C 130 55, 150 40, 160 15" stroke={isDark ? '#4ade80' : '#16a34a'} strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="98" cy="16" rx="9" ry="16" transform="rotate(-25 98 16)" fill={isDark ? '#4ade80' : '#22c55e'} />
      <ellipse cx="162" cy="11" rx="9" ry="16" transform="rotate(25 162 11)" fill={isDark ? '#4ade80' : '#22c55e'} />
    </svg>
  );
}

export default function About() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showVideo, setShowVideo] = useState(false);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const values = [
    { icon: Heart, title: t('about.compassion'), text: t('about.compassionText'), iconBg: isDark ? '#14532d' : '#dcfce7', iconFg: isDark ? '#4ade80' : '#16a34a' },
    { icon: ShieldCheck, title: t('about.integrity'), text: t('about.integrityText'), iconBg: isDark ? '#1e3a5f' : '#dbeafe', iconFg: isDark ? '#60a5fa' : '#2563eb' },
    { icon: Users2, title: t('about.community'), text: t('about.communityText'), iconBg: isDark ? '#3b1e5e' : '#f3e8ff', iconFg: isDark ? '#c084fc' : '#9333ea' },
    { icon: Leaf, title: t('about.sustainability'), text: t('about.sustainabilityText'), iconBg: isDark ? '#14532d' : '#dcfce7', iconFg: isDark ? '#4ade80' : '#16a34a' },
  ];

  const stats = [
    { icon: Users, value: '10K+', label: t('about.statsLivesImpacted') },
    { icon: HandHeart, value: '250+', label: t('about.statsProjectsCompleted') },
    { icon: Users2, value: '500+', label: t('about.statsVolunteers') },
    { icon: Globe, value: '15+', label: t('about.statsCountriesReached') },
  ];

  // Tint applied to the WHOLE photo (see the overlay div below), including
  // the strip behind/above the sticky navbar — previously this tint only
  // started below the navbar, so that strip stayed on the raw bright photo
  // no matter what theme was active.
  const pageBg = isDark ? 'rgba(2,6,4,0.94)' : 'rgba(255,255,255,0.2)';
  const headingColor = isDark ? '#f1f5f9' : '#0f172a';
  const bodyColor = isDark ? '#94a3b8' : '#4b5563';
  const accentGreen = isDark ? '#4ade80' : '#16a34a';
  const accentGreenDeep = isDark ? '#22c55e' : '#15803d';

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
        <Navbar />

        {/* Hero — sits directly on the tinted photo now (no separate
            `background: pageBg` needed here anymore, the overlay covers it) */}
        <section style={{
          position: 'relative', overflow: 'hidden',
          padding: '56px 20px 130px',
        }}>
          <DotGrid style={{ position: 'absolute', top: 60, left: '5%', opacity: 0.6 }} color={isDark ? '#166534' : '#6ee7b7'} />
          <BirdDoodle style={{ position: 'absolute', top: 70, left: '38%' }} color={isDark ? '#166534' : '#0f766e'} />
          <BirdDoodle style={{ position: 'absolute', top: 100, left: '43%' }} color={isDark ? '#166534' : '#0f766e'} />

          <div
            className="container"
            style={{
              position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center',
              gap: 50, flexWrap: 'wrap',
            }}
          >
            {/* Left copy */}
            <div style={{ flex: 1, minWidth: 320 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: isDark ? '#14532d' : '#ffffff', color: accentGreen, fontWeight: 700, fontSize: 13,
                padding: '8px 16px', borderRadius: 20, letterSpacing: 0.5, marginBottom: 22,
                border: `1px solid ${isDark ? '#166534' : '#bbf7d0'}`,
              }}>
                <Leaf size={15} /> {t('about.badge')}
              </div>

              <h1 style={{ fontSize: 46, fontWeight: 800, color: headingColor, lineHeight: 1.15, margin: 0 }}>
                {t('about.title1')}<br />
                <span style={{ color: accentGreenDeep }}>
                  {t('about.title2')}
                </span>
              </h1>
              <div style={{ width: 56, height: 4, borderRadius: 2, background: accentGreen, margin: '18px 0 22px' }} />

              <p style={{ color: bodyColor, fontSize: 16, lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
                {t('about.description')}
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a
                  href="https://wa.me/919345818583?text=Hi%2C%20I'd%20like%20to%20join%20HopeCare%20and%20get%20involved!"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: `linear-gradient(90deg, ${accentGreen}, ${accentGreenDeep})`,
                    color: '#fff', fontWeight: 700, fontSize: 15,
                    padding: '14px 26px', borderRadius: 30, textDecoration: 'none',
                    boxShadow: '0 8px 20px rgba(22,163,74,0.3)',
                  }}
                >
                  <Heart size={17} fill="#fff" /> {t('about.joinUs')}
                </a>
                <button
                  onClick={() => setShowVideo(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: isDark ? '#1e293b' : '#fff', color: accentGreen, fontWeight: 700, fontSize: 15,
                    padding: '14px 26px', borderRadius: 30, border: `2px solid ${accentGreen}`,
                    cursor: 'pointer',
                  }}
                >
                  <Play size={16} fill={accentGreen} color={accentGreen} /> {t('about.watchVideo')}
                </button>
              </div>
            </div>

            {/* Right: heart-shaped photo with floating badges + quote */}
            <div style={{ flex: 1, minWidth: 380, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <LeafSprig style={{ position: 'absolute', left: -10, top: -10 }} color={isDark ? '#166534' : '#86efac'} />

              <svg width="0" height="0" aria-hidden="true">
                <defs>
                  <clipPath id="heartClip" clipPathUnits="userSpaceOnUse">
                    <path d="M150,266 C88,205 18,142 18,80 C18,36 53,9 93,9 C115,9 138,22 150,49 C162,22 185,9 207,9 C247,9 282,36 282,80 C282,142 212,205 150,266 Z" />
                  </clipPath>
                </defs>
              </svg>

              <div style={{ position: 'relative', width: 300, height: 300, flexShrink: 0 }}>
                <div style={{
                  position: 'absolute', inset: -16, borderRadius: '50%',
                  border: `2px dashed ${isDark ? '#166534' : '#6ee7b7'}`,
                }} />
                <div style={{ width: 300, height: 266, clipPath: 'url(#heartClip)', overflow: 'hidden', margin: '17px 0' }}>
                  <img
                    src={aboutHeroImg}
                    alt="Children we support"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
                  />
                </div>

                <IconBadge icon={HandHeart} isDark={isDark} style={{ top: 4, left: -22 }} />
                <IconBadge icon={GraduationCap} isDark={isDark} style={{ top: 4, right: -22 }} />
                <IconBadge icon={Cross} isDark={isDark} style={{ bottom: 20, left: -30 }} />
                <IconBadge icon={Users} isDark={isDark} style={{ bottom: 20, right: -30 }} />
              </div>

              <div style={{
                maxWidth: 150, flexShrink: 0,
                fontStyle: 'italic', fontWeight: 700, fontSize: 18, lineHeight: 1.35,
                color: isDark ? '#bbf7d0' : '#065f46',
              }}>
                "{t('about.quote', { defaultValue: 'Small contributions, Big change.' })}"
              </div>
            </div>
          </div>

          <WaveDivider isDark={isDark} />
        </section>

        {/* Mission + Values — no `background: pageBg` needed here anymore,
            the overlay above already tints the whole page */}
        <div>
          <section className="container" style={{ padding: '70px 20px' }}>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'stretch' }}>

            {/* Mission card */}
            <div
              style={{
                flex: '1 1 340px',
                position: 'relative',
                borderRadius: 20,
                overflow: 'hidden',
                minHeight: 380,
                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 10px 30px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ position: 'absolute', inset: 0 }}>
                <GlobeSproutIllustration isDark={isDark} />
              </div>
              <div style={{
                position: 'absolute', inset: 0,
                background: isDark
                  ? 'linear-gradient(100deg, rgba(2,10,6,0.92) 0%, rgba(2,10,6,0.55) 55%, rgba(2,10,6,0.15) 100%)'
                  : 'linear-gradient(100deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.7) 55%, rgba(255,255,255,0.15) 100%)',
              }} />

              <div style={{ position: 'relative', padding: '32px 30px', maxWidth: 320 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%', background: isDark ? '#14532d' : '#dcfce7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                }}>
                  <Target size={22} color={accentGreen} />
                </div>
                <h3 style={{ margin: '0 0 14px', fontWeight: 800, color: headingColor, fontSize: 22 }}>
                  {t('about.missionTitle')}
                </h3>
                <p style={{ color: bodyColor, lineHeight: 1.7, fontSize: 15, marginBottom: 26 }}>
                  {t('about.missionText')}
                </p>
                <button
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: isDark ? '#1e293b' : '#fff', color: accentGreen, fontWeight: 700, fontSize: 14,
                    padding: '11px 20px', borderRadius: 24, border: `1px solid ${isDark ? '#166534' : '#bbf7d0'}`, cursor: 'pointer',
                  }}
                >
                  {t('about.learnMore')} <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Values */}
            <div style={{ flex: '2 1 500px' }}>
              <h3 style={{ margin: '0 0 4px', fontWeight: 800, color: headingColor, fontSize: 22 }}>{t('about.valuesTitle')}</h3>
              <div style={{ width: 40, height: 3, background: accentGreen, borderRadius: 2, marginBottom: 22 }} />
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 30,
              }}>
                {values.map((v) => {
                  const Icon = v.icon;
                  return (
                    <div
                      key={v.title}
                      style={{
                        background: isDark ? '#1e293b' : '#fff',
                        border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                        borderRadius: 14,
                        padding: '20px 18px',
                        boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div style={{
                        width: 46, height: 46, borderRadius: '50%', background: v.iconBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                      }}>
                        <Icon size={20} color={v.iconFg} />
                      </div>
                      <div style={{ fontWeight: 700, color: headingColor, fontSize: 15.5, marginBottom: 6 }}>{v.title}</div>
                      <p style={{ color: isDark ? '#94a3b8' : '#6b7280', fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>{v.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* Stats bar */}
              <div
                style={{
                  background: isDark
                    ? 'linear-gradient(90deg, rgba(20,83,45,0.92) 0%, rgba(5,46,22,0.92) 100%)'
                    : 'linear-gradient(90deg, rgba(220,252,231,0.92) 0%, rgba(236,253,245,0.92) 100%)',
                  borderRadius: 16, padding: '26px 30px',
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 20,
                }}
              >
                {stats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', background: accentGreen,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Icon size={20} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: isDark ? '#4ade80' : '#15803d', fontSize: 22, lineHeight: 1.1 }}>{s.value}</div>
                        <div style={{ color: isDark ? '#cbd5e1' : '#374151', fontSize: 13 }}>{s.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        </div>

        {showVideo && (
          <VideoModal videoId="R8sE-LeCftY" onClose={() => setShowVideo(false)} />
        )}

        <Footer />
      </div>
    </div>
  );
}