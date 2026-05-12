import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getService, addReview } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: '1.8rem', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} onClick={() => onChange(s)}
          style={{ color: s <= value ? '#F59E0B' : '#D1D5DB', transition: 'color 0.1s' }}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchService = async () => {
    try {
      const { data } = await getService(id);
      setService(data.service);
      setReviews(data.reviews);
    } catch {
      toast.error('Service not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
    // eslint-disable-next-line
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return toast.error('Please select a rating');

    try {
      setSubmitting(true);
      await addReview(id, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ rating: 0, comment: '' });
      fetchService();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!service) return null;

  return (
    <div className="container page">
      <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}
        style={{ marginBottom: 24 }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
        {/* Main content */}
        <div>
          <div className="card" style={{ padding: 32, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span className="service-badge" style={{ marginBottom: 12, display: 'inline-flex' }}>
                  {service.category}
                </span>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{service.title}</h1>
              </div>
              {!service.isAvailable && (
                <span className="status-badge status-cancelled">Unavailable</span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Price
                </div>
                <div className="service-price">₹{service.price.toLocaleString()}</div>
              </div>
              <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Location
                </div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>📍 {service.location}</div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12 }}>About this Service</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                {service.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <h3 style={{ marginBottom: 12 }}>Service Provider</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 50, height: 50, background: 'var(--secondary)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '1.2rem'
                }}>
                  {service.provider?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{service.provider?.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {service.provider?.email}
                  </div>
                  {service.provider?.phone && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      📞 {service.provider?.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2>Reviews ({service.totalReviews})</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.5rem', color: '#F59E0B' }}>★</span>
                <span style={{ fontFamily: 'Syne', fontSize: '1.3rem', fontWeight: 800 }}>
                  {service.averageRating > 0 ? service.averageRating.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Add review form */}
            {user?.role === 'customer' && (
              <form onSubmit={handleReviewSubmit} style={{
                background: 'var(--bg)', padding: 20, borderRadius: 12, marginBottom: 24
              }}>
                <h4 style={{ marginBottom: 12 }}>Write a Review</h4>
                <StarPicker value={reviewForm.rating}
                  onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))} />
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  className="form-textarea"
                  placeholder="Share your experience..."
                  style={{ marginTop: 12 }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}
                  disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <p className="empty-state-text">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map((r) => (
                  <div key={r._id} style={{
                    borderBottom: '1px solid var(--border)', paddingBottom: 16
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600 }}>{r.customer?.name}</span>
                      <div style={{ color: '#F59E0B' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                    </div>
                    {r.comment && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{r.comment}</p>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="card" style={{ padding: 28, position: 'sticky', top: 90 }}>
          <div className="service-price" style={{ marginBottom: 8 }}>₹{service.price.toLocaleString()}</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>per service</p>

          {service.isAvailable ? (
            user?.role === 'customer' ? (
              <button className="btn btn-primary btn-full btn-lg"
                onClick={() => navigate(`/book/${service._id}`)}>
                Book This Service
              </button>
            ) : !user ? (
              <button className="btn btn-primary btn-full btn-lg"
                onClick={() => navigate('/login')}>
                Login to Book
              </button>
            ) : (
              <div className="alert alert-error">Providers cannot book services.</div>
            )
          ) : (
            <div className="alert alert-error">This service is currently unavailable.</div>
          )}

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="service-info-row">
              📍 <span>{service.location}</span>
            </div>
            <div className="service-info-row">
              🏷️ <span>{service.category}</span>
            </div>
            <div className="service-info-row">
              ⭐ <span>{service.totalReviews} reviews</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
