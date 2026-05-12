import React, { useState, useEffect } from 'react';
import { getMyServices, createService, updateService, deleteService, getBookings, updateBookingStatus } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electrician','Plumber','Tutor','Carpenter','Painter','Cleaner',
  'Mechanic','Doctor','Nurse','Cook','Driver','Security','Other'];

const STATUS_CLASS = {
  Pending: 'status-pending', Accepted: 'status-accepted',
  Completed: 'status-completed', Cancelled: 'status-cancelled',
};

const emptyForm = { title: '', category: 'Electrician', price: '', location: '', description: '', isAvailable: true };

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, bRes] = await Promise.all([getMyServices(), getBookings()]);
      setServices(sRes.data);
      setBookings(bRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditingService(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (svc) => {
    setEditingService(svc);
    setForm({
      title: svc.title, category: svc.category, price: svc.price,
      location: svc.location, description: svc.description || '', isAvailable: svc.isAvailable,
    });
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.category || !form.price || !form.location) {
      return setError('Please fill all required fields');
    }
    if (isNaN(form.price) || Number(form.price) < 0) {
      return setError('Price must be a valid positive number');
    }

    try {
      setSubmitting(true);
      if (editingService) {
        await updateService(editingService._id, { ...form, price: Number(form.price) });
        toast.success('Service updated!');
      } else {
        await createService({ ...form, price: Number(form.price) });
        toast.success('Service created!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await deleteService(id);
      toast.success('Service deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      toast.success(`Booking ${status.toLowerCase()}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;

  return (
    <div className="container page">
      <div className="page-header">
        <div className="page-title">Provider Dashboard</div>
        <p className="page-subtitle">Manage your services and bookings, {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{services.length}</div>
          <div className="stat-label">My Services</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#F59E0B' }}>
          <div className="stat-value">{pendingBookings}</div>
          <div className="stat-label">Pending Bookings</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10B981' }}>
          <div className="stat-value">{bookings.filter((b) => b.status === 'Completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#6366F1' }}>
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="tabs">
          <button className={`tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}>My Services</button>
          <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}>
            Bookings {pendingBookings > 0 && `(${pendingBookings} pending)`}
          </button>
        </div>
        {activeTab === 'services' && (
          <button className="btn btn-primary" onClick={openAdd}>+ Add Service</button>
        )}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : activeTab === 'services' ? (
        services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔧</div>
            <p className="empty-state-text">No services yet. Add your first service!</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>
              + Add Service
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th><th>Category</th><th>Price</th>
                  <th>Location</th><th>Status</th><th>Rating</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.title}</td>
                    <td>{s.category}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{s.price.toLocaleString()}</td>
                    <td>{s.location}</td>
                    <td>
                      <span className={`status-badge ${s.isAvailable ? 'status-accepted' : 'status-cancelled'}`}>
                        {s.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>⭐ {s.averageRating > 0 ? s.averageRating.toFixed(1) : 'N/A'} ({s.totalReviews})</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-text">No bookings yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th><th>Service</th><th>Date & Time</th>
                  <th>Amount</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.customer?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.customer?.phone}</div>
                    </td>
                    <td>{b.service?.title}</td>
                    <td>
                      <div>{new Date(b.bookingDate).toLocaleDateString('en-IN')}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.bookingTime}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{b.totalAmount?.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${STATUS_CLASS[b.status]}`}>{b.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {b.status === 'Pending' && (
                          <>
                            <button className="btn btn-success btn-sm"
                              onClick={() => handleBookingStatus(b._id, 'Accepted')}>Accept</button>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => handleBookingStatus(b._id, 'Cancelled')}>Reject</button>
                          </>
                        )}
                        {b.status === 'Accepted' && (
                          <button className="btn btn-secondary btn-sm"
                            onClick={() => handleBookingStatus(b._id, 'Completed')}>Mark Done</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Add/Edit Service Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Service Title *</label>
                <input name="title" value={form.title} onChange={handleChange}
                  className="form-input" placeholder="e.g., Home Electrician" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} className="form-select">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange}
                    className="form-input" placeholder="500" min="0" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location *</label>
                <input name="location" value={form.location} onChange={handleChange}
                  className="form-input" placeholder="e.g., Chennai" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  className="form-textarea" placeholder="Describe your service..." />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" name="isAvailable" checked={form.isAvailable}
                    onChange={handleChange} />
                  <span className="form-label" style={{ margin: 0 }}>Service Available</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                  {submitting ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
