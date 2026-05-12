import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getService, createBooking } from '../utils/api';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    bookingDate: '',
    bookingTime: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await getService(serviceId);
        setService(data.service);
      } catch {
        toast.error('Service not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
    // eslint-disable-next-line
  }, [serviceId]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.bookingDate || !form.bookingTime) {
      return setError('Please select date and time');
    }

    const selectedDate = new Date(form.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return setError('Booking date cannot be in the past');
    }

    try {
      setSubmitting(true);
      await createBooking({ serviceId, ...form });
      toast.success('Booking confirmed! 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="container page" style={{ maxWidth: 700 }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}
        style={{ marginBottom: 24 }}>
        ← Back
      </button>

      <div className="page-header">
        <div className="page-title">Confirm Booking</div>
        <p className="page-subtitle">Fill in the details below to book this service</p>
      </div>

      {/* Service summary */}
      {service && (
        <div className="card" style={{ padding: 24, marginBottom: 24, background: 'var(--secondary)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                {service.category}
              </div>
              <div style={{ fontFamily: 'Syne', fontSize: '1.3rem', fontWeight: 700 }}>
                {service.title}
              </div>
              <div style={{ opacity: 0.8, marginTop: 4, fontSize: '0.9rem' }}>
                by {service.provider?.name} • {service.location}
              </div>
            </div>
            <div style={{ fontFamily: 'Syne', fontSize: '1.8rem', fontWeight: 800, color: '#FF5A1F' }}>
              ₹{service.price.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 32 }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Booking Date *</label>
              <input
                name="bookingDate"
                type="date"
                value={form.bookingDate}
                onChange={handleChange}
                className="form-input"
                min={today}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Time *</label>
              <input
                name="bookingTime"
                type="time"
                value={form.bookingTime}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Describe your problem or any special instructions..."
            />
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Booking Summary</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Service</span>
              <span style={{ fontWeight: 600 }}>{service?.title}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Date</span>
              <span>{form.bookingDate || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Time</span>
              <span>{form.bookingTime || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 700 }}>Total Amount</span>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>
                ₹{service?.price?.toLocaleString()}
              </span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting}>
            {submitting ? 'Confirming...' : '✓ Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
