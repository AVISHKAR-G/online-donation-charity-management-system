import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { donorService } from '../../services/donorService';
import {
  Search, User, Mail, IndianRupee, ArrowLeftRight, Shield, Settings, Power, MessageCircle,
} from 'lucide-react';

function DotGrid({ style }) {
  return (
    <svg width="30" height="140" viewBox="0 0 30 140" style={style}>
      {Array.from({ length: 7 }).map((_, row) => (
        <circle key={row} cx={12} cy={12 + row * 20} r="3.5" fill="#93c5fd" />
      ))}
    </svg>
  );
}

function TopRightBlob({ style }) {
  return (
    <svg viewBox="0 0 260 160" style={style} fill="none">
      <path d="M260 0 L260 120 C 200 150, 120 130, 90 85 C 60 40, 100 0, 160 0 Z" fill="#c7d2fe" opacity="0.5" />
    </svg>
  );
}

export default function Donors() {
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (q = '') => {
    setLoading(true);
    donorService.getAll(q).then(setDonors).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const handleToggle = async (id) => {
    await donorService.toggleActive(id);
    load(search);
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 30, background: '#f8fafc', minHeight: '100vh', position: 'relative' }}>

        {/* Header banner */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 16,
            background: 'linear-gradient(90deg, #eef2ff 0%, #eff6ff 60%, #f5f3ff 100%)',
            padding: '20px 28px',
            marginBottom: 24,
          }}
        >
          <TopRightBlob style={{ position: 'absolute', top: 0, right: 0, width: 260, height: 160 }} />
          <DotGrid style={{ position: 'absolute', left: 0, bottom: 10, opacity: 0.5 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, zIndex: 1, position: 'relative' }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: 12, background: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <User size={22} color="#fff" />
            </div>
            <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 30 }}>Donors</h1>
          </div>

          <form
            onSubmit={handleSearch}
            style={{ display: 'flex', gap: 10, zIndex: 1, position: 'relative', maxWidth: 500 }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#2563eb" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
                  border: '1px solid #dbeafe', fontSize: 14,
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#2563eb', color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              <Search size={15} /> Search
            </button>
          </form>
        </div>

        {/* Table card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
          {loading ? (
            <div style={{ padding: 30 }}><Loader /></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#eff6ff', borderBottom: '2px solid #dbeafe' }}>
                    {[
                      { icon: User, label: 'NAME' },
                      { icon: Mail, label: 'EMAIL' },
                      { icon: IndianRupee, label: 'TOTAL DONATED' },
                      { icon: ArrowLeftRight, label: 'TRANSACTIONS' },
                      { icon: Shield, label: 'STATUS' },
                      { icon: Settings, label: 'ACTION' },
                    ].map(({ icon: Icon, label }) => (
                      <th
                        key={label}
                        style={{
                          textAlign: 'left', padding: '14px 18px', color: '#1e3a8a',
                          fontSize: 13, fontWeight: 700, letterSpacing: 0.4, whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Icon size={14} color="#2563eb" /> {label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {donors.map((d, i) => (
                    <tr
                      key={d.userId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: i % 2 === 1 ? '#fafbff' : '#fff',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 34, height: 34, borderRadius: '50%', background: '#dbeafe',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}
                          >
                            <User size={16} color="#2563eb" />
                          </div>
                          <span style={{ fontWeight: 700, color: '#111827' }}>{d.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#374151' }}>{d.email}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#2563eb' }}>
                        ₹{d.totalDonated.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#111827' }}>
                        {d.totalTransactions}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: d.isActive ? '#dcfce7' : '#fee2e2',
                            color: d.isActive ? '#16a34a' : '#dc2626',
                            padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                          }}
                        >
                          <span
                            style={{
                              width: 7, height: 7, borderRadius: '50%',
                              background: d.isActive ? '#22c55e' : '#ef4444',
                            }}
                          />
                          {d.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => handleToggle(d.userId)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: '#fff',
                            color: d.isActive ? '#dc2626' : '#16a34a',
                            border: `1px solid ${d.isActive ? '#fca5a5' : '#86efac'}`,
                            borderRadius: 8, padding: '7px 14px', fontWeight: 600,
                            fontSize: 13, cursor: 'pointer',
                          }}
                        >
                          <Power size={13} /> {d.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Floating chat bubble */}
        <div
          style={{
            position: 'fixed', bottom: 24, right: 24,
            width: 52, height: 52, borderRadius: '50%',
            background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(37,99,235,0.4)', cursor: 'pointer',
          }}
        >
          <MessageCircle size={22} color="#fff" />
        </div>
      </div>
    </div>
  );
}