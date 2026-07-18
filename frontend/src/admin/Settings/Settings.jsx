import { useState } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Wire this to a real PUT /api/user/{id} endpoint when ready.
    toast.success('Settings saved');
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 30 }}>
        <h1 style={{ marginBottom: 20 }}>Settings</h1>
        <div className="card" style={{ maxWidth: 480 }}>
          <h3 style={{ marginBottom: 16 }}>Admin Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <button className="btn btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}
