import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  Wallet, Users, Megaphone, HeartHandshake, Search, Bell, ChevronDown,
  ArrowUpRight, TrendingUp, Award, Sparkles, UserCircle, LogOut,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';

const CATEGORY_COLORS = { Education: '#2563eb', Healthcare: '#16a34a', 'Food & Shelter': '#d97706', Environment: '#7c3aed', Others: '#ec4899' };
const REGION_COLORS = { North: '#16a34a', South: '#2563eb', East: '#d97706', West: '#7c3aed', Central: '#ec4899' };

function formatCompact(value) {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)}K`;
  return `₹${value}`;
}

function ChangeBadge({ value }) {
  const positive = value >= 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: positive ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
      <ArrowUpRight size={14} style={{ transform: positive ? 'none' : 'rotate(90deg)' }} />
      {Math.abs(value)}% from last month
    </span>
  );
}

function ProgressBar({ percent, color }) {
  return (
    <div style={{ height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: 4 }} />
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    reportService.dashboardSummary().then(setSummary);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!summary) return (
    <div style={{ display: 'flex' }}><Sidebar /><Loader label="Loading dashboard..." /></div>
  );

  const statCards = [
    { label: 'Total Donations', value: `₹${summary.totalDonations.toLocaleString()}`, change: summary.totalDonationsChange, color: '#16a34a', bg: '#dcfce7', icon: Wallet },
    { label: 'Total Donors', value: summary.totalDonors, change: summary.totalDonorsChange, color: '#2563eb', bg: '#dbeafe', icon: Users },
    { label: 'Total Campaigns', value: summary.totalCampaigns, change: summary.totalCampaignsChange, color: '#d97706', bg: '#fef3c7', icon: Megaphone },
    { label: 'Total Beneficiaries', value: summary.totalBeneficiaries, change: summary.totalBeneficiariesChange, color: '#7c3aed', bg: '#ede9fe', icon: HeartHandshake },
  ];

  const footerCards = [
    { label: 'Active Campaigns', value: summary.activeCampaigns, change: summary.activeCampaignsChange, color: '#16a34a', bg: '#dcfce7', icon: Megaphone },
    { label: 'Funds Raised', value: `₹${summary.fundsRaisedThisMonth.toLocaleString()}`, change: summary.fundsRaisedChange, color: '#2563eb', bg: '#dbeafe', icon: TrendingUp },
    { label: 'Successful Campaigns', value: summary.successfulCampaigns, change: summary.successfulCampaignsChange, color: '#d97706', bg: '#fef3c7', icon: Award },
    { label: 'Volunteer Hours', value: summary.volunteerHours.toLocaleString(), change: summary.volunteerHoursChange, color: '#7c3aed', bg: '#ede9fe', icon: Sparkles },
  ];

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '28px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Dashboard</h1>
            <p style={{ color: '#6b7280', marginTop: 4, fontSize: 14 }}>
              Welcome back, {user?.name || 'Admin'}! Here's what's happening with your fundraising.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px', width: 240 }}>
              <Search size={16} color="#9ca3af" />
              <input placeholder="Search..." style={{ border: 'none', outline: 'none', fontSize: 14, flex: 1 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <Bell size={20} color="#6b7280" />
              {summary.unreadNotifications > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', fontSize: 10, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {summary.unreadNotifications}
                </span>
              )}
            </div>

            {/* Admin dropdown */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setMenuOpen((v) => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              >
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e0e7ff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#4338ca', fontSize: 13 }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{user?.name || 'Admin'}</span>
                <ChevronDown size={16} color="#9ca3af" />
              </div>

              {menuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 44,
                    right: 0,
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    minWidth: 160,
                    overflow: 'hidden',
                    zIndex: 20,
                  }}
                >
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', background: 'none', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <UserCircle size={16} /> Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', background: 'none', fontSize: 14, cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 10 }}
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

        {/* Stat cards */}
        <div className="grid grid-4" style={{ marginBottom: 20, gap: 20 }}>
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={24} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
                  <ChangeBadge value={s.change} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 2: overview + category + recent donations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Donation Overview</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={summary.monthlyDonations}>
                <defs>
                  <linearGradient id="donationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" fontSize={12} stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis fontSize={12} stroke="#9ca3af" tickFormatter={formatCompact} width={60} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Donations']} />
                <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fill="url(#donationGradient)" dot={{ r: 4, fill: '#2563eb' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Donations by Category</h3>
            <div style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={summary.donationsByCategory} dataKey="total" nameKey="category" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {summary.donationsByCategory.map((entry, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[entry.category] || '#94a3b8'} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -55%)', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Total</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>100%</div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {summary.donationsByCategory.map((c) => (
                <div key={c.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[c.category] || '#94a3b8' }} />
                    {c.category}
                  </span>
                  <span style={{ fontWeight: 600 }}>{c.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>Recent Donations</h3>
              <a href="/admin/donations" style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}>View All</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {summary.recentDonations.map((d) => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0e7ff', overflow: 'hidden', flexShrink: 0 }}>
                    {d.avatarUrl && <img src={d.avatarUrl} alt={d.donorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{d.donorName}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{d.timeAgo}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>₹{d.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: top campaigns + donations over time + region */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>Top Campaigns</h3>
              <a href="/admin/campaigns" style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}>View All</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {summary.topCampaigns.map((c) => (
                <div key={c.id}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
                      {c.thumbnailUrl && <img src={c.thumbnailUrl} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>₹{c.raised.toLocaleString()} / ₹{c.goal.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}><ProgressBar percent={c.percent} color="#16a34a" /></div>
                    <span style={{ fontSize: 13, fontWeight: 600, width: 32 }}>{c.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Donations Over Time</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summary.donationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" fontSize={12} stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis fontSize={12} stroke="#9ca3af" tickFormatter={formatCompact} width={60} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Donations']} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Beneficiaries by Region</h3>
            <div style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={summary.beneficiariesByRegion} dataKey="percent" nameKey="region" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {summary.beneficiariesByRegion.map((entry, i) => (
                      <Cell key={i} fill={REGION_COLORS[entry.region] || '#94a3b8'} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {summary.beneficiariesByRegion.map((r) => (
                <div key={r.region} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: REGION_COLORS[r.region] || '#94a3b8' }} />
                    {r.region}
                  </span>
                  <span style={{ fontWeight: 600 }}>{r.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="grid grid-4" style={{ gap: 20 }}>
          {footerCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={24} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
                  <ChangeBadge value={s.change} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}