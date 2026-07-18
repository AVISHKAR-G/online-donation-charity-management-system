import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import { campaignService } from '../../services/campaignService';
import { toast } from 'react-toastify';
import { Smartphone, CreditCard, Landmark, Globe, Wallet } from 'lucide-react';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI / Google Pay / PhonePe / Paytm', icon: Smartphone },
  { value: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
  { value: 'NETBANKING', label: 'Net Banking', icon: Landmark },
  { value: 'PAYPAL', label: 'PayPal', icon: Globe },
  { value: 'WALLET', label: 'Wallet (Paytm / Amazon Pay)', icon: Wallet },
];

export default function Donate() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState(1000);
  const [selectedQuick, setSelectedQuick] = useState(1000);
  const [method, setMethod] = useState('UPI');
  const [anonymous, setAnonymous] = useState(false);

  useEffect(() => {
    campaignService.getById(campaignId)
      .then(setCampaign)
      .catch(() => toast.error('Could not load campaign details.'))
      .finally(() => setLoading(false));
  }, [campaignId]);

  const handleQuickAmount = (value) => {
    setSelectedQuick(value);
    setAmount(value);
  };

  const handleOtherAmount = (e) => {
    const value = Number(e.target.value);
    setAmount(value);
    setSelectedQuick(null);
  };

  const handleProceed = () => {
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    navigate(`/payment/${campaignId}`, {
      state: { amount, method, anonymous },
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ padding: '60px 20px' }}>
          <Loader label="Loading campaign..." />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '48px 20px', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            padding: 32,
            width: '100%',
            maxWidth: 520,
          }}
        >
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Make A Donation</h2>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>
            {campaign?.title || 'Loading campaign...'}
          </p>

          {/* Quick Amount */}
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 10 }}>
            Quick Amount (₹)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
            {QUICK_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleQuickAmount(value)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: selectedQuick === value ? 'none' : '1px solid #d1d5db',
                  background: selectedQuick === value ? '#2563eb' : '#fff',
                  color: selectedQuick === value ? '#fff' : '#111827',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ₹{value.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Other Amount */}
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
            Other Amount
          </label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={handleOtherAmount}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              marginBottom: 24,
              fontSize: 16,
            }}
          />

          {/* Payment Method — fixed alignment */}
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 12 }}>
            Select Payment Method
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
            {PAYMENT_METHODS.map((pm) => {
              const Icon = pm.icon;
              return (
                <label
                  key={pm.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.value}
                    checked={method === pm.value}
                    onChange={() => setMethod(pm.value)}
                    style={{ width: 18, height: 18, flexShrink: 0 }}
                  />
                  <Icon size={18} color="#4b5563" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#1f2937' }}>{pm.label}</span>
                </label>
              );
            })}
          </div>

          {/* Anonymous */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            <span>Donate anonymously</span>
          </label>

          <button
            className="btn btn-primary"
            onClick={handleProceed}
            style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 700 }}
          >
            Proceed to Pay
          </button>
        </div>
      </div>
    </>
  );
}