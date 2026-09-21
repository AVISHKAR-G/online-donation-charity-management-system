import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import ReceiptCard from '../../components/ReceiptCard';
import { donationService } from '../../services/donationService';

// Same decorative background used on the Donate page, for a consistent look
import donationBg from '../../assets/images/donate/donation-bg.png';

export default function Receipt() {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donationService.getById(id).then(setDonation).finally(() => setLoading(false));
  }, [id]);

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
          padding: '32px 20px 48px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 520 }}>
          {loading ? (
            <div
              style={{
                background: 'var(--card-bg)',
                borderRadius: 16,
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                padding: 40,
              }}
            >
              <Loader label="Loading receipt..." />
            </div>
          ) : donation ? (
            <ReceiptCard donation={donation} />
          ) : (
            <div
              style={{
                background: 'var(--card-bg)',
                borderRadius: 16,
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                padding: 40,
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, color: 'var(--dark)' }}>Receipt not found.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}