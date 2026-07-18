import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Wallet, IndianRupee, Users, BarChart3, School, HeartHandshake, Laptop, BookOpen, Cross, Sprout, HandHeart, Briefcase } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { campaignService } from '../../services/campaignService';

const rowIcons = [School, HeartHandshake, Laptop, BookOpen, Cross, Sprout, HandHeart, Briefcase];
const rowColors = ['#2563eb', '#16a34a', '#7c3aed', '#d97706', '#dc2626', '#059669', '#9333ea', '#0891b2'];
const barColors = ['#2563eb', '#16a34a', '#7c3aed', '#d97706', '#dc2626', '#059669', '#9333ea', '#0891b2'];

export default function ImpactReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignService.getAll()
      .then(async (campaigns) => {
        const results = await Promise.all(
          campaigns.map((c) =>
            campaignService.getTransparency(c.campaignId).catch(() => null)
          )
        );
        setRows(results.filter(Boolean));
      })
      .finally(() => setLoading(false));
  }, []);

  const totals = rows.reduce(
    (acc, r) => ({
      collected: acc.collected + r.totalCollected,
      used: acc.used + r.amountUsed,
      remaining: acc.remaining + r.remainingBalance,
      helped: acc.helped + r.beneficiariesHelped,
    }),
    { collected: 0, used: 0, remaining: 0, helped: 0 }
  );

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '40px 0' }}>
        <h1 style={{ marginBottom: 8 }}>Our Impact</h1>
        <p style={{ color: '#6b7280', marginBottom: 32 }}>
          Complete transparency on how every rupee donated is used across our campaigns.
        </p>

        {loading ? <Loader label="Loading impact data..." /> : (
          <>
            <div className="grid grid-4" style={{ marginBottom: 32, gap: 16 }}>
              <div className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center', background: '#f0fdf4' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrendingUp color="#fff" size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Total Collected</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1d4ed8' }}>
                    ₹{totals.collected.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>All time</div>
                </div>
              </div>

              <div className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center', background: '#eff6ff' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Wallet color="#fff" size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Funds Disbursed</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>
                    ₹{totals.used.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>All time</div>
                </div>
              </div>

              <div className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center', background: '#fff7ed' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IndianRupee color="#fff" size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Remaining Balance</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>
                    ₹{totals.remaining.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Available to use</div>
                </div>
              </div>

              <div className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center', background: '#f5f3ff' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users color="#fff" size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>People Helped</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#7c3aed' }}>
                    {totals.helped}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Across all campaigns</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 24px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart3 color="#2563eb" size={20} />
                </div>
                <h3>Campaign Breakdown</h3>
              </div>
              <table>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)' }}>
                    <th style={{ color: '#fff', padding: '14px 24px' }}>Campaign</th>
                    <th style={{ color: '#fff' }}>Collected</th>
                    <th style={{ color: '#fff' }}>Used</th>
                    <th style={{ color: '#fff' }}>Remaining</th>
                    <th style={{ color: '#fff' }}>Beneficiaries Helped</th>
                    <th style={{ color: '#fff', paddingRight: 24 }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const Icon = rowIcons[i % rowIcons.length];
                    const iconColor = rowColors[i % rowColors.length];
                    const barColor = barColors[i % barColors.length];
                    return (
                      <tr key={r.campaignId}>
                        <td style={{ paddingLeft: 24 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: `${iconColor}1a`, display: 'flex',
                              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <Icon color={iconColor} size={16} />
                            </div>
                            <Link to={`/campaigns/${r.campaignId}`} style={{ color: '#111827', fontWeight: 500 }}>{r.title}</Link>
                          </div>
                        </td>
                        <td style={{ color: '#2563eb', fontWeight: 600 }}>₹{r.totalCollected.toLocaleString()}</td>
                        <td style={{ color: '#16a34a', fontWeight: 600 }}>₹{r.amountUsed.toLocaleString()}</td>
                        <td>₹{r.remainingBalance.toLocaleString()}</td>
                        <td>{r.beneficiariesHelped}</td>
                        <td style={{ paddingRight: 24 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden', maxWidth: 140 }}>
                              <div style={{
                                width: `${Math.min(r.progressPercent, 100)}%`,
                                height: '100%', background: barColor, borderRadius: 4,
                              }} />
                            </div>
                            <span style={{ fontSize: 13, color: '#6b7280', minWidth: 40 }}>{r.progressPercent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}