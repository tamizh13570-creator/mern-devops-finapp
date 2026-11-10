import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { INCOME_SOURCES } from '../../utils/constants';

const IncomeModal = ({ isOpen, onClose, onSuccess, initialIncome = null }) => {
  const [formData, setFormData] = useState({
    amount: '',
    source: 'Salary',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialIncome) {
      setFormData({
        amount: initialIncome.amountInRupees || initialIncome.amount || '',
        source: initialIncome.source || 'Salary',
        date: initialIncome.date ? new Date(initialIncome.date).toISOString().split('T')[0] : '',
        paymentMethod: initialIncome.paymentMethod || 'bank_transfer',
        note: initialIncome.note || '',
      });
    } else {
      setFormData({
        amount: '',
        source: 'Salary',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer',
        note: '',
      });
    }
  }, [initialIncome, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return setError('Please enter a valid income amount');
    }

    setLoading(true);
    setError('');

    try {
      if (initialIncome?._id) {
        await api.put(`/income/${initialIncome._id}`, formData);
      } else {
        await api.post('/income', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save income');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '24px' }}>
          <div className="modal-header border-0 pb-0 pt-4 px-4">
            <h5 className="modal-title fw-bold text-dark">
              {initialIncome ? 'Edit Income' : '💰 Log New Income'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger py-2 small mb-3">
                  <i className="bi bi-exclamation-circle me-1"></i> {error}
                </div>
              )}

              {/* Amount */}
              <div className="mb-3 text-center">
                <label className="form-label small text-muted text-uppercase fw-bold">Amount (INR)</label>
                <div className="input-group input-group-lg justify-content-center">
                  <span className="input-group-text bg-light border-0 fw-bold fs-3 text-success">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control bg-light border-0 fw-bold fs-2 text-success"
                    style={{ maxWidth: '240px' }}
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Source */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Income Source</label>
                <select
                  className="form-select bg-light"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  required
                >
                  {INCOME_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Payment Method */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Date</label>
                  <input
                    type="date"
                    className="form-control bg-light"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Method</label>
                  <select
                    className="form-select bg-light"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    <option value="bank_transfer">Bank Transfer / NEFT</option>
                    <option value="upi">UPI / Online</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Note */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Note / Description</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="e.g. October monthly salary, Website project"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer border-0 pt-0 pb-4 px-4">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success rounded-pill px-4 fw-semibold" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Save Income'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IncomeModal;
