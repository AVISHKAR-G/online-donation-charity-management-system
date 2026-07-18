import { Check } from 'lucide-react';

export default function ReceiptCard({ donation }) {
  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <Check color="#fff" size={30} strokeWidth={3} />
      </div>
      <h2>Thank You!</h2>
      <p style={{ color: '#6b7280', marginBottom: 20 }}>Your donation has been received.</p>
      <div style={{ textAlign: 'left', fontSize: 14, lineHeight: 2 }}>
        <div><strong>Receipt No:</strong> {donation.receiptNumber}</div>
        <div><strong>Donor:</strong> {donation.donorName}</div>
        <div><strong>Campaign:</strong> {donation.campaignTitle}</div>
        <div><strong>Amount:</strong> ₹{donation.amount.toLocaleString()}</div>
        <div><strong>Payment Method:</strong> {donation.paymentMethod}</div>
        <div><strong>Transaction ID:</strong> {donation.transactionId}</div>
        <div><strong>Date:</strong> {new Date(donation.date).toLocaleString()}</div>
      </div>
    </div>
  );
}