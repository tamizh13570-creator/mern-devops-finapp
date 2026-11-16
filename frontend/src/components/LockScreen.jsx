import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LockScreen = () => {
  const { unlockApp } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        if (!unlockApp(newPin)) {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleBiometric = () => {
    // Simulated WebAuthn / Biometric scan
    unlockApp('1234');
  };

  return (
    <div className="lock-screen-overlay">
      <div className="lock-box">
        <div className="mb-3 fs-1">🔒</div>
        <h4 className="fw-bold mb-1">FinApp Locked</h4>
        <p className="text-muted small mb-4">Enter your 4-digit PIN or use Biometric unlock</p>

        {/* PIN Indicators */}
        <div className="d-flex justify-content-center gap-3 mb-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`rounded-circle border ${
                error
                  ? 'border-danger bg-danger'
                  : pin.length > idx
                  ? 'border-primary bg-primary'
                  : 'border-secondary'
              }`}
              style={{
                width: '18px',
                height: '18px',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: pin.length > idx ? '0 0 14px rgba(99, 102, 241, 0.85)' : 'none',
                transform: pin.length > idx ? 'scale(1.2)' : 'scale(1)'
              }}
            ></div>
          ))}
        </div>

        {error && <div className="text-danger small mb-3">Incorrect PIN (Default test: 1234)</div>}

        {/* Numeric keypad */}
        <div className="row g-2 justify-content-center mb-3" style={{ maxWidth: '280px', margin: '0 auto' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <div key={num} className="col-4">
              <button
                type="button"
                className="btn lock-keypad-btn w-100 py-3 fs-4 fw-semibold rounded-4"
                onClick={() => handleDigit(String(num))}
              >
                {num}
              </button>
            </div>
          ))}
          <div className="col-4">
            <button
              type="button"
              className="btn lock-keypad-btn w-100 py-3 fs-5 rounded-4 text-info"
              title="Biometric Fingerprint/Face Unlock"
              onClick={handleBiometric}
            >
              <i className="bi bi-fingerprint"></i>
            </button>
          </div>
          <div className="col-4">
            <button
              type="button"
              className="btn lock-keypad-btn w-100 py-3 fs-4 fw-semibold rounded-4"
              onClick={() => handleDigit('0')}
            >
              0
            </button>
          </div>
          <div className="col-4">
            <button
              type="button"
              className="btn lock-keypad-btn w-100 py-3 fs-5 rounded-4 text-muted"
              onClick={handleBackspace}
            >
              <i className="bi bi-backspace"></i>
            </button>
          </div>
        </div>

        <button
          className="btn btn-link text-info text-decoration-none small"
          onClick={handleBiometric}
        >
          <i className="bi bi-shield-check me-1"></i> Quick Biometric Unlock
        </button>
      </div>
    </div>
  );
};

export default LockScreen;
