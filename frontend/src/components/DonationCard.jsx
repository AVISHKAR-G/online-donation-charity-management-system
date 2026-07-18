export default function DonationCard({ donation }) {
  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 600 }}>{donation.campaignTitle}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(donation.date).toLocaleString()}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700, color: '#16a34a' }}>₹{donation.amount.toLocaleString()}</div>
        <span className={`badge ${donation.paymentStatus === 'Success' ? 'badge-success' : 'badge-warning'}`}>
          {donation.paymentStatus}
        </span>
      </div>
    </div>
  );
}
