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
      <style>{`
        .campaign-details-transparency {
          background: #f0fdf4;
        }
        [data-theme="dark"] .campaign-details-transparency {
          background: rgba(16,163,74,0.08);
        }
      `}</style>

      <Navbar />
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="grid grid-2">
          <img src={campaign.imageUrl || 'https://placehold.co/600x400?text=Campaign'} alt={campaign.title}
            style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 380 }} />
          <div>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 600,
                padding: '5px 12px', borderRadius: 999,
              }}
            >
              {campaign.category || 'General'}
            </span>
            <h1 style={{ margin: '10px 0', color: 'var(--dark)' }}>{campaign.title}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{campaign.description}</p>

            <p style={{ marginBottom: 6, color: 'var(--dark)' }}>
              ₹{campaign.collectedAmount.toLocaleString()} raised of ₹{campaign.targetAmount.toLocaleString()}
            </p>
            <div className="progress-bar" style={{ background: 'var(--border)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div
                className="progress-fill"
                style={{ width: `${Math.min(campaign.percentageCompleted, 100)}%`, background: '#16a34a', height: '100%' }}
              />
            </div>
            <p style={{ margin: '8px 0 20px', fontSize: 13, color: 'var(--text-muted)' }}>{campaign.percentageCompleted}% Completed</p>

            <Link
              to={`/donate/${campaign.campaignId}`}
              className="btn btn-primary"
              style={{ background: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              ♡ Donate Now
            </Link>
          </div>
        </div>

        {transparency && (
          <div className="campaign-details-transparency" style={{
            marginTop: 40,
            borderRadius: 12,
            padding: 28,
          }}>
            <h3 style={{ marginBottom: 20, fontSize: 20, color: 'var(--dark)' }}>Fund Transparency</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 20,
            }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Total Collected</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
                  ₹{transparency.totalCollected.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Amount Used</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--dark)' }}>
                  ₹{transparency.amountUsed.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Remaining Balance</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--dark)' }}>
                  ₹{transparency.remainingBalance.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Beneficiaries Helped</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--dark)' }}>
                  {transparency.beneficiariesHelped}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Progress</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--dark)' }}>
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