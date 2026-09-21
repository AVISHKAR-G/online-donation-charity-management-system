import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import Loader from '../../components/Loader';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import {
  Wallet, Users, Megaphone, HeartHandshake, ArrowUpRight, TrendingUp, Award, Sparkles,
} from 'lucide-react';

const CATEGORY_COLORS = { Education: '#2563eb', Healthcare: '#16a34a', 'Food & Shelter': '#d97706', Environment: '#7c3aed', Others: '#ec4899' };
const REGION_COLORS = { North: '#16a34a', South: '#2563eb', East: '#d97706', West: '#7c3aed', Central: '#ec4899' };

const INDIA_GEO_URL = 'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson';

const STATE_TO_REGION = {
  'Jammu and Kashmir': 'North', 'Ladakh': 'North', 'Himachal Pradesh': 'North',
  'Punjab': 'North', 'Haryana': 'North', 'NCT of Delhi': 'North', 'Delhi': 'North',
  'Uttarakhand': 'North', 'Uttar Pradesh': 'North', 'Chandigarh': 'North',

  'Karnataka': 'South', 'Andhra Pradesh': 'South', 'Telangana': 'South',
  'Tamil Nadu': 'South', 'Kerala': 'South', 'Puducherry': 'South',
  'Andaman and Nicobar Islands': 'South', 'Lakshadweep': 'South',

  'Bihar': 'East', 'Jharkhand': 'East', 'West Bengal': 'East', 'Odisha': 'East', 'Orissa': 'East',
  'Assam': 'East', 'Sikkim': 'East', 'Arunachal Pradesh': 'East', 'Nagaland': 'East',
  'Manipur': 'East', 'Mizoram': 'East', 'Tripura': 'East', 'Meghalaya': 'East',

  'Rajasthan': 'West', 'Gujarat': 'West', 'Maharashtra': 'West', 'Goa': 'West',
  'Dadra and Nagar Haveli': 'West', 'Daman and Diu': 'West', 'Dadra and Nagar Haveli and Daman and Diu': 'West',

  'Madhya Pradesh': 'Central', 'Chhattisgarh': 'Central',
};

function formatCompact(value) {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)}K`;
  return `₹${value}`;
}

function ChangeBadge({ value }) {
  const positive = value >= 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5,
      color: positive ? '#16a34a' : '#dc2626', fontWeight: 600,
      background: positive ? '#f0fdf4' : '#fef2f2', padding: '2px 8px', borderRadius: 20,
    }}>
      <ArrowUpRight size={13} style={{ transform: positive ? 'none' : 'rotate(90deg)' }} />
      {Math.abs(value)}%
      <span style={{ color: '#9ca3af', fontWeight: 400 }}>vs last month</span>
    </span>
  );
}

function ProgressBar({ percent, color }) {
  return (
    <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: 4 }} />
    </div>
  );
}

function EmptyState({ icon = '📊', label = 'No data yet.', height = 220 }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height, color: 'var(--text-muted)', fontSize: 13.5, textAlign: 'center', gap: 6,
    }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      {label}
    </div>
  );
}

function IndiaRegionMap({ data }) {
  const regionMap = {};
  data.forEach((r) => { regionMap[r.region] = r.percent; });
  const opacityFor = (region) => Math.max(0.35, Math.min(1, (regionMap[region] ?? 0) / 100));

  const getStateName = (geo) => {
    const props = geo.properties || {};
    const candidates = ['NAME_1', 'st_nm', 'name', 'NAME', 'ST_NM', 'State', 'state'];
    for (const key of candidates) {
      if (props[key]) return props[key];
    }
    const foundKey = Object.keys(props).find((k) => k.toLowerCase().includes('name'));
    return foundKey ? props[foundKey] : null;
  };

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [82.8, 22.5], scale: 750 }}
        width={400}
        height={400}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={INDIA_GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = getStateName(geo);
              const region = STATE_TO_REGION[stateName];
              const fill = region ? REGION_COLORS[region] : '#e5e7eb';
              const opacity = region ? opacityFor(region) : 1;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  fillOpacity={opacity}
                  stroke="#fff"
                  strokeWidth={0.6}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}

const cardStyle = {
  background: 'var(--card-bg)',
  borderRadius: 18,
  border: '1px solid var(--border)',
  boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  padding: 22,
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    reportService.dashboardSummary().then(setSummary);
  }, []);

  if (!summary) return (
    <div style={{ background: 'var(--body-bg)', minHeight: '100vh' }}>
      <Topbar />
      <Loader label="Loading dashboard..." />
    </div>
  );

  const statCards = [
    { label: 'Total Donations', value: `₹${summary.totalDonations.toLocaleString()}`, change: summary.totalDonationsChange, color: '#16a34a', bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', icon: Wallet },
    { label: 'Total Donors', value: summary.totalDonors, change: summary.totalDonorsChange, color: '#2563eb', bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', icon: Users },
    { label: 'Total Campaigns', value: summary.totalCampaigns, change: summary.totalCampaignsChange, color: '#d97706', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)', icon: Megaphone },
    { label: 'Total Beneficiaries', value: summary.totalBeneficiaries, change: summary.totalBeneficiariesChange, color: '#7c3aed', bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', icon: HeartHandshake },
  ];

  const footerCards = [
    { label: 'Active Campaigns', value: summary.activeCampaigns, change: summary.activeCampaignsChange, color: '#16a34a', bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', icon: Megaphone },
    { label: 'Funds Raised', value: `₹${summary.fundsRaisedThisMonth.toLocaleString()}`, change: summary.fundsRaisedChange, color: '#2563eb', bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', icon: TrendingUp },
    { label: 'Successful Campaigns', value: summary.successfulCampaigns, change: summary.successfulCampaignsChange, color: '#d97706', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)', icon: Award },
    { label: 'Volunteer Hours', value: summary.volunteerHours.toLocaleString(), change: summary.volunteerHoursChange, color: '#7c3aed', bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', icon: Sparkles },
  ];

  const hasCategoryData = summary.donationsByCategory && summary.donationsByCategory.length > 0;
  const hasRegionData = summary.beneficiariesByRegion && summary.beneficiariesByRegion.length > 0;
  const hasRecentDonations = summary.recentDonations && summary.recentDonations.length > 0;
  const hasTopCampaigns = summary.topCampaigns && summary.topCampaigns.length > 0;

  return (
    <div style={{ background: 'var(--body-bg)', minHeight: '100vh' }}>
      <Topbar notificationCount={summary.unreadNotifications} />

      <div style={{ padding: '30px 36px' }}>
        {/* Welcome header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--dark)' }}>
            Welcome back, {user?.name || 'Admin'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 14.5 }}>
            Here's what's happening with your fundraising today.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-4" style={{ marginBottom: 24, gap: 22 }}>
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={24} color={s.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 23, fontWeight: 800, margin: '2px 0 6px', letterSpacing: '-0.02em', color: 'var(--dark)' }}>{s.value}</div>
                  <ChangeBadge value={s.change} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 2: overview + category + recent donations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 22, marginBottom: 22 }}>
          <div style={cardStyle}>
            <h3 style={{ marginBottom: 18, fontSize: 16, fontWeight: 700, color: 'var(--dark)' }}>Donation Overview</h3>
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

          <div style={cardStyle}>
            <h3 style={{ marginBottom: 18, fontSize: 16, fontWeight: 700, color: 'var(--dark)' }}>Donations by Category</h3>
            {hasCategoryData ? (
              <>
                <div style={{ position: 'relative' }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={summary.donationsByCategory} dataKey="total" nameKey="category" innerRadius={55} outerRadius={80} paddingAngle={2}>
                        {summary.donationsByCategory.map((entry, i) => (
                          <Cell key={i} fill={CATEGORY_COLORS[entry.category] || '#94a3b8'} stroke="var(--card-bg)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -55%)', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--dark)' }}>100%</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {summary.donationsByCategory.map((c) => (
                    <div key={c.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--dark)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[c.category] || '#94a3b8' }} />
                        {c.category}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--dark)' }}>{c.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState icon="🥧" label="No category data yet." />
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--dark)' }}>Recent Donations</h3>
              <a href="/admin/donations" style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>View All</a>
            </div>
            {hasRecentDonations ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {summary.recentDonations.map((d) => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', overflow: 'hidden',
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#4338ca',
                    }}>
                      {d.avatarUrl
                        ? <img src={d.avatarUrl} alt={d.donorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : d.donorName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>{d.donorName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.timeAgo}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a' }}>₹{d.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="💳" label="No recent donations yet." height={180} />
            )}
          </div>
        </div>

        {/* Row 3: top campaigns + donations over time + region */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22, marginBottom: 22 }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--dark)' }}>Top Campaigns</h3>
              <a href="/admin/campaigns" style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>View All</a>
            </div>
            {hasTopCampaigns ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {summary.topCampaigns.map((c) => (
                  <div key={c.id}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--hover-bg)', overflow: 'hidden', flexShrink: 0 }}>
                        {c.thumbnailUrl && <img src={c.thumbnailUrl} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹{c.raised.toLocaleString()} / ₹{c.goal.toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}><ProgressBar percent={c.percent} color="#16a34a" /></div>
                      <span style={{ fontSize: 13, fontWeight: 700, width: 32, color: 'var(--dark)' }}>{c.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="📢" label="No campaigns yet." height={180} />
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginBottom: 18, fontSize: 16, fontWeight: 700, color: 'var(--dark)' }}>Donations Over Time</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summary.donationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" fontSize={12} stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis fontSize={12} stroke="#9ca3af" tickFormatter={formatCompact} width={60} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Donations']} />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginBottom: 18, fontSize: 16, fontWeight: 700, color: 'var(--dark)' }}>Beneficiaries by Region</h3>
            {hasRegionData ? (
              <>
                <IndiaRegionMap data={summary.beneficiariesByRegion} />
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {summary.beneficiariesByRegion.map((r) => (
                    <div key={r.region} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--dark)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: REGION_COLORS[r.region] || '#94a3b8' }} />
                        {r.region}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--dark)' }}>{r.percent}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState icon="📍" label="No beneficiary region data yet." />
            )}
          </div>
        </div>

        {/* Footer strip */}
        <div className="grid grid-4" style={{ gap: 22 }}>
          {footerCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={24} color={s.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 21, fontWeight: 800, margin: '2px 0 6px', letterSpacing: '-0.02em', color: 'var(--dark)' }}>{s.value}</div>
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