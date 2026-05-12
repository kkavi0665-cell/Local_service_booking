import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  Electrician: '⚡',
  Plumber: '🔧',
  Tutor: '📚',
  Carpenter: '🪚',
  Painter: '🎨',
  Cleaner: '🧹',
  Mechanic: '🔩',
  Doctor: '🩺',
  Nurse: '💊',
  Cook: '👨‍🍳',
  Driver: '🚗',
  Security: '🛡️',
  Other: '⭐',
};

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? '#F59E0B' : '#D1D5DB' }}>
          ★
        </span>
      ))}
      <span>({rating > 0 ? rating.toFixed(1) : 'New'})</span>
    </div>
  );
}

export default function ServiceCard({ service }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const icon = CATEGORY_ICONS[service.category] || '⭐';

  const handleBook = () => {
    if (!user) {
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }
    if (user.role !== 'customer') {
      toast.error('Only customers can book services');
      return;
    }
    navigate(`/book/${service._id}`);
  };

  return (
    <div className="card service-card">
      <div className="service-card-header">
        <div className="service-badge">
          {icon} {service.category}
        </div>
        <div className="service-title">{service.title}</div>
        {!service.isAvailable && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: '#EF4444',
              color: 'white',
              padding: '2px 10px',
              borderRadius: '50px',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            UNAVAILABLE
          </div>
        )}
      </div>

      <div className="service-card-body">
        <div className="service-price">₹{service.price.toLocaleString()}</div>

        <div className="service-info-row">
          👤 <span>By <strong>{service.provider?.name || 'Unknown'}</strong></span>
        </div>

        <div className="service-info-row">
          📍 <span>{service.location}</span>
        </div>

        <StarRating rating={service.averageRating} />

        {service.description && (
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {service.description}
          </p>
        )}
      </div>

      <div className="service-card-footer">
        <Link to={`/services/${service._id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
          View Details
        </Link>
        {service.isAvailable && (
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleBook}>
            Book Now
          </button>
        )}
      </div>
    </div>
  );
}
