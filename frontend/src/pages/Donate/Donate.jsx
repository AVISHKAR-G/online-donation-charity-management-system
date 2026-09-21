import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import { campaignService } from '../../services/campaignService';
import { toast } from 'react-toastify';

// Full-page decorative background (girl illustration + "your support changes lives" panel)
import donationBg from '../../assets/images/donate/donation-bg.png';
// Green hands-and-heart charity icon (used in card header)
import handsHeartIcon from '../../assets/images/donate/hands-heart-icon.png';

// Payment method logo images — cropped to logos/icons only (no baked-in text,
// so the label renders crisp as real HTML text instead of shrinking with the image)
import upiLogos from '../../assets/images/payment/01_UPI_GooglePay_PhonePe_Paytm_logo.png';
import cardLogos from '../../assets/images/payment/02_Credit_Debit_Card_logo.png';
import netbankingLogo from '../../assets/images/payment/03_Net_Banking_logo.png';
import paypalLogo from '../../assets/images/payment/04_PayPal_logo.png';
import walletLogos from '../../assets/images/payment/05_Wallet_AmazonPay_logo.png';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI / Google Pay / PhonePe / Paytm', image: upiLogos, showLabel: true },
  { value: 'CARD', label: 'Credit / Debit Card', image: cardLogos, showLabel: true },
  { value: 'NETBANKING', label: 'Net Banking', image: netbankingLogo, showLabel: true },
  { value: 'PAYPAL', label: 'PayPal', image: paypalLogo, showLabel: false },
  { value: 'WALLET', label: 'Wallet (Paytm / Amazon Pay)', image: walletLogos, showLabel: true },
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
      <div
        style={{
          minHeight: 'calc(100vh - 72px)',
          backgroundImage: `url(${donationBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '20px 20px 48px',
        }}
      >
        <div
          style={{
            background: 'var(--card-bg)',
            borderRadius: 16,
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            padding: 32,
            width: '100%',
            maxWidth: 520,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(22,163,74,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img src={handsHeartIcon} alt="" style={{ width: '68%', height: '68%', objectFit: 'contain' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--dark)' }}>Make A Donation</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                {campaign?.title || 'Loading campaign...'}
              </p>
            </div>
          </div>

          {/* Quick Amount */}
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 10, color: 'var(--dark)' }}>
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
                  border: selectedQuick === value ? 'none' : '1px solid var(--border)',
                  background: selectedQuick === value ? '#16a34a' : 'var(--card-bg)',
                  color: selectedQuick === value ? '#fff' : 'var(--dark)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ₹{value.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Other Amount */}
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 8, color: 'var(--dark)' }}>
            Other Amount
          </label>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid var(--border)', borderRadius: 8,
              padding: '0 14px', marginBottom: 24, background: 'var(--card-bg)',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>₹</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={handleOtherAmount}
              style={{
                width: '100%',
                padding: '12px 0',
                border: 'none',
                outline: 'none',
                fontSize: 16,
                background: 'transparent',
                color: 'var(--dark)',
              }}
            />
          </div>

          {/* Payment Method */}
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 12, color: 'var(--dark)' }}>
            Select Payment Method
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {PAYMENT_METHODS.map((pm) => (
              <label
                key={pm.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  padding: '10px 16px',
                  minHeight: 52,
                  borderRadius: 10,
                  border: method === pm.value ? '1.5px solid #16a34a' : '1px solid var(--border)',
                  background: method === pm.value ? 'rgba(22,163,74,0.05)' : 'transparent',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={pm.value}
                  checked={method === pm.value}
                  onChange={() => setMethod(pm.value)}
                  style={{ width: 18, height: 18, flexShrink: 0, accentColor: '#16a34a' }}
                />
                <img
                  src={pm.image}
                  alt={pm.label}
                  style={{ height: 28, width: 'auto', objectFit: 'contain', flexShrink: 0 }}
                />
                {pm.showLabel && (
                  <span style={{ fontSize: 13.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {pm.label}
                  </span>
                )}
              </label>
            ))}
          </div>

          {/* Anonymous */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, cursor: 'pointer', color: 'var(--dark)' }}>
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
            style={{
              width: '100%', padding: '14px', fontSize: 16, fontWeight: 700,
              background: '#16a34a', border: 'none', borderRadius: 10, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
            }}
          >
            🔒 Proceed to Pay →
          </button>

          <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)', marginTop: 14, marginBottom: 0 }}>
            ✅ Your transaction is secure and encrypted.
          </p>
        </div>
      </div>
    </>
  );
}