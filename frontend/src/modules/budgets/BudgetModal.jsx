import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { getCurrentMonthYear } from '../../utils/helpers';

const BudgetModal = ({ isOpen, onClose, onSuccess, initialBudget = null, defaultMonthYear = null }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    monthYear: defaultMonthYear || getCurrentMonthYear(),
    alertAt: 80,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialBudget) {
      setFormData({
        category: initialBudget.category?._id || initialBudget.category || '',
        amount: initialBudget.budgetAmount || initialBudget.amount || '',
        monthYear: initialBudget.monthYear || defaultMonthYear || getCurrentMonthYear(),
        alertAt: initialBudget.alertAt || 80,
      });
    } else {
      setFormData({
        category: categories[0]?._id || '',
        amount: '',
        monthYear: defaultMonthYear || getCurrentMonthYear(),
        alertAt: 80,
      });
    }
  }, [initialBudget, defaultMonthYear, categories, isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?type=expense');
      setCategories(res.data.data || []);
      if (res.data.data?.length && !formData.category) {
        setFormData((prev) => ({ ...prev, category: res.data.data[0]._id }));
      }
    } catch (err) {}
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return setError('Please enter a valid monthly budget limit');
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/budgets', formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set budget');
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
              🎯 {initialBudget ? 'Update Category Budget' : 'Set Category Budget'}
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

              {/* Month */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Target Month</label>
                <input
                  type="month"
                  className="form-control bg-light"
                  value={formData.monthYear}
                  onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Expense Category</label>
                <select
                  className="form-select bg-light"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Choose category...</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Monthly Budget Cap (INR)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 fw-bold">₹</span>
                  <input
                    type="number"
                    step="1"
                    className="form-control bg-light border-0 fw-bold fs-5"
                    placeholder="e.g. 15000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Alert percentage */}
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <label className="form-label small fw-semibold">Overspend Alert Threshold</label>
                  <span className="small fw-bold text-primary">{formData.alertAt}%</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="50"
                  max="100"
                  step="5"
                  value={formData.alertAt}
                  onChange={(e) => setFormData({ ...formData, alertAt: parseInt(e.target.value) })}
                />
                <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                  We'll notify you when your spending exceeds {formData.alertAt}% of this budget.
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 pt-0 pb-4 px-4">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Save Budget'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
