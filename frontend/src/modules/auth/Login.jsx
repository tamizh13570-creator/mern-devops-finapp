import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      // If unverified, guide them to OTP
      if (err.response?.status === 403) {
        navigate('/verify-otp', { state: { email } });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await demoLogin();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed. Please ensure the backend is running.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 p-3"
      style={{ background: 'transparent' }}
    >
      <div
        className="card border-0 shadow-lg p-4 p-md-5"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '28px',
          background: 'rgba(16, 23, 42, 0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link
            to="/"
            className="text-muted small text-decoration-none d-inline-flex align-items-center gap-1"
            style={{ transition: 'color 0.2s ease' }}
          >
            <i className="bi bi-arrow-left"></i>
            <span>Back to Overview</span>
          </Link>
          <span className="badge rounded-pill bg-primary bg-opacity-25 text-primary-emphasis px-2 py-1" style={{ fontSize: '0.7rem' }}>
            Secure Login
          </span>
        </div>

        <div className="text-center mb-4">
          <div className="fs-1 mb-2 sidebar-brand-icon">💰</div>
          <h3 className="fw-bold text-light">Sign In to FinApp</h3>
          <p className="text-muted small">Enter your credentials to access your dashboard</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-envelope text-muted"></i>
              </span>
              <input
                type="email"
                className="form-control bg-light border-start-0"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <label className="form-label small fw-semibold">Password</label>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type="password"
                className="form-control bg-light border-start-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold rounded-pill mb-3"
            disabled={loading || demoLoading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo User Access Card with Limited Source of Use Cases */}
        <div className="position-relative my-4 text-center">
          <hr style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
          <span
            className="position-absolute top-50 start-50 translate-middle px-3 small fw-semibold text-muted"
            style={{ background: 'rgba(17, 24, 43, 0.95)', borderRadius: '8px' }}
          >
            OR EXPLORE AS GUEST
          </span>
        </div>

        <div
          className="p-3 rounded-4 mb-4 text-center shadow-sm"
          style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
            <span className="badge bg-warning text-dark fw-bold px-2 py-1" style={{ fontSize: '0.65rem' }}>
              LIMITED ACCESS
            </span>
            <span className="small fw-bold text-light">Try FinApp in Demo Mode</span>
          </div>
          <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>
            Instant access with preloaded sample expenses, budgets, charts & monthly reports. No password needed!
          </p>
          <button
            type="button"
            className="btn btn-outline-primary w-100 py-2 fw-semibold rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-sm"
            style={{
              borderColor: 'rgba(99, 102, 241, 0.5)',
              background: 'rgba(99, 102, 241, 0.12)',
              color: '#a5b4fc'
            }}
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
          >
            {demoLoading ? (
              <>
                <span className="spinner-border spinner-border-sm"></span>
                <span>Entering Demo Mode...</span>
              </>
            ) : (
              <>
                <i className="bi bi-person-badge-fill text-primary"></i>
                <span>Continue as Demo User</span>
              </>
            )}
          </button>
        </div>

        <div className="text-center small text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="fw-semibold text-primary text-decoration-none">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
