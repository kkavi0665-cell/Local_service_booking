import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookings, updateBookingStatus } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_CLASS = {
  Pending: 'status-pending',
  Accepted: 'status-accepted',
  Completed: 'status-completed',
  Cancelled: 'status-cancelled',
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const fetchBookings = async () => {
    try {
      const { data } = await getBookings();
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await updateBookingStatus(bookingId, 'Cancelled');
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const tabs = ['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'];
  const filtered = activeTab === 'All' ? bookings : bookings.filter((b) => b.status === activeTab);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'Pending').length,
    accepted: bookings.filter((b) => b.status === 'Accepted').length,
    completed: bookings.filter((b) => b.status === 'Completed').length,
  };

  return (
    <div className="container page">
      <div className="page-header">
        <div className="page-title">My Bookings</div>
        <p className="page-subtitle">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#F59E0B' }}>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10B981' }}>
          <div className="stat-value">{stats.accepted}</div>
          <div className="stat-label">Accepted</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#3B82F6' }}>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-text">No bookings yet.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            Browse Services
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Provider</th>
                <th>Date & Time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.service?.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {b.service?.category} • {b.service?.location}
                    </div>
                  </td>
                  <td>{b.service?.provider?.name || '—'}</td>
                  <td>
                    <div>{new Date(b.bookingDate).toLocaleDateString('en-IN')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.bookingTime}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    ₹{b.totalAmount?.toLocaleString()}
                  </td>
                  <td>
                    <span className={`status-badge ${STATUS_CLASS[b.status]}`}>{b.status}</span>
                  </td>
                  <td>
                    {b.status === 'Pending' && (
                      <button className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(b._id)}>
                        Cancel
                      </button>
                    )}
                    {b.status === 'Accepted' && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                        ✓ Confirmed
                      </span>
                    )}
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
