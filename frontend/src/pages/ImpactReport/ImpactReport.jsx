import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, Wallet, IndianRupee, Users, BarChart3, School, HeartHandshake,
  Laptop, BookOpen, Cross, Sprout, HandHeart, Briefcase, Search, ChevronDown,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { campaignService } from '../../services/campaignService';
import { useTheme } from '../../context/ThemeContext';

import leavesFrameBg from '../../assets/images/backgrounds/leaves-frame.jpg';
import impactHeroPhoto from '../../assets/images/backgrounds/impact-hero.jpg';

const rowIcons = [School, HeartHandshake, Laptop, BookOpen, Cross, Sprout, HandHeart, Briefcase];

export default function ImpactReport() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

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

  const filteredRows = useMemo(
    () => rows.filter((r) => r.title.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  const c = {
    headingColor: isDark ? '#f1f5f9' : '#111827',
    subColor: isDark ? '#94a3b8' : '#4b5563',
    cardBg: isDark ? '#1e293b' : '#fff',
    cardBorder: isDark ? '#334155' : '#dcfce7',
    statLabel: isDark ? '#94a3b8' : '#374151',
    statSub: isDark ? '#64748b' : '#6b7280',
    tableCardBg: isDark ? '#1e293b' : '#fff',
    rowBorder: isDark ? '#334155' : '#f1f5f9',
    rowText: isDark ? '#e2e8f0' : '#111827',
    inputBg: isDark ? '#0f172a' : '#fff',
    inputBorder: isDark ? '#334155' : '#e5e7eb',
    inputText: isDark ? '#e2e8f0' : '#111827',
    iconChipBg: isDark ? '#166534' : '#dcfce7',
  };

  const iconColor = isDark ? '#4ade80' : '#16a34a';
  const barBg = isDark ? '#334155' : '#e5e7eb';

  return (
    <>
      <style>{`
        .impact-page-bg {
          position: relative;
          background-image: url(${leavesFrameBg});
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        .impact-page-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(240,253,244,0.55);
          pointer-events: none;
        }
        [data-theme="dark"] .impact-page-bg::before {
          background: rgba(15,23,42,0.88);
        }
        .impact-page-bg > * {
          position: relative;
          z-index: 1;
        }
      `}</style>

      <div className="impact-page-bg">
        <Navbar />
        <div className="container" style={{ padding: '40px 0' }}>

          {/* Hero */}
          <div
            style={{
              position: 'relative',
              borderRadius: 20,
              marginBottom: 32,
              overflow: 'hidden',
              minHeight: 280,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              src={impactHeroPhoto}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: isDark
                  ? 'linear-gradient(90deg, rgba(5,46,22,0.88) 0%, rgba(5,46,22,0.55) 45%, rgba(5,46,22,0.15) 75%)'
                  : 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.1) 75%)',
              }}
            />
            <div style={{ position: 'relative', padding: '36px 40px', maxWidth: 520 }}>
              <h1 style={{ margin: 0, marginBottom: 8, color: c.headingColor, fontSize: 32, fontWeight: 800 }}>
                {t('impact.title')}
              </h1>
              <p style={{ margin: 0, color: c.subColor, fontSize: 15 }}>
                {t('impact.subtitle')}
              </p>
            </div>

            <svg
              viewBox="0 0 1440 80"
              preserveAspectRatio="none"
              style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: 60 }}
            >
              <path
                d="M0,40 C240,90 480,0 720,30 C960,60 1200,10 1440,45 L1440,80 L0,80 Z"
                fill={isDark ? '#0f172a' : '#f0fdf4'}
                opacity="0.001"
              />
              <path
                d="M0,50 C240,10 480,80 720,40 C960,0 1200,70 1440,30 L1440,80 L0,80 Z"
                fill={isDark ? '#0f172a' : '#ffffff'}
              />
            </svg>
          </div>

          {loading ? <Loader label={t('impact.loadingImpact')} /> : (
            <>
              <div className="grid grid-4" style={{ marginBottom: 32, gap: 16 }}>
                {[
                  { icon: TrendingUp, label: t('impact.totalCollected'), value: `₹${totals.collected.toLocaleString()}`, sub: t('impact.allTime') },
                  { icon: Wallet, label: t('impact.fundsDisbursed'), value: `₹${totals.used.toLocaleString()}`, sub: t('impact.allTime') },
                  { icon: IndianRupee, label: t('impact.remainingBalance'), value: `₹${totals.remaining.toLocaleString()}`, sub: t('impact.availableToUse') },
                  { icon: Users, label: t('impact.peopleHelped'), value: totals.helped, sub: t('impact.acrossAllCampaigns') },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div
                    key={label}
                    style={{
                      background: c.cardBg, border: `1px solid ${c.cardBorder}`, borderRadius: 16,
                      padding: 20, display: 'flex', gap: 14, alignItems: 'center',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%', background: isDark ? '#166534' : '#16a34a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon color="#fff" size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: c.statLabel }}>{label}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#4ade80' : '#166534' }}>{value}</div>
                      <div style={{ fontSize: 12, color: c.statSub }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: c.tableCardBg, borderRadius: 16, overflow: 'hidden', border: `1px solid ${c.cardBorder}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '18px 24px', flexWrap: 'wrap', gap: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: c.iconChipBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BarChart3 color={iconColor} size={20} />
                    </div>
                    <h3 style={{ margin: 0, color: c.headingColor }}>{t('impact.campaignBreakdown')}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={15} color={isDark ? '#64748b' : '#9ca3af'} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search campaign..."
                        style={{
                          padding: '9px 14px 9px 34px', borderRadius: 10, border: `1px solid ${c.inputBorder}`,
                          background: c.inputBg, color: c.inputText, fontSize: 13.5, width: 200, boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <button
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: isDark ? '#166534' : '#16a34a', color: '#fff', border: 'none',
                        borderRadius: 10, padding: '9px 16px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                      }}
                      onClick={() => {}}
                    >
                      <Search size={14} /> Search
                    </button>
                    <button
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: c.inputBg, color: c.inputText, border: `1px solid ${c.inputBorder}`,
                        borderRadius: 10, padding: '9px 14px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                      }}
                    >
                      All Campaigns <ChevronDown size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: isDark ? 'linear-gradient(90deg, #14532d 0%, #166534 100%)' : 'linear-gradient(90deg, #16a34a 0%, #059669 100%)' }}>
                        <th style={{ color: '#fff', padding: '14px 24px', textAlign: 'left', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3 }}>{t('impact.tableCampaign')}</th>
                        <th style={{ color: '#fff', textAlign: 'left', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3 }}>{t('impact.tableCollected')}</th>
                        <th style={{ color: '#fff', textAlign: 'left', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3 }}>{t('impact.tableUsed')}</th>
                        <th style={{ color: '#fff', textAlign: 'left', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3 }}>{t('impact.tableRemaining')}</th>
                        <th style={{ color: '#fff', textAlign: 'left', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3 }}>{t('impact.tableBeneficiaries')}</th>
                        <th style={{ color: '#fff', paddingRight: 24, textAlign: 'left', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3 }}>{t('impact.tableProgress')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: c.statSub, fontSize: 14 }}>
                            No campaigns match your search.
                          </td>
                        </tr>
                      )}
                      {filteredRows.map((r, i) => {
                        const Icon = rowIcons[i % rowIcons.length];
                        const isNegative = r.remainingBalance < 0;
                        return (
                          <tr key={r.campaignId} style={{ borderBottom: `1px solid ${c.rowBorder}` }}>
                            <td style={{ padding: '14px 24px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                  width: 34, height: 34, borderRadius: 8,
                                  background: c.iconChipBg, display: 'flex',
                                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                  <Icon color={iconColor} size={16} />
                                </div>
                                <Link to={`/campaigns/${r.campaignId}`} style={{ color: c.rowText, fontWeight: 600, textDecoration: 'none' }}>
                                  {r.title}
                                </Link>
                              </div>
                            </td>
                            <td style={{ color: isDark ? '#4ade80' : '#16a34a', fontWeight: 700 }}>₹{r.totalCollected.toLocaleString()}</td>
                            <td style={{ color: isDark ? '#4ade80' : '#16a34a', fontWeight: 700 }}>₹{r.amountUsed.toLocaleString()}</td>
                            <td style={{ color: isNegative ? '#ef4444' : c.rowText, fontWeight: isNegative ? 700 : 400 }}>
                              {isNegative ? '-' : ''}₹{Math.abs(r.remainingBalance).toLocaleString()}
                            </td>
                            <td style={{ color: c.rowText }}>{r.beneficiariesHelped}</td>
                            <td style={{ paddingRight: 24 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ flex: 1, height: 6, background: barBg, borderRadius: 4, overflow: 'hidden', maxWidth: 140 }}>
                                  <div style={{
                                    width: `${Math.min(Math.max(r.progressPercent, 0), 100)}%`,
                                    height: '100%', background: iconColor, borderRadius: 4,
                                  }} />
                                </div>
                                <span style={{ fontSize: 13, color: c.statSub, minWidth: 40 }}>{r.progressPercent}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}