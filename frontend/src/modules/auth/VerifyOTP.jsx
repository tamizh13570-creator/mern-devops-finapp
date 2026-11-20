import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, resendOTP, getActiveOTP } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [currentOtp, setCurrentOtp] = useState(location.state?.otp || '');
  const [otp, setOtp] = useState(location.state?.otp || '');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);

  // If no OTP was in navigation state but we have an email, fetch active OTP
  useEffect(() => {
    if (email && !currentOtp && getActiveOTP) {
      getActiveOTP(email).then((data) => {
        if (data && data.otp) {
          setCurrentOtp(data.otp);
          setOtp(data.otp);
        }
      });
    }
  }, [email, currentOtp, getActiveOTP]);

  // Resend countdown timer (for UI feedback, user can still regenerate once timer reaches 0)
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Generate a new OTP - can be triggered multiple times
  const handleGenerateNewOTP = async () => {
    if (!email) {
      return setError('Please enter your email to generate an OTP.');
    }

    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      const res = await resendOTP(email);
      const newOtp = res.otp || res.data?.otp;
      if (newOtp) {
        setCurrentOtp(newOtp);
        setOtp(newOtp);
      }
      setSuccessMsg(res.message || 'A new OTP has been generated successfully!');
      setTimer(15); // short 15s visual timer
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate new OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return setError('Please provide your email address.');
    }
    if (!otp || otp.trim().length !== 6) {
      return setError('Please enter a valid 6-digit OTP code.');
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await verifyOTP(email, otp.trim());
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please generate a new OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 py-4 p-3"
      style={{ background: 'transparent' }}
    >
      <div
        className="card border-0 shadow-lg p-4 p-md-5"
        style={{
          width: '100%',
          maxWidth: '460px',
          borderRadius: '28px',
          background: 'rgba(16, 23, 42, 0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="text-center mb-4">
          <div className="fs-1 mb-2 sidebar-brand-icon">📩</div>
          <h3 className="fw-bold text-light">Verify OTP</h3>
          <p className="text-muted small">
            Enter the 6-digit verification code sent to <br />
            {email ? (
              <strong className="text-light">{email}</strong>
            ) : (
              <span className="text-muted">your registered email</span>
            )}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
            <i className="bi bi-check-circle-fill"></i>
            <div>{successMsg}</div>
          </div>
        )}

        {/* Dynamically Generated OTP Display Box */}
        {currentOtp ? (
          <div
            className="p-3 mb-3 rounded-4 shadow-sm"
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1.5px solid rgba(99, 102, 241, 0.35)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                  <i className="bi bi-shield-check me-1"></i> VERIFICATION CODE
                </span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary py-1 px-3 fw-bold rounded-pill shadow-sm"
                onClick={() => setOtp(currentOtp)}
                title="Fill generated OTP into input box"
              >
                <i className="bi bi-magic me-1"></i> Auto-fill OTP
              </button>
            </div>
            <div className="d-flex align-items-center justify-content-between py-1">
              <span className="text-muted small">Your Code:</span>
              <strong className="fs-3 text-light fw-bold" style={{ letterSpacing: '6px', fontFamily: 'monospace' }}>
                {currentOtp}
              </strong>
            </div>
            <div
              className="text-muted mt-2 small"
              style={{ fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}
            >
              <i className="bi bi-info-circle me-1 text-primary"></i>
              Valid for 5 mins. Click <strong>"Auto-fill OTP"</strong> or type the code to verify.
            </div>
          </div>
        ) : (
          <div className="alert alert-info py-2 px-3 small mb-3 border-0 rounded-3 bg-info bg-opacity-10 text-dark">
            <div className="d-flex align-items-center justify-content-between">
              <span>
                <i className="bi bi-info-circle me-1 text-primary"></i> Need an OTP?
              </span>
              <button
                type="button"
                className="btn btn-sm btn-primary py-1 px-3 fw-semibold rounded-pill"
                onClick={handleGenerateNewOTP}
                disabled={resending}
              >
                {resending ? 'Generating...' : 'Generate OTP'}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!location.state?.email && (
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email Address</label>
              <input
                type="email"
                className="form-control bg-light"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="form-label small fw-semibold text-center w-100">Enter 6-Digit OTP</label>
            <input
              type="text"
              maxLength={6}
              className="form-control text-center fs-3 fw-bold bg-light"
              style={{ letterSpacing: '8px', minHeight: '60px', fontSize: '1.6rem' }}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold rounded-pill mb-3 shadow-sm"
            disabled={loading}
          >
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Verify & Continue'}
          </button>
        </form>

        {/* Resend / Generate Multiple Times section */}
        <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-1">
          <span className="small text-muted">Need a fresh OTP?</span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-3 rounded-pill fw-semibold"
            onClick={handleGenerateNewOTP}
            disabled={resending || timer > 0}
          >
            {resending ? (
              <span>
                <span className="spinner-border spinner-border-sm me-1"></span>
                Generating...
              </span>
            ) : timer > 0 ? (
              <span>Resend ({timer}s)</span>
            ) : (
              <span>
                <i className="bi bi-arrow-repeat me-1"></i> Generate New OTP
              </span>
            )}
          </button>
        </div>

        <div className="text-center small text-muted mt-3">
          Back to{' '}
          <Link to="/login" className="fw-semibold text-primary text-decoration-none">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
