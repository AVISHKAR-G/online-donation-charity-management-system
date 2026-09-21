import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import Loader from '../../components/Loader';
import UserHistoryTabs from '../../components/UserHistoryTabs';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import {
  User, Mail, Phone, ShieldCheck, ShieldAlert, Circle, Settings, Power, Clock,
} from 'lucide-react';

function roleStyle(role) {
  if (role === 'Admin') return { bg: '#fee2e2', fg: '#dc2626', icon: ShieldAlert };
  return { bg: '#dbeafe', fg: '#2563eb', icon: ShieldCheck };
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyUser, setHistoryUser] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = () => userService.getAll().then(setUsers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    try {
      await userService.toggleActive(id);
      toast.success('User status updated');
      load();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const openHistory = async (user) => {
    setHistoryUser(user);
    setHistoryLoading(true);
    try {
      const data = await userService.getHistory(user.userId);
      setHistory(data);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => { setHistoryUser(null); setHistory(null); };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Topbar />
      <div style={{ padding: 30, position: 'relative' }}>

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
          <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 30 }}>Users</h1>
          <div style={{ width: 40, height: 3, borderRadius: 2, background: '#2563eb', marginTop: 8 }} />
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
                      { icon: Phone, label: 'PHONE' },
                      { icon: ShieldCheck, label: 'ROLE' },
                      { icon: Circle, label: 'STATUS' },
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
                  {users.map((u, i) => {
                    const rs = roleStyle(u.role);
                    const RoleIcon = rs.icon;
                    return (
                      <tr
                        key={u.userId}
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
                            <span style={{ fontWeight: 700, color: '#111827' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#374151' }}>{u.email}</td>
                        <td style={{ padding: '14px 18px', color: '#374151' }}>{u.phone || '-'}</td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              background: rs.bg, color: rs.fg,
                              padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            }}
                          >
                            <RoleIcon size={13} /> {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              background: u.isActive ? '#dcfce7' : '#fee2e2',
                              color: u.isActive ? '#16a34a' : '#dc2626',
                              padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            }}
                          >
                            <span
                              style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: u.isActive ? '#22c55e' : '#ef4444',
                              }}
                            />
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleToggle(u.userId)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#fff', color: '#dc2626', border: '1px solid #fca5a5',
                                borderRadius: 8, padding: '7px 14px', fontWeight: 600,
                                fontSize: 13, cursor: 'pointer',
                              }}
                            >
                              <Power size={13} /> Toggle
                            </button>
                            <button
                              onClick={() => openHistory(u)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#fff', color: '#2563eb', border: '1px solid #93c5fd',
                                borderRadius: 8, padding: '7px 14px', fontWeight: 600,
                                fontSize: 13, cursor: 'pointer',
                              }}
                            >
                              <Clock size={13} /> View History
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {historyUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 800, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2>{historyUser.name}'s History</h2>
              <button className="btn btn-outline" onClick={closeHistory}>Close</button>
            </div>
            {historyLoading ? <Loader /> : <UserHistoryTabs history={history} />}
          </div>
        </div>
      )}
    </div>
  );
}