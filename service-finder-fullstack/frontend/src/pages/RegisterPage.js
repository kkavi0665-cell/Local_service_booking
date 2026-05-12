import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../utils/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'customer', phone: '', location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.role) {
      return setError('Please fill all required fields');
    }

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      const { data } = await registerApi({
        name: form.name, email: form.email, password: form.password,
        role: form.role, phone: form.phone, location: form.location,
      });
      login(data);
      toast.success('Account created successfully!');

      if (data.role === 'provider') navigate('/provider-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '2.5rem' }}>✨</span>
        </div>
        <h1 className="auth-title" style={{ textAlign: 'center' }}>Create Account</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>
          Join ServiceFinder today
        </p>

        {/* Role Selection */}
        <div className="role-toggle">
          <div
            className={`role-option ${form.role === 'customer' ? 'selected' : ''}`}
            onClick={() => setForm((f) => ({ ...f, role: 'customer' }))}
          >
            <div className="role-option-icon">👤</div>
            <div className="role-option-label">Customer</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Book services
            </div>
          </div>
          <div
            className={`role-option ${form.role === 'provider' ? 'selected' : ''}`}
            onClick={() => setForm((f) => ({ ...f, role: 'provider' }))}
          >
            <div className="role-option-icon">🔧</div>
            <div className="role-option-label">Provider</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Offer services
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange}
              className="form-input" placeholder="Your full name" />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className="form-input" placeholder="you@example.com" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="form-input" placeholder="+91 98765..." />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input name="location" value={form.location} onChange={handleChange}
                className="form-input" placeholder="Your city" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input name="password" type="password" value={form.password} onChange={handleChange}
              className="form-input" placeholder="Min 6 characters" />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword}
              onChange={handleChange} className="form-input" placeholder="Repeat password" />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
