import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, HeartHandshake, HandHeart, Megaphone, Users, UserCircle,
  BarChart3, Settings, Search, Bell, ChevronDown, LogOut, AlertTriangle, Check,
  Sun, Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/notificationService';
import { searchService } from '../services/searchService';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/donations', label: 'Donations', icon: HeartHandshake },
  { to: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
  { to: '/admin/beneficiaries', label: 'Beneficiaries', icon: Users },
  { to: '/admin/donors', label: 'Donors', icon: UserCircle },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/urgent-campaign', label: 'Urgent', icon: AlertTriangle },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function formatNotifDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Where each result type should navigate to. Detail routes aren't confirmed,
// so this lands on the relevant list page for now.
const SEARCH_ROUTES = {
  Donor: '/admin/donors',
  Campaign: '/admin/campaigns',
  Beneficiary: '/admin/beneficiaries',
};

export default function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Resolve 'system' to whichever it currently renders as, so the icon reflects
  // what's actually on screen rather than the literal stored preference.
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setSearchLoading(true);
      searchService.search(searchTerm.trim())
        .then((data) => {
          setSearchResults(data);
          setSearchOpen(true);
        })
        .catch(() => {
          setSearchResults([]);
          setSearchOpen(true);
        })
        .finally(() => setSearchLoading(false));
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const handleResultClick = (result) => {
    setSearchOpen(false);
    setSearchTerm('');
    const route = SEARCH_ROUTES[result.type] || SEARCH_ROUTES[result.Type];
    if (route) navigate(route);
  };

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load the unread count once on mount so the badge shows without opening the dropdown
  useEffect(() => {
    notificationService.getUnreadCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, []);

  const openNotifications = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) {
      setNotifLoading(true);
      setNotifError(false);
      notificationService.getRecent()
        .then((data) => setNotifications(data))
        .catch(() => setNotifError(true))
        .finally(() => setNotifLoading(false));
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silently ignore — not worth surfacing a toast for a read-state update
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', background: 'var(--card-bg)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 30,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10, marginRight: 20, flexShrink: 0,
          border: '1px solid var(--border)', borderRadius: 999, padding: '7px 16px 7px 7px',
          background: 'var(--card-bg)',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#fff', border: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <HandHeart size={20} color="#2563eb" strokeWidth={2} />
        </div>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--dark)' }}>HopeCare</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>Foundation</div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 12px', borderRadius: 10,
              color: isActive ? '#2563eb' : 'var(--gray)',
              background: isActive ? '#eef2ff' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'background 0.15s ease',
            })}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 1, height: 26, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />

        <div ref={searchRef} style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, background: '#eff6ff',
            border: '1px solid #dbeafe', borderRadius: 999, padding: '9px 16px', width: 220,
          }}>
            <Search size={15} color="#2563eb" />
            <input
              placeholder="Search anything..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
              style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, background: 'transparent', width: '100%', color: 'var(--dark)' }}
            />
          </div>

          {searchOpen && (
            <div style={{
              position: 'absolute', top: 46, left: 0, background: 'var(--card-bg)',
              border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 12px 28px rgba(16,24,40,0.12)',
              width: 320, maxHeight: 360, overflowY: 'auto', zIndex: 20,
            }}>
              {searchLoading ? (
                <div style={{ padding: '20px 16px', textAlign: 'center', color: '#6b7280', fontSize: 13.5 }}>
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center', color: '#6b7280', fontSize: 13.5 }}>
                  No results for "{searchTerm}"
                </div>
              ) : (
                searchResults.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => handleResultClick(r)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none',
                      borderBottom: '1px solid var(--border)', background: 'none', cursor: 'pointer', display: 'block',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--dark)' }}>{r.label}</div>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, color: '#2563eb', background: '#eff6ff',
                        borderRadius: 6, padding: '2px 6px', flexShrink: 0,
                      }}>
                        {r.type}
                      </span>
                    </div>
                    {r.subtitle && (
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{r.subtitle}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 38, height: 38, borderRadius: '50%', background: 'var(--card-bg)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          {isDark ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6b7280" />}
        </button>

        <div ref={notifRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={openNotifications}
            style={{
              position: 'relative', width: 38, height: 38, borderRadius: '50%', background: 'var(--card-bg)',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Bell size={17} color="#6b7280" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4, background: '#2563eb', color: '#fff',
                fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 17, height: 17,
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--card-bg)',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute', top: 46, right: 0, background: 'var(--card-bg)',
              border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 12px 28px rgba(16,24,40,0.12)',
              width: 320, maxHeight: 420, overflowY: 'auto', zIndex: 20,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
                      color: '#2563eb', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0,
                    }}
                  >
                    <Check size={13} /> Mark all read
                  </button>
                )}
              </div>

              {notifLoading ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6b7280', fontSize: 13.5 }}>
                  Loading...
                </div>
              ) : notifError ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#dc2626', fontSize: 13.5 }}>
                  Couldn't load notifications.
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6b7280', fontSize: 13.5 }}>
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.notificationId}
                    onClick={() => !n.isRead && handleMarkAsRead(n.notificationId)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none',
                      borderBottom: '1px solid var(--border)', background: n.isRead ? 'none' : '#eff6ff',
                      cursor: n.isRead ? 'default' : 'pointer', display: 'block',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      {!n.isRead && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb', marginTop: 5, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 13.5, color: 'var(--dark)' }}>{n.title}</div>
                        <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>{n.message}</div>
                        <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 4 }}>{formatNotifDate(n.createdAt)}</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <div onClick={() => setMenuOpen((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <div style={{
              position: 'relative', width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg,#60a5fa,#2563eb)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13,
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              <span style={{
                position: 'absolute', bottom: 1, right: 1, width: 9, height: 9,
                borderRadius: '50%', background: '#22c55e', border: '2px solid var(--card-bg)',
              }} />
            </div>
            <ChevronDown size={15} color="#9ca3af" />
          </div>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: 46, right: 0, background: 'var(--card-bg)',
              border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 12px 28px rgba(16,24,40,0.12)',
              minWidth: 170, overflow: 'hidden', zIndex: 20,
            }}>
              <button
                onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'none', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--dark)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <UserCircle size={16} /> Profile
              </button>
              <button
                onClick={handleLogout}
                style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'none', fontSize: 14, cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 10 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}