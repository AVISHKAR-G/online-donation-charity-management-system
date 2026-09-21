import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import Loader from '../../components/Loader';
import { paymentService } from '../../services/paymentService';
import { toast } from 'react-toastify';
import {
  CreditCard, User, IndianRupee, Landmark, ShieldCheck, Calendar, Settings,
  FileText, CheckCircle2, Trash2, MessageCircle,
} from 'lucide-react';

function UpiIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14">
      <path d="M2 1 L2 13 L12 7 Z" fill="#f97316" />
      <path d="M2 7 L2 13 L12 7 Z" fill="#16a34a" />
    </svg>
  );
}

function DotGrid({ style }) {
  return (
    <svg width="150" height="90" viewBox="0 0 150 90" style={style}>
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 24} r="3.5" fill="#93c5fd" />
        ))
      )}
    </svg>
  );
}

function TopRightBlob({ style }) {
  return (
    <svg viewBox="0 0 260 160" style={style} fill="none">
      <path d="M260 0 L260 110 C 210 140, 140 120, 115 80 C 90 40, 130 0, 180 0 Z" fill="#c7d2fe" opacity="0.5" />
    </svg>
  );
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    paymentService.getAll().then(setPayments).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, transactionId) => {
    if (!window.confirm(`Delete payment record "${transactionId}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await paymentService.remove(id);
      toast.success('Payment record deleted');
      load();
    } catch {
      toast.error('Failed to delete payment record');
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
          }}
        >
          <TopRightBlob style={{ position: 'absolute', top: 0, right: 0, width: 260, height: 160 }} />
          <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 30, position: 'relative', zIndex: 1 }}>
            Payments
          </h1>
          <div style={{ width: 40, height: 3, borderRadius: 2, background: '#2563eb', marginTop: 8, position: 'relative', zIndex: 1 }} />
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14, position: 'relative' }}>
          <DotGrid style={{ position: 'absolute', left: -6, bottom: -6, opacity: 0.5, zIndex: 0 }} />
          {loading ? (
            <div style={{ padding: 30 }}><Loader /></div>
          ) : (
            <div style={{ overflowX: 'auto', position: 'relative', zIndex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#eff6ff', borderBottom: '2px solid #dbeafe' }}>
                    {[
                      { icon: CreditCard, label: 'TRANSACTION ID' },
                      { icon: User, label: 'DONOR' },
                      { icon: IndianRupee, label: 'AMOUNT' },
                      { icon: Landmark, label: 'METHOD' },
                      { icon: ShieldCheck, label: 'STATUS' },
                      { icon: Calendar, label: 'DATE' },
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
                  {payments.map((p, i) => (
                    <tr
                      key={p.paymentId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: i % 2 === 1 ? '#fafbff' : '#fff',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 30, height: 30, borderRadius: 8, background: '#dbeafe',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}
                          >
                            <FileText size={14} color="#2563eb" />
                          </div>
                          <span style={{ color: '#111827', fontWeight: 600 }}>{p.transactionId}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#374151' }}>{p.donor}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#2563eb' }}>
                        ₹{p.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                          <UpiIcon /> {p.method}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: p.status === 'Success' ? '#dcfce7' : '#fef9c3',
                            color: p.status === 'Success' ? '#16a34a' : '#ca8a04',
                            padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                          }}
                        >
                          {p.status === 'Success' && <CheckCircle2 size={13} />}
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={13} color="#93c5fd" />
                          {new Date(p.paymentDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          disabled={deletingId === p.paymentId}
                          onClick={() => handleDelete(p.paymentId, p.transactionId)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: '#fff', color: '#dc2626', border: '1px solid #fca5a5',
                            borderRadius: 8, padding: '7px 14px', fontWeight: 600,
                            fontSize: 13, cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                          {deletingId === p.paymentId ? '...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
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