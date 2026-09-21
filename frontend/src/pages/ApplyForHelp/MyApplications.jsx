import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { assistanceApplicationService } from '../../services/assistanceApplicationService';

const STATUS_COLORS = {
  Pending: 'badge-info',
  UnderVerification: 'badge-warning',
  Approved: 'badge-success',
  Rejected: 'badge-danger',
  FundAllocated: 'badge-success',
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assistanceApplicationService.myApplications()
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '40px 20px', maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1>My Applications</h1>
          <Link to="/apply-for-help" className="btn btn-primary">+ New Application</Link>
        </div>

        {loading ? (
          <Loader label="Loading your applications..." />
        ) : applications.length === 0 ? (
          <p>You haven't submitted any assistance applications yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {applications.map((a) => (
              <div key={a.applicationId} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{a.type} Assistance</strong>
                  <span className={`badge ${STATUS_COLORS[a.status] || 'badge-info'}`}>
                    {a.status}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>{a.reason}</p>
                <p style={{ marginTop: 6 }}>
                  <strong>Amount Requested:</strong> ₹{a.amountRequired.toLocaleString()}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                  Submitted {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}