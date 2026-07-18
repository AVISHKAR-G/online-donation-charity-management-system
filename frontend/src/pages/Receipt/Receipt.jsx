import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import ReceiptCard from '../../components/ReceiptCard';
import { donationService } from '../../services/donationService';

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
      <div className="container" style={{ padding: '40px 20px' }}>
        {loading ? (
          <Loader label="Loading receipt..." />
        ) : donation ? (
          <>
            <ReceiptCard donation={donation} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => window.print()}>Download / Print Receipt</button>
              <Link to="/" className="btn btn-outline">Back to Home</Link>
            </div>
          </>
        ) : (
          <p>Receipt not found.</p>
        )}
      </div>
      <Footer />
    </>
  );
}