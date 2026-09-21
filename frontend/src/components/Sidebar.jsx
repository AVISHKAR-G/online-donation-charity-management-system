import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, HeartHandshake, Megaphone, Users, UserCircle,
  CreditCard, Wallet, BarChart3, Settings, Heart, AlertTriangle
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/urgent-campaign', label: 'Urgent Campaign', icon: AlertTriangle },
  { to: '/admin/donations', label: 'Donations', icon: HeartHandshake },
  { to: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
  { to: '/admin/beneficiaries', label: 'Beneficiaries', icon: Users },
  { to: '/admin/donors', label: 'Donors', icon: UserCircle },
  { to: '/admin/users', label: 'Users', icon: UserCircle },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/fund-allocation', label: 'Fund Allocation', icon: Wallet },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: 252,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1e2a5e 0%, #161f47 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '26px 18px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 6px', marginBottom: 36 }}>
        <div
          style={{
            width: 42, height: 42, borderRadius: 13,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <Heart size={22} color="#fff" fill="#fff" />
        </div>
        <div style={{ color: '#fff', lineHeight: 1.25 }}>
          <div style={{ fontWeight: 800, fontSize: 15.5, letterSpacing: '-0.01em' }}>HopeCare</div>
          <div style={{ fontSize: 12.5, opacity: 0.6, fontWeight: 500 }}>Foundation</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, overflowY: 'auto' }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 12,
              color: isActive ? '#1e2a5e' : 'rgba(255,255,255,0.72)',
              background: isActive ? '#fff' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              fontSize: 14,
              textDecoration: 'none',
              transition: 'background 0.15s ease, color 0.15s ease',
              boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '';
              e.currentTarget.style.color = '';
            }}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          marginTop: 26,
          padding: 22,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%)',
          textAlign: 'center',
          boxShadow: '0 8px 20px rgba(79,70,229,0.35)',
        }}
      >
        <div
          style={{
            width: 54, height: 54, borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          <Heart size={24} color="#fff" fill="#fff" />
        </div>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 18, lineHeight: 1.4 }}>
          Every donation<br />makes a difference
        </div>
        <button
          onClick={() => navigate('/campaigns')}
          style={{
            width: '100%', padding: '11px 0', borderRadius: 12, border: 'none',
            background: '#fff', color: '#4f46e5', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            transition: 'transform 0.1s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Donate Now
        </button>
      </div>
    </div>
  );
}