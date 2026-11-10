import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      // Navigate to OTP verification page with generated OTP
      const generatedOtp = response.otp || response.data?.otp;
      navigate('/verify-otp', { state: { email: formData.email, otp: generatedOtp } });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 py-5"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}
    >
      <div className="card border-0 shadow-lg p-4 p-md-5" style={{ width: '100%', maxWidth: '480px', borderRadius: '24px' }}>
        <div className="text-center mb-4">
          <div className="fs-1 mb-2">🚀</div>
          <h3 className="fw-bold text-dark">Create Account</h3>
          <p className="text-muted small">Start tracking your personal wealth with FinApp</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control bg-light"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control bg-light"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-control bg-light"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="row mb-3">
            <div className="col-md-6 mb-3 mb-md-0">
              <label className="form-label small fw-semibold">Password</label>
              <input
                type="password"
                name="password"
                className="form-control bg-light"
                placeholder="Min 6 chars"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control bg-light"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold rounded-pill mb-3"
            disabled={loading}
          >
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Continue with OTP'}
          </button>
        </form>

        <div className="text-center small text-muted">
          Already have an account?{' '}
          <Link to="/login" className="fw-semibold text-primary text-decoration-none">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
