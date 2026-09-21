import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Heart, BarChart3, HandHeart, User,
  Info, Mail, ChevronDown, Sun, Moon,
  LayoutGrid, Settings, LogOut, Check, ArrowRight, AlertTriangle, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProfileData, getProfileCompletion, syncProfileFromServer } from '../utils/profilePhoto';
import { donorService } from '../services/donorService';
import NotificationBell from './NotificationBell';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';

const NAV_ICONS = {
  home: Home,
  campaigns: Heart,
  impact: BarChart3,
  applyForHelp: HandHeart,
  myActivity: User,
  about: Info,
  contact: Mail,
};

// Change these if your routes are named differently
const ROUTES = {
  profile: '/profile',
  completeProfile: '/profile?edit=1',
  donations: '/profile#donation-history',
  campaigns: '/my-activity',
  settings: '/settings',
};

const LEVEL_STYLES = {
  empty:    { bg: '#fee2e2', accent: '#dc2626', ring: '#ef4444', text: '#7f1d1d' },
  partial:  { bg: '#fef3c7', accent: '#d97706', ring: '#f59e0b', text: '#78350f' },
  complete: { bg: '#dcfce7', accent: '#16a34a', ring: '#22c55e', text: '#14532d' },
};

/* Warning / progress card at the top of the account dropdown */
function ProfileStatusCard({ completion, photo, onNavigate }) {
  const { percent, missing, level } = completion;
  const st = LEVEL_STYLES[level];

  const R = 40;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - percent / 100);

  const title =
    level === 'empty' ? 'Your profile is empty!'
    : level === 'partial' ? `Your profile is ${percent}% complete`
    : 'Your profile is complete!';

  const body =
    level === 'empty' ? 'Add your details to get a better experience and start donating.'
    : level === 'partial'
      ? `Still needed: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ` +${missing.length - 3} more` : ''}.`
      : 'Thanks for keeping your details up to date.';

  return (
    <div className="hc-status-card" style={{ background: st.bg }} role={level === 'complete' ? 'status' : 'alert'}>
      <div className="hc-status-avatar">
        <svg width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
          <circle cx="46" cy="46" r={R} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4" strokeDasharray={level === 'empty' ? '4 4' : undefined} />
          <circle
            cx="46" cy="46" r={R} fill="none" stroke={st.ring} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={offset} transform="rotate(-90 46 46)"
          />
        </svg>
        <div className="hc-status-photo">
          {photo ? <img src={photo} alt="" /> : <User size={38} color="#9ca3af" />}
        </div>
        <span className="hc-status-badge" style={{ background: st.accent }}>
          {level === 'complete' ? <Check size={13} color="#fff" strokeWidth={3} /> : '!'}
        </span>
        <span className="hc-status-pct" style={{ color: st.accent }}>{percent}%</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="hc-status-title" style={{ color: st.text }}>{title}</div>
        <div className="hc-status-body" style={{ color: st.text }}>{body}</div>
        {level !== 'complete' && (
          <Link to={ROUTES.completeProfile} className="hc-status-cta" style={{ background: st.accent }} onClick={onNavigate}>
            Complete Profile <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Profile data (details + photo) shared with the Profile page — updates instantly after "Save Changes"
  const profile = useProfileData(user);
  const completion = getProfileCompletion(profile);

  // Blink + warning bubble while the profile is incomplete (donors only).
  // The bubble can be dismissed for the current browser session; the blinking
  // continues until the profile is 100% complete.
  const warnKey = `hc_profile_warn_dismissed_${(user?.email || '').toLowerCase()}`;
  const [warnDismissed, setWarnDismissed] = useState(() => {
    try { return sessionStorage.getItem(warnKey) === '1'; } catch { return false; }
  });
  const needsAttention = isAuthenticated && user?.role !== 'Admin' && completion.level !== 'complete';
  const showWarning = needsAttention && !warnDismissed && !accountOpen && location.pathname !== '/profile';
  const dismissWarning = () => {
    setWarnDismissed(true);
    try { sessionStorage.setItem(warnKey, '1'); } catch { /* ignore */ }
  };

  // Load the saved profile (photo, birthday, address...) from the server once per session
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'Admin') {
      syncProfileFromServer(user, donorService.getMyProfile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.email]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the account dropdown on outside click. This replaces an
  // onBlur + setTimeout approach, which can race with the click on
  // "My Profile" — the dropdown sometimes unmounted before the Link's
  // navigation had a chance to fire, so the click appeared to do nothing.
  useEffect(() => {
    if (!accountOpen) return;
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const navLinks = [
    { to: '/', key: 'home' },
    { to: '/campaigns', key: 'campaigns' },
    { to: '/impact', key: 'impact' },
    ...(isAuthenticated ? [{ to: '/apply-for-help', key: 'applyForHelp' }] : []),
    ...(isAuthenticated ? [{ to: '/my-activity', key: 'myActivity' }] : []),
    { to: '/about', key: 'about' },
    { to: '/contact', key: 'contact' },
  ];

  return (
    <>
      <style>{`
        .hc-navbar-wrap {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 16px 20px;
          transition: padding 0.25s ease;
        }
        .hc-navbar-wrap.scrolled { padding: 9px 20px; }

        .hc-navbar {
          position: relative;
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          border-radius: 26px;
          background: linear-gradient(90deg, #0a5c34 0%, #16a34a 55%, #1c9a4e 100%);
          box-shadow: 0 18px 40px -14px rgba(10,92,52,0.4), 0 2px 8px rgba(10,92,52,0.15);
          font-family: 'Poppins', 'Inter', system-ui, sans-serif;
          /* NOTE: intentionally NOT overflow:hidden here anymore — that was
             clipping the notification/account dropdowns, which render as
             position:absolute children of this element. The rounded-corner
             clipping for the decorative background now happens on
             .hc-navbar-bg instead, which sits behind the real content. */
          transition: box-shadow 0.25s ease, background 0.3s ease;
        }
        .hc-navbar.dark { background: linear-gradient(90deg, #071a10 0%, #0e3322 55%, #10251a 100%); }
        .hc-navbar.dark .hc-logo-panel,
        .hc-navbar.dark .hc-logo-panel::after {
          background: #111827;
        }
        .hc-navbar.dark .hc-account-btn { background: #1f2937; color: #f3f4f6; }
        .hc-navbar-wrap.scrolled .hc-navbar {
          box-shadow: 0 10px 24px -10px rgba(10,92,52,0.45), 0 2px 8px rgba(10,92,52,0.2);
        }

        /* Decorative background layer: this is the thing that gets clipped
           to the rounded pill shape, instead of the whole navbar. */
        .hc-navbar-bg {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .hc-navbar-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 45%);
        }

        .hc-dots-tr {
          position: absolute;
          top: 14px; right: 130px;
          width: 64px; height: 30px;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 5px;
          opacity: 0.16;
        }
        .hc-dots-tr span { width: 3px; height: 3px; border-radius: 50%; background: #fff; }

        .hc-leaf-br { position: absolute; bottom: 0; right: 0; width: 110px; height: 80px; opacity: 0.9; }

        .hc-logo-panel {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          height: 100%;
          padding: 10px 26px 10px 22px;
          background: #fff;
          border-radius: 26px 60px 60px 26px;
          text-decoration: none;
          flex-shrink: 0;
          z-index: 3;
        }
        .hc-logo-panel::after {
          content: '';
          position: absolute;
          top: 0; right: -34px;
          width: 54px; height: 100%;
          background: #fff;
          border-radius: 0 60px 60px 0;
          z-index: -1;
        }
        .hc-dot-grid {
          position: absolute;
          top: 9px; left: 13px;
          width: 28px; height: 18px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          opacity: 0.5;
        }
        .hc-dot-grid span { width: 3px; height: 3px; border-radius: 50%; background: #16a34a; }
        .hc-leaf-corner { position: absolute; bottom: 5px; left: 3px; width: 34px; height: 34px; opacity: 0.9; }

        .hc-tagline { white-space: nowrap; }
        @media (max-width: 1400px) {
          .hc-tagline { display: none; }
          .hc-logo-panel { padding: 10px 20px 10px 20px; }
        }

        .hc-nav-links {
          position: relative;
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 0 14px;
          flex: 1;
          min-width: 0;
          overflow-x: auto;
          scrollbar-width: none;
          white-space: nowrap;
          z-index: 2;
        }
        .hc-nav-links::-webkit-scrollbar { display: none; }

        .hc-nav-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 13px;
          color: rgba(255,255,255,0.92);
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }
        .hc-nav-item svg { flex-shrink: 0; }
        .hc-nav-item:hover { background: rgba(255,255,255,0.12); }

        .hc-nav-item.active {
          background: rgba(0,0,0,0.18);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.15);
          flex-direction: column;
          gap: 2px;
          padding: 7px 14px 5px;
        }
        .hc-nav-item.active .hc-row { display: flex; align-items: center; gap: 6px; }
        .hc-nav-item.active .hc-underline {
          width: 17px; height: 2px; border-radius: 2px; background: #fff; margin-top: 1px;
        }

        .hc-sep { width: 1px; height: 24px; background: rgba(255,255,255,0.25); margin: 0 6px; flex-shrink: 0; }

        .hc-right {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding-right: 16px;
          flex-shrink: 0;
          z-index: 2;
        }

        .hc-lang-wrap {
          display: flex;
          align-items: center;
          color: #fff;
        }
        /* Style ONLY the button that opens the language menu (a direct child of the switcher's wrapper div).
           The language options inside the dropdown are deeper, so they keep their own dark text. */
        .hc-lang-wrap > div > button {
          background: rgba(255,255,255,0.16) !important;
          border: 1px solid rgba(255,255,255,0.28) !important;
          color: #fff !important;
          border-radius: 999px !important;
        }

        .hc-bell-wrap {
          position: relative;
          width: 36px; height: 36px;
          border-radius: 999px;
          background: rgba(255,255,255,0.16);
          border: 1px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }

        .hc-theme-btn {
          width: 36px; height: 36px;
          border-radius: 999px;
          background: rgba(255,255,255,0.16);
          border: 1px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .hc-theme-btn:hover { background: rgba(255,255,255,0.26); transform: translateY(-1px); }

        .hc-account-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: none;
          cursor: pointer;
          padding: 5px 14px 5px 5px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 13px;
          color: #14532d;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .hc-account-avatar {
          width: 27px; height: 27px;
          border-radius: 50%;
          background: #0e6b3a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }
        .hc-account-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .hc-account-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 380px;
          max-width: calc(100vw - 32px);
          box-sizing: border-box;
          padding: 14px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 16px 44px rgba(0,0,0,0.2);
          border: 1px solid #e5e7eb;
          z-index: 200;
          text-align: left;
        }

        .hc-status-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 16px;
          margin-bottom: 10px;
        }
        .hc-status-avatar { position: relative; width: 92px; height: 92px; flex-shrink: 0; }
        .hc-status-avatar svg { position: absolute; inset: 0; }
        .hc-status-photo {
          position: absolute; inset: 9px;
          border-radius: 50%;
          background: #e5e7eb;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .hc-status-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hc-status-badge {
          position: absolute; right: 0; bottom: 8px;
          width: 24px; height: 24px; border-radius: 50%;
          color: #fff; font-weight: 800; font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
        }
        .hc-status-pct {
          position: absolute; left: 50%; bottom: -8px; transform: translateX(-50%);
          background: #fff; border-radius: 999px; padding: 1px 8px;
          font-size: 12px; font-weight: 800; line-height: 1.5;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .hc-status-title { font-size: 16px; font-weight: 800; line-height: 1.3; }
        .hc-status-body { font-size: 13px; line-height: 1.45; margin-top: 4px; opacity: 0.9; }
        .hc-status-cta {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 10px; padding: 8px 16px; border-radius: 8px;
          color: #fff !important; font-size: 13.5px; font-weight: 700; text-decoration: none;
          transition: filter 0.15s ease, transform 0.15s ease;
        }
        .hc-status-cta:hover { filter: brightness(1.08); transform: translateY(-1px); }

        .hc-menu-item {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
          text-align: left;
          padding: 12px 10px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          color: #1f2937;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .hc-menu-item:hover { background: #f3f4f6; }
        .hc-menu-logout, .hc-menu-logout:hover { color: #dc2626; font-weight: 600; }
        .hc-menu-divider { height: 1px; background: #e5e7eb; margin: 6px 10px; }

        /* Blinking attention state on the account button */
        @keyframes hc-blink-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.75); }
          50%      { box-shadow: 0 0 0 9px rgba(239,68,68,0); }
        }
        @keyframes hc-blink-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.3; transform: scale(0.8); }
        }
        @keyframes hc-bubble-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hc-account-btn.needs-attention { animation: hc-blink-ring 1.4s ease-in-out infinite; }
        .hc-attn-dot {
          position: absolute;
          top: -4px; left: -4px;
          width: 17px; height: 17px;
          border-radius: 50%;
          background: #dc2626;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          line-height: 17px;
          text-align: center;
          border: 2px solid #fff;
          box-sizing: content-box;
          margin: -2px 0 0 -2px;
          animation: hc-blink-dot 1s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hc-account-btn.needs-attention,
          .hc-attn-dot { animation: none; }
        }

        .hc-warn-bubble {
          position: absolute;
          top: calc(100% + 14px);
          right: 0;
          width: 300px;
          max-width: calc(100vw - 32px);
          box-sizing: border-box;
          background: #fff;
          border: 1px solid #fecaca;
          border-left: 4px solid #dc2626;
          border-radius: 14px;
          box-shadow: 0 14px 36px rgba(0,0,0,0.22);
          z-index: 190;
          animation: hc-bubble-in 0.3s ease-out;
        }
        .hc-warn-bubble::before {
          content: '';
          position: absolute;
          top: -8px; right: 44px;
          width: 14px; height: 14px;
          background: #fff;
          border-top: 1px solid #fecaca;
          border-left: 1px solid #fecaca;
          transform: rotate(45deg);
        }
        .hc-warn-link {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 40px 14px 14px;
          text-decoration: none;
          color: #7f1d1d;
        }
        .hc-warn-icon { color: #dc2626; flex-shrink: 0; margin-top: 1px; }
        .hc-warn-link strong { display: block; font-size: 14.5px; font-weight: 800; color: #991b1b; }
        .hc-warn-text { display: block; font-size: 13px; line-height: 1.45; margin-top: 2px; color: #4b5563; }
        .hc-warn-cta {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 8px; font-size: 13px; font-weight: 700; color: #dc2626;
        }
        .hc-warn-link:hover .hc-warn-cta { text-decoration: underline; }
        .hc-warn-close {
          position: absolute; top: 8px; right: 8px;
          width: 26px; height: 26px; border-radius: 50%;
          border: none; background: transparent; color: #6b7280;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .hc-warn-close:hover { background: #f3f4f6; color: #111827; }

        .hc-pill-outline {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 7px 16px;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.7);
          color: #fff;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .hc-pill-outline:hover { background: rgba(255,255,255,0.14); transform: translateY(-1px); }

        .hc-pill-solid {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 7px 16px;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          background: #fff;
          color: #15803d;
          white-space: nowrap;
          flex-shrink: 0;
          transition: transform 0.15s ease, box-shadow 0.2s ease;
        }
        .hc-pill-solid:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,0.2); }

        @media (max-width: 1300px) {
          .hc-nav-item .hc-label { display: none; }
          .hc-nav-item { padding: 8px 9px; }
        }
      `}</style>

      <div className={`hc-navbar-wrap${scrolled ? ' scrolled' : ''}`}>
        <header className={`hc-navbar${isDark ? ' dark' : ''}`}>
          <div className="hc-navbar-bg">
            <div className="hc-dots-tr">
              {Array.from({ length: 24 }).map((_, i) => <span key={i} />)}
            </div>
            <svg className="hc-leaf-br" viewBox="0 0 120 90" fill="none">
              <path d="M120 90C100 90 70 78 55 58C43 42 40 22 48 8C60 14 70 28 78 44C88 64 100 80 120 90Z" fill="#ffffff" opacity="0.10" />
              <path d="M120 70C106 70 88 62 78 48C70 37 67 24 72 14C81 18 89 28 95 40C102 54 110 64 120 70Z" fill="#ffffff" opacity="0.14" />
            </svg>
          </div>

          <Link to="/" className="hc-logo-panel">
            <div className="hc-dot-grid">
              {Array.from({ length: 8 }).map((_, i) => <span key={i} />)}
            </div>
            <svg className="hc-leaf-corner" viewBox="0 0 46 46" fill="none">
              <path d="M4 40C4 30 8 20 18 14C22 20 22 30 16 36C12 40 8 41 4 40Z" fill="#1c9a4e" opacity="0.85" />
              <path d="M4 40C10 38 16 34 18 27" stroke="#0a5c34" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <Logo size={30} showTagline light={isDark} taglineClassName="hc-tagline" />
          </Link>

          <nav className="hc-nav-links">
            {navLinks.map((link) => {
              const Icon = NAV_ICONS[link.key];
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`hc-nav-item${isActive ? ' active' : ''}`}
                >
                  {isActive ? (
                    <>
                      <span className="hc-row">
                        {Icon && <Icon size={15} />}
                        <span className="hc-label">{t(`nav.${link.key}`)}</span>
                      </span>
                      <span className="hc-underline" />
                    </>
                  ) : (
                    <>
                      {Icon && <Icon size={15} />}
                      <span className="hc-label">{t(`nav.${link.key}`)}</span>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hc-right">
            <span className="hc-sep" />

            <button
              type="button"
              className="hc-theme-btn"
              onClick={toggleTheme}
              aria-label={isDark ? t('nav.lightMode') || 'Switch to light mode' : t('nav.darkMode') || 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="hc-lang-wrap">
              <LanguageSwitcher />
            </div>

            {isAuthenticated ? (
              <>
                {user.role !== 'Admin' && (
                  <div className="hc-bell-wrap">
                    <NotificationBell />
                  </div>
                )}

                <span className="hc-sep" />

                <div style={{ position: 'relative' }} ref={accountRef}>
                  <button
                    className={`hc-account-btn${needsAttention ? ' needs-attention' : ''}`}
                    onClick={() => setAccountOpen((open) => !open)}
                    title={needsAttention ? 'Your profile is incomplete' : undefined}
                  >
                    {needsAttention && <span className="hc-attn-dot" aria-hidden="true">!</span>}
                    <div className="hc-account-avatar">
                      {profile.profilePicture ? (
                        <img src={profile.profilePicture} alt="" />
                      ) : (
                        <User size={14} color="#fff" />
                      )}
                    </div>
                    <span>{t('nav.hi', { name: (profile.name || user.name).split(' ')[0] })}</span>
                    <ChevronDown size={13} />
                  </button>

                  {showWarning && (
                    <div className="hc-warn-bubble" role="alert">
                      <Link to={ROUTES.completeProfile} className="hc-warn-link">
                        <AlertTriangle size={22} className="hc-warn-icon" />
                        <span>
                          <strong>
                            {completion.level === 'empty' ? 'Your profile is empty' : `Profile ${completion.percent}% complete`}
                          </strong>
                          <span className="hc-warn-text">
                            {completion.level === 'empty'
                              ? 'Go fill in your details to start donating.'
                              : 'Go fill in the remaining details.'}
                          </span>
                          <span className="hc-warn-cta">Fill details <ArrowRight size={13} /></span>
                        </span>
                      </Link>
                      <button type="button" className="hc-warn-close" aria-label="Dismiss warning" onClick={dismissWarning}>
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {accountOpen && (
                    <div className="hc-account-dropdown">
                      {user.role !== 'Admin' && (
                        <ProfileStatusCard
                          completion={completion}
                          photo={profile.profilePicture}
                          onNavigate={() => setAccountOpen(false)}
                        />
                      )}

                      <Link to={ROUTES.profile} className="hc-menu-item" onClick={() => setAccountOpen(false)}>
                        <User size={19} /> {t('nav.profile', 'My Profile')}
                      </Link>
                      <Link to={ROUTES.donations} className="hc-menu-item" onClick={() => setAccountOpen(false)}>
                        <Heart size={19} /> {t('nav.myDonations', 'My Donations')}
                      </Link>
                      <Link to={ROUTES.campaigns} className="hc-menu-item" onClick={() => setAccountOpen(false)}>
                        <LayoutGrid size={19} /> {t('nav.myCampaigns', 'My Campaigns')}
                      </Link>
                      <Link to={ROUTES.settings} className="hc-menu-item" onClick={() => setAccountOpen(false)}>
                        <Settings size={19} /> {t('nav.settings', 'Settings')}
                      </Link>
                      {user.role === 'Admin' && (
                        <Link to="/admin/dashboard" className="hc-menu-item" onClick={() => setAccountOpen(false)}>
                          <BarChart3 size={19} /> {t('nav.admin')}
                        </Link>
                      )}

                      <div className="hc-menu-divider" />

                      <button
                        type="button"
                        className="hc-menu-item hc-menu-logout"
                        onClick={() => {
                          setAccountOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut size={19} /> {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hc-pill-outline">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="hc-pill-solid">
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>
        </header>
      </div>
    </>
  );
}