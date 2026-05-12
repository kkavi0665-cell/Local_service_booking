import React, { useState, useEffect } from 'react';
import ServiceCard from '../components/ServiceCard';
import { getServices } from '../utils/api';

const CATEGORIES = [
  'All', 'Electrician', 'Plumber', 'Tutor', 'Carpenter',
  'Painter', 'Cleaner', 'Mechanic', 'Doctor', 'Cook', 'Driver', 'Other',
];

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    available: false,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.available) params.available = 'true';

      const { data } = await getServices(params);
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => fetchServices(), 400);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line
  }, [filters]);

  const handleFilter = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <h1 className="hero-title">
            Find <span>Local Services</span><br />at Nearby Place 
          </h1>
          <p className="hero-subtitle">
            Connect with skilled professionals near you. Book instantly, review honestly.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['⚡ Electrician', '🔧 Plumber', '📚 Tutor', '🎨 Painter', '🧹 Cleaner'].map((tag) => (
              <span
                key={tag}
                onClick={() => {
                  const cat = tag.split(' ')[1];
                  setFilters((f) => ({ ...f, category: cat }));
                }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '50px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container page">
        {/* Filter bar */}
        <div className="filter-bar">
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              name="search"
              value={filters.search}
              onChange={handleFilter}
              className="form-input"
              placeholder="Search services..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category" value={filters.category} onChange={handleFilter} className="form-select">
              {CATEGORIES.map((c) => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              name="location"
              value={filters.location}
              onChange={handleFilter}
              className="form-input"
              placeholder="Enter city..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Min Price (₹)</label>
            <input
              name="minPrice"
              type="number"
              value={filters.minPrice}
              onChange={handleFilter}
              className="form-input"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Max Price (₹)</label>
            <input
              name="maxPrice"
              type="number"
              value={filters.maxPrice}
              onChange={handleFilter}
              className="form-input"
              placeholder="Any"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Min Rating</label>
            <select name="minRating" value={filters.minRating} onChange={handleFilter} className="form-select">
              <option value="">Any</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>

          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="available"
                checked={filters.available}
                onChange={handleFilter}
              />
              <span className="form-label" style={{ margin: 0 }}>Available Only</span>
            </label>
          </div>

          <button
            className="btn btn-outline btn-sm"
            onClick={() =>
              setFilters({ search: '', category: '', location: '', minPrice: '', maxPrice: '', minRating: '', available: false })
            }
          >
            Reset
          </button>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {!loading && `${services.length} service${services.length !== 1 ? 's' : ''} found`}
        </div>

        {/* Services grid */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p className="empty-state-text">No services found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
