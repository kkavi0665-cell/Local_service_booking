import React, { useState, useEffect } from 'react';
import { getAdminStats, getAdminUsers, toggleUserStatus, getServices, adminDeleteService } from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, servicesRes] = await Promise.all([
        getAdminStats(), getAdminUsers(), getServices(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setServices(servicesRes.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleUser = async (userId, name) => {
    try {
      const { data } = await toggleUserStatus(userId);
      toast.success(data.message);
      fetchData();
    } catch {
      toast.error('Failed to toggle user status');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Permanently delete this service?')) return;
    try {
      await adminDeleteService(serviceId);
      toast.success('Service deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete service');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="container page">
      <div className="page-header">
        <div className="page-title">⚙️ Admin Panel</div>
        <p className="page-subtitle">Manage users, services, and platform activity</p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 28 }}>
        {['overview', 'users', 'services'].map((t) => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
            style={{ textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#10B981' }}>
              <div className="stat-value">{stats.totalCustomers}</div>
              <div className="stat-label">Customers</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#6366F1' }}>
              <div className="stat-value">{stats.totalProviders}</div>
              <div className="stat-label">Providers</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#F59E0B' }}>
              <div className="stat-value">{stats.totalServices}</div>
              <div className="stat-label">Services</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#EF4444' }}>
              <div className="stat-value">{stats.totalBookings}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#EC4899' }}>
              <div className="stat-value">{stats.pendingBookings}</div>
              <div className="stat-label">Pending Bookings</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#3B82F6' }}>
              <div className="stat-value">{stats.completedBookings}</div>
              <div className="stat-label">Completed Bookings</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16 }}>Recent Users</h3>
              {users.slice(0, 5).map((u) => (
                <div key={u._id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: '1px solid var(--border)'
                }}>
                  <div style={{
                    width: 36, height: 36, background: u.role === 'provider' ? 'var(--primary)' : 'var(--secondary)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.85rem', fontWeight: 700
                  }}>
                    {u.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.role} • {u.email}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16 }}>Top Services</h3>
              {services.slice(0, 5).map((s) => (
                <div key={s._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {s.category} • {s.location}
                    </div>
                  </div>
                  <div style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{s.price}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Location</th>
                <th>Joined</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span style={{
                      background: u.role === 'provider' ? '#EDE9FE' : '#DBEAFE',
                      color: u.role === 'provider' ? '#5B21B6' : '#1E40AF',
                      padding: '2px 10px', borderRadius: '50px',
                      fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.location || '—'}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <span className={`status-badge ${u.isActive ? 'status-accepted' : 'status-cancelled'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.isActive ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleUser(u._id, u.name)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Service</th><th>Provider</th><th>Category</th>
                <th>Price</th><th>Location</th><th>Rating</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 600 }}>{s.title}</td>
                  <td>{s.provider?.name}</td>
                  <td>{s.category}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{s.price.toLocaleString()}</td>
                  <td>{s.location}</td>
                  <td>⭐ {s.averageRating > 0 ? s.averageRating.toFixed(1) : 'N/A'} ({s.totalReviews})</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteService(s._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
