import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/campaigns', label: 'Campaigns' },
    { to: '/impact', label: 'Our Impact' },
    ...(isAuthenticated ? [{ to: '/apply-for-help', label: 'Apply for Help' }] : []),
    ...(isAuthenticated ? [{ to: '/my-activity', label: 'My Activity' }] : []),
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <style>{`
        /* Original solid gradient kept exactly the same — glass sheen is a subtle overlay on top, not a color change */
        .glass-navbar {
          background: linear-gradient(90deg, #1e3a8a 0%, #1d4ed8 100%);
          position: relative;
          /* overflow removed so dropdowns like the notification bell aren't clipped */
        }
        .glass-navbar::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 50%);
          pointer-events: none;
          border-radius: inherit;
        }
        .glass-navbar::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
        }

        /* Glass hover/active pill for nav links — translucent white blob, doesn't alter navbar's own color */
        .glass-link {
          position: relative;
          padding: 8px 14px;
          border-radius: 999px;
          color: rgba(255,255,255,0.88);
          text-decoration: none;
          transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease, color 0.25s ease;
        }
        .glass-link:hover {
          background: rgba(255,255,255,0.16);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(0,0,0,0.12);
          color: #fff;
          transform: translateY(-1px);
        }
        .glass-link.active {
          background: rgba(255,255,255,0.22);
          color: #fff;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 10px rgba(0,0,0,0.15);
        }

        .glass-pill-outline {
          position: relative;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.35);
          color: #fff;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .glass-pill-outline:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }

        .glass-pill-solid {
          position: relative;
          background: #2563eb;
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 14px rgba(37,99,235,0.35);
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .glass-pill-solid:hover {
          transform: translateY(-1px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 6px 18px rgba(37,99,235,0.45);
        }

        .glass-name-link {
          color: rgba(255,255,255,0.92);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 999px;
          transition: background 0.2s ease;
        }
        .glass-name-link:hover {
          background: rgba(255,255,255,0.14);
        }
      `}</style>

      <header
        className="glass-navbar"
        style={{
          padding: scrolled ? '10px 0' : '16px 0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          transition: 'padding 0.2s ease',
          boxShadow: scrolled ? '0 4px 16px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', zIndex: 1,
          }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Logo size={30} light />
          </Link>

          <nav style={{ display: 'flex', gap: 4, fontWeight: 600, fontSize: 14 }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`glass-link${location.pathname === link.to ? ' active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                {user.role !== 'Admin' && <NotificationBell />}
                <Link to="/profile" className="glass-name-link" style={{ fontWeight: 600, fontSize: 14 }}>
                  Hi, {user.name.split(' ')[0]}
                </Link>
                {user.role === 'Admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="glass-pill-outline"
                    style={{
                      display: 'inline-flex', alignItems: 'center',
                      borderRadius: 999, padding: '9px 18px', fontWeight: 600, fontSize: 14,
                      textDecoration: 'none',
                    }}
                  >
                    Admin
                  </Link>
                )}
                <button
                  className="glass-pill-solid"
                  onClick={handleLogout}
                  style={{
                    borderRadius: 999, padding: '9px 18px', fontWeight: 600, fontSize: 14,
                    cursor: 'pointer', border: 'none',
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="glass-pill-outline"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    borderRadius: 999, padding: '9px 18px', fontWeight: 600, fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="glass-pill-solid"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    borderRadius: 999, padding: '9px 18px', fontWeight: 600, fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}