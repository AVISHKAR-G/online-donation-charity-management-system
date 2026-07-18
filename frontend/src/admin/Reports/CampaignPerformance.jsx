import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { campaignService } from '../../services/campaignService';

export default function CampaignPerformance() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('percentageCompleted');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    campaignService.getAll().then(setCampaigns).finally(() => setLoading(false));
  }, []);

  const sorted = [...campaigns].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    return a[sortKey] > b[sortKey] ? dir : -dir;
  });

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 30 }}>
        <h1 style={{ marginBottom: 20 }}>Campaign Performance</h1>
        <div className="card">
          {loading ? <Loader /> : (
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>Campaign</th>
                  <th onClick={() => handleSort('targetAmount')} style={{ cursor: 'pointer' }}>Goal</th>
                  <th onClick={() => handleSort('collectedAmount')} style={{ cursor: 'pointer' }}>Raised</th>
                  <th onClick={() => handleSort('percentageCompleted')} style={{ cursor: 'pointer' }}>Progress %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <tr key={c.campaignId}>
                    <td>{c.title}</td>
                    <td>₹{c.targetAmount.toLocaleString()}</td>
                    <td>₹{c.collectedAmount.toLocaleString()}</td>
                    <td>
                      <div className="progress-bar" style={{ width: 100, display: 'inline-block', marginRight: 8 }}>
                        <div className="progress-fill" style={{ width: `${Math.min(c.percentageCompleted, 100)}%` }} />
                      </div>
                      {c.percentageCompleted}%
                    </td>
                    <td><span className="badge badge-info">{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}