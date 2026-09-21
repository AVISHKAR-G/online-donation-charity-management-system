import {
  Check,
  Sparkles,
  Fingerprint,
  User,
  Tag,
  IndianRupee,
  CreditCard,
  Calendar,
  ShieldCheck,
  Download,
  Home,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const rows = [
  { icon: Fingerprint, label: 'Receipt No', valueKey: 'receiptNumber' },
  { icon: User, label: 'Donor', valueKey: 'donorName' },
  { icon: Tag, label: 'Campaign', valueKey: 'campaignTitle' },
  { icon: IndianRupee, label: 'Amount', valueKey: 'amount' },
  { icon: CreditCard, label: 'Payment Method', valueKey: 'paymentMethod' },
  { icon: Fingerprint, label: 'Transaction ID', valueKey: 'transactionId' },
  { icon: Calendar, label: 'Date', valueKey: 'date' },
];

export default function ReceiptCard({ donation }) {
  const formattedAmount = `₹${Number(donation.amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
  })}`;
  const formattedDate = new Date(donation.date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const displayValues = {
    receiptNumber: donation.receiptNumber,
    donorName: donation.donorName,
    campaignTitle: donation.campaignTitle,
    amount: formattedAmount,
    paymentMethod: donation.paymentMethod,
    transactionId: donation.transactionId,
    date: formattedDate,
  };

  return (
    <div
      className="card"
      style={{
        maxWidth: 480,
        margin: '0 auto',
        textAlign: 'center',
        padding: '36px 40px',
        borderRadius: 20,
        background: '#fff',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
      }}
    >
      {/* Checkmark with sparkle decoration */}
      <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 20px' }}>
        <Sparkles
          color="#facc15"
          size={18}
          style={{ position: 'absolute', top: 0, left: 4 }}
        />
        <Sparkles
          color="#facc15"
          size={14}
          style={{ position: 'absolute', top: 6, right: 0 }}
        />
        <Sparkles
          color="#a7f3d0"
          size={12}
          style={{ position: 'absolute', bottom: 4, left: 0 }}
        />
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '12px auto 0',
          }}
        >
          <Check color="#fff" size={38} strokeWidth={3.5} />
        </div>
      </div>

      <h2 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 6px' }}>Thank You!</h2>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>
        Your donation has been received successfully.
      </p>

      {/* Detail rows */}
      <div style={{ textAlign: 'left' }}>
        {rows.map(({ icon: Icon, label, valueKey }, i) => (
          <div
            key={valueKey + i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '10px 0',
              borderBottom:
                i < rows.length - 1 ? '1px dashed #d1d5db' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon size={17} color="#16a34a" />
              <span style={{ fontWeight: 600, fontSize: 14.5, color: '#111827' }}>
                {label}:
              </span>
            </div>
            <span style={{ fontSize: 14.5, color: '#374151' }}>
              {displayValues[valueKey]}
            </span>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          textAlign: 'left',
          background: '#ecfdf5',
          borderRadius: 12,
          padding: '14px 16px',
          margin: '24px 0',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldCheck color="#fff" size={18} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14.5, color: '#111827' }}>
            Your support makes a real difference.
          </div>
          <div style={{ fontSize: 13.5, color: '#4b5563' }}>
            We appreciate your generosity and trust in us.
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => window.print()}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 16px',
            fontWeight: 600,
            fontSize: 14.5,
            cursor: 'pointer',
          }}
        >
          <Download size={17} />
          Download / Print Receipt
        </button>
        <Link
          to="/"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#fff',
            color: '#16a34a',
            border: '1.5px solid #16a34a',
            borderRadius: 10,
            padding: '12px 16px',
            fontWeight: 600,
            fontSize: 14.5,
            textDecoration: 'none',
          }}
        >
          <Home size={17} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}