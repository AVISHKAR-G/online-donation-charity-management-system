import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, HandHeart, Users } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CampaignCard from '../../components/CampaignCard';
import Loader from '../../components/Loader';
import DonationTicker from '../../components/DonationTicker';
import { campaignService } from '../../services/campaignService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import heroVideo from '../../assets/videos/hero.mp4';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    campaignService.getAll({ status: 'Active' })
      .then((data) => setCampaigns(data.slice(0, 3)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      userService.getMyHistory()
        .then(setHistory)
        .finally(() => setHistoryLoading(false));
    } else {
      setHistoryLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <>
      <Navbar />

      <section style={{ position: 'relative', color: '#fff', padding: '100px 0', overflow: 'hidden' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(17,24,39,0.6)',
            zIndex: 1,
          }}
        />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: 38, maxWidth: 500 }}>
            Together We Can Make A <span style={{ color: '#3b82f6' }}>Difference</span>
          </h1>
          <p style={{ color: '#d1d5db', maxWidth: 480, margin: '16px 0 24px' }}>
            Your small contribution can bring hope and change lives of many people.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/campaigns" className="btn btn-primary">♡ Donate Now</Link>
            <Link to="/campaigns" className="btn btn-outline">Explore Campaigns</Link>
          </div>
        </div>
      </section>

      <DonationTicker />

      {isAuthenticated && !historyLoading && history && (
        <section className="container" style={{ padding: '32px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>My Activity</h2>
            <Link to="/my-activity" style={{ color: '#2563eb', fontWeight: 600 }}>View Full History →</Link>
          </div>
          <div className="grid grid-3" style={{ gap: 16 }}>
            <div className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: '#dbeafe',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Wallet color="#2563eb" size={22} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Donations Made</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{history.donations.length}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  {history.donations.filter(d => d.status === 'Approved').length} approved
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: '#dbeafe',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <HandHeart color="#2563eb" size={22} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Help Applications</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{history.applications.length}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  {history.applications.filter(a => a.status === 'Pending' || a.status === 'UnderVerification').length} pending review
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: '#ede9fe',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Users color="#7c3aed" size={22} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Aid Received</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{history.aidReceived.length}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  {history.aidReceived.filter(a => a.status === 'Delivered').length} delivered
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="container" style={{ padding: '40px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2>Popular Campaigns</h2>
          <Link to="/campaigns" style={{ color: '#2563eb', fontWeight: 600 }}>View All Campaigns →</Link>
        </div>

        {loading ? (
          <Loader label="Loading campaigns..." />
        ) : (
          <div className="grid grid-3">
            {campaigns.map((c) => <CampaignCard key={c.campaignId} campaign={c} />)}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}