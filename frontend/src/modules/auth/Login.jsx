import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}
    >
      <div className="card border-0 shadow-lg p-4 p-md-5" style={{ width: '100%', maxWidth: '440px', borderRadius: '24px' }}>
        <div className="text-center mb-4">
          <div className="fs-1 mb-2">💰</div>
          <h3 className="fw-bold text-dark">Welcome to FinApp</h3>
          <p className="text-muted small">Sign in to manage your finances & budgets</p>
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
            className="btn btn-primary w-100 py-2 fw-semibold rounded-pill mb-4"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

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
