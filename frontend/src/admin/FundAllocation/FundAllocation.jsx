import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import Loader from '../../components/Loader';
import { beneficiaryService } from '../../services/beneficiaryService';
import { toast } from 'react-toastify';
import {
  Wallet, User, Megaphone, IndianRupee, ShieldCheck, Settings, Trash2, MessageCircle,
} from 'lucide-react';

const STATUS = { Pending: 0, Approved: 1, Rejected: 2, Completed: 3, FundsDisbursed: 4 };

function statusStyle(status) {
  const map = {
    Pending: { bg: '#fef9c3', fg: '#ca8a04', dot: '#eab308' },
    Approved: { bg: '#dbeafe', fg: '#2563eb', dot: '#3b82f6' },
    Rejected: { bg: '#fee2e2', fg: '#dc2626', dot: '#ef4444' },
    Completed: { bg: '#dcfce7', fg: '#16a34a', dot: '#22c55e' },
    FundsDisbursed: { bg: '#dbeafe', fg: '#2563eb', dot: '#3b82f6' },
  };
  return map[status] || { bg: '#f1f5f9', fg: '#475569', dot: '#94a3b8' };
}

function DotGrid({ style }) {
  return (
    <svg width="120" height="70" viewBox="0 0 120 70" style={style}>
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={12 + col * 20} cy={12 + row * 24} r="3.5" fill="#93c5fd" />
        ))
      )}
    </svg>
  );
}

export default function FundAllocation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    beneficiaryService.getAll().then(setData).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await beneficiaryService.updateStatus(id, status);
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete allocation record for "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await beneficiaryService.remove(id);
      toast.success('Record deleted');
      await load();
    } catch {
      toast.error('Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Topbar />
      <div style={{ padding: 30, position: 'relative' }}>

        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 16,
            background: 'linear-gradient(90deg, #eef2ff 0%, #eff6ff 60%, #f5f3ff 100%)',
            padding: '20px 28px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 56, height: 56, borderRadius: 14, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37,99,235,0.15)', flexShrink: 0,
              position: 'relative', zIndex: 1,
            }}
          >
            <Wallet size={26} color="#2563eb" />
          </div>
          <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 30, position: 'relative', zIndex: 1 }}>
            Fund Allocation
          </h1>
          <DotGrid style={{ position: 'absolute', right: 20, top: 14, opacity: 0.6 }} />
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
          {loading ? (
            <div style={{ padding: 30 }}><Loader /></div>
          ) : data.length === 0 ? (
            <p style={{ padding: 20 }}>No beneficiary requests yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#eff6ff', borderBottom: '2px solid #dbeafe' }}>
                    {[
                      { icon: User, label: 'BENEFICIARY' },
                      { icon: Megaphone, label: 'CAMPAIGN' },
                      { icon: IndianRupee, label: 'ALLOCATED AMOUNT' },
                      { icon: ShieldCheck, label: 'STATUS' },
                      { icon: Settings, label: 'ACTIONS' },
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
                  {data.map((f, i) => {
                    const st = statusStyle(f.status);
                    return (
                      <tr
                        key={f.beneficiaryId}
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
                            <span style={{ fontWeight: 600, color: '#111827' }}>{f.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#374151' }}>{f.campaignTitle}</td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#2563eb' }}>
                          ₹{f.allocatedAmount.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              background: st.bg, color: st.fg,
                              padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            }}
                          >
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.dot }} />
                            {f.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {f.status === 'Pending' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success"
                                  disabled={updatingId === f.beneficiaryId}
                                  onClick={() => handleStatusChange(f.beneficiaryId, STATUS.Approved)}
                                >
                                  {updatingId === f.beneficiaryId ? '...' : 'Approve'}
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  disabled={updatingId === f.beneficiaryId}
                                  onClick={() => handleStatusChange(f.beneficiaryId, STATUS.Rejected)}
                                >
                                  {updatingId === f.beneficiaryId ? '...' : 'Reject'}
                                </button>
                              </>
                            )}
                            {f.status === 'Approved' && (
                              <button
                                className="btn btn-sm btn-primary"
                                disabled={updatingId === f.beneficiaryId}
                                onClick={() => handleStatusChange(f.beneficiaryId, STATUS.FundsDisbursed)}
                              >
                                {updatingId === f.beneficiaryId ? '...' : 'Mark Disbursed'}
                              </button>
                            )}
                            <button
                              disabled={deletingId === f.beneficiaryId}
                              onClick={() => handleDelete(f.beneficiaryId, f.name)}
                              title="Delete this record"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#fff', color: '#dc2626', border: '1px solid #fca5a5',
                                borderRadius: 8, padding: '7px 14px', fontWeight: 600,
                                fontSize: 13, cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={13} />
                              {deletingId === f.beneficiaryId ? '...' : 'Delete'}
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