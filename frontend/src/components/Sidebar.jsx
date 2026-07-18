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
        width: 240,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1e3a8a 0%, #1e2a5e 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 32 }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Heart size={22} color="#fff" fill="#fff" />
        </div>
        <div style={{ color: '#fff', lineHeight: 1.2 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>HopeCare</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Foundation</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 10,
              color: isActive ? '#1e3a8a' : 'rgba(255,255,255,0.85)',
              background: isActive ? '#fff' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: 14,
              textDecoration: 'none',
              transition: 'background 0.15s ease',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          marginTop: 24,
          padding: 20,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
          }}
        >
          <Heart size={26} color="#fff" fill="#fff" />
        </div>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          Every donation<br />makes a difference
        </div>
        <button
          onClick={() => navigate('/campaigns')}
          style={{
            width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
            background: '#fff', color: '#4338ca', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          Donate Now
        </button>
      </div>
    </div>
  );
}