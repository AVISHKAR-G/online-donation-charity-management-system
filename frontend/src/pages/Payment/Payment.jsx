import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import { paymentService } from '../../services/paymentService';
import { donationService } from '../../services/donationService';
import { toast } from 'react-toastify';

const METHOD_MAP = { UPI: 0, CARD: 1, NETBANKING: 2, PAYPAL: 3, WALLET: 4 };

export default function Payment() {
  const { campaignId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle -> creating -> awaiting_gateway -> verifying -> success -> failed
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!state) {
      navigate(`/donate/${campaignId}`);
      return;
    }
    startPayment();
  }, [state]);

  if (!state) return null;

  const { amount, method, anonymous } = state;

  const startPayment = async () => {
    try {
      setStatus('creating');
      const order = await paymentService.createOrder(amount, METHOD_MAP[method] ?? 0);

      const options = {
        key: order.keyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency || 'INR',
        name: 'HopeCare',
        description: 'Donation Payment',
        order_id: order.orderId,
        handler: async function (response) {
          setStatus('verifying');
          try {
            const verifyResult = await paymentService.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (!verifyResult.success) {
              setErrorMsg(verifyResult.message || 'Payment verification failed.');
              setStatus('failed');
              return;
            }

            const donation = await donationService.create({
              paymentId: verifyResult.paymentId,
              campaignId: Number(campaignId),
              isAnonymous: anonymous,
            });

            setStatus('success');
            setTimeout(() => navigate(`/receipt/${donation.donationId}`, { replace: true }), 800);
          } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Could not finalize your donation.');
            setStatus('failed');
          }
        },
        modal: {
          ondismiss: function () {
            setErrorMsg('Payment was cancelled.');
            setStatus('failed');
          },
        },
        theme: { color: '#16a34a' },
      };

      setStatus('awaiting_gateway');
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setErrorMsg(response.error?.description || 'Payment failed.');
        setStatus('failed');
      });
      rzp.open();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not initiate payment.');
      setStatus('failed');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        {(status === 'creating' || status === 'awaiting_gateway') && (
          <Loader label="Opening secure payment window..." />
        )}
        {status === 'verifying' && <Loader label="Verifying your payment..." />}
        {status === 'success' && (
          <p style={{ fontSize: 18, color: '#16a34a' }}>
            ✅ Payment successful! Generating your receipt...
          </p>
        )}
        {status === 'failed' && (
          <div>
            <p style={{ fontSize: 18, color: '#dc2626', marginBottom: 16 }}>❌ {errorMsg}</p>
            <button className="btn btn-primary" onClick={() => navigate(`/donate/${campaignId}`)}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </>
  );
}