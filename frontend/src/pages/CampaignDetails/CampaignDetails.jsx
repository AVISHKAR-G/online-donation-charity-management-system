import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { campaignService } from '../../services/campaignService';

export default function CampaignDetails() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [transparency, setTransparency] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignService.getById(id).then(setCampaign).finally(() => setLoading(false));
    campaignService.getTransparency(id).then(setTransparency).catch(() => {});
  }, [id]);

  if (loading) return (<><Navbar /><Loader label="Loading campaign details..." /><Footer /></>);
  if (!campaign) return (<><Navbar /><p className="container">Campaign not found.</p><Footer /></>);

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="grid grid-2">
          <img src={campaign.imageUrl || 'https://placehold.co/600x400?text=Campaign'} alt={campaign.title}
            style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 380 }} />
          <div>
            <span className="badge badge-info">{campaign.category || 'General'}</span>
            <h1 style={{ margin: '10px 0' }}>{campaign.title}</h1>
            <p style={{ color: '#6b7280', marginBottom: 20 }}>{campaign.description}</p>

            <p style={{ marginBottom: 6 }}>
              ₹{campaign.collectedAmount.toLocaleString()} raised of ₹{campaign.targetAmount.toLocaleString()}
            </p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(campaign.percentageCompleted, 100)}%` }} />
            </div>
            <p style={{ margin: '8px 0 20px', fontSize: 13, color: '#6b7280' }}>{campaign.percentageCompleted}% Completed</p>

            <Link to={`/donate/${campaign.campaignId}`} className="btn btn-primary">♡ Donate Now</Link>
          </div>
        </div>

        {transparency && (
          <div style={{
            marginTop: 40,
            background: '#f9fafb',
            borderRadius: 12,
            padding: 28,
          }}>
            <h3 style={{ marginBottom: 20, fontSize: 20 }}>Fund Transparency</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 20,
            }}>
              <div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Total Collected</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
                  ₹{transparency.totalCollected.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Amount Used</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  ₹{transparency.amountUsed.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Remaining Balance</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  ₹{transparency.remainingBalance.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Beneficiaries Helped</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {transparency.beneficiariesHelped}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Progress</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {transparency.progressPercent}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}