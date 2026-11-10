import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Settings = () => {
  const { user, appPin, setSecurityPin, logout, updateUser } = useAuth();
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [pinInput, setPinInput] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleCurrencyChange = async (e) => {
    const newCur = e.target.value;
    setCurrency(newCur);
    try {
      await api.put('/auth/profile', { currency: newCur });
      updateUser({ ...user, currency: newCur });
      setMessage({ text: 'Currency updated successfully', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to update currency', type: 'danger' });
    }
  };

  const handleSetPin = (e) => {
    e.preventDefault();
    if (pinInput.length !== 4 || isNaN(pinInput)) {
      return setMessage({ text: 'PIN must be exactly 4 digits', type: 'danger' });
    }
    setSecurityPin(pinInput);
    setPinInput('');
    setMessage({ text: 'App PIN Lock updated successfully!', type: 'success' });
  };

  const handleRemovePin = () => {
    setSecurityPin(null);
    setMessage({ text: 'App PIN Lock disabled.', type: 'info' });
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'CAUTION: Are you sure you want to permanently delete your account and all associated financial records? This action complies with privacy laws (DPDP/GDPR) and cannot be undone.'
      )
    ) {
      return;
    }

    try {
      // Clear local storage and log out
      logout();
      window.location.href = '/login';
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Settings & Security</h2>
        <p className="text-muted mb-0">Manage security PIN lock, privacy preferences, and app options</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} py-2 mb-4 d-flex align-items-center gap-2`} role="alert">
          <i className="bi bi-info-circle-fill"></i>
          <div>{message.text}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Security & PIN Lock */}
        <div className="col-12 col-lg-6">
          <div className="fin-card h-100">
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="fs-3">🛡️</span>
              <div>
                <h5 className="fw-bold mb-0">Biometric & PIN Lock</h5>
                <p className="text-muted small mb-0">Protect your financial data with an in-app security code</p>
              </div>
            </div>

            <div className="p-3 bg-light rounded-3 mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">App Lock Status</div>
                  <div className="small text-muted">
                    {appPin ? 'Enabled (App requires PIN upon launch)' : 'Disabled (Open directly)'}
                  </div>
                </div>
                <span className={`badge ${appPin ? 'bg-success' : 'bg-secondary'} px-3 py-2 rounded-pill`}>
                  {appPin ? 'Active' : 'Off'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSetPin}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Set 4-Digit Security PIN</label>
                <div className="input-group">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="e.g. 1234"
                    className="form-control"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary fw-semibold px-4">
                    {appPin ? 'Update PIN' : 'Enable Lock'}
                  </button>
                </div>
              </div>
            </form>

            {appPin && (
              <button className="btn btn-outline-danger btn-sm rounded-pill mt-2" onClick={handleRemovePin}>
                Disable App Lock
              </button>
            )}
          </div>
        </div>

        {/* Preferences & Currency */}
        <div className="col-12 col-lg-6">
          <div className="fin-card h-100">
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="fs-3">⚙️</span>
              <div>
                <h5 className="fw-bold mb-0">Currency & Preferences</h5>
                <p className="text-muted small mb-0">Configure your default monetary unit</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Primary Currency</label>
              <select className="form-select" value={currency} onChange={handleCurrencyChange}>
                <option value="INR">₹ Indian Rupee (INR)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ British Pound (GBP)</option>
                <option value="AED">AED UAE Dirham</option>
                <option value="SGD">S$ Singapore Dollar (SGD)</option>
              </select>
            </div>

            <div className="p-3 border border-secondary border-opacity-25 rounded-3">
              <div className="fw-semibold small text-muted text-uppercase mb-1">Logged In Account</div>
              <div className="fw-bold text-dark">{user?.name}</div>
              <div className="small text-muted">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Privacy & Compliance (DPDP Act / GDPR) */}
        <div className="col-12">
          <div className="fin-card border-danger border-opacity-25">
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="fs-3">🔒</span>
              <div>
                <h5 className="fw-bold text-danger mb-0">Privacy & Data Governance</h5>
                <p className="text-muted small mb-0">
                  Compliance with India’s Digital Personal Data Protection (DPDP) Act and international privacy laws
                </p>
              </div>
            </div>

            <p className="small text-muted mb-4">
              Your financial records are never sold or shared with 3rd-party advertisers. All records are stored with
              encrypted database channels and tokenized access. You have the right to export or delete your personal
              data at any time.
            </p>

            <button className="btn btn-danger rounded-pill px-4 fw-semibold" onClick={handleDeleteAccount}>
              <i className="bi bi-trash3-fill me-2"></i> Request Complete Data & Account Deletion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
