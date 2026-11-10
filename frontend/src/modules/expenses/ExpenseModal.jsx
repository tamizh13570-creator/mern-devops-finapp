import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { PAYMENT_METHODS } from '../../utils/constants';

const ExpenseModal = ({ isOpen, onClose, onSuccess, initialExpense = null }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'upi',
    note: '',
    tags: '',
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialExpense) {
      setFormData({
        amount: initialExpense.amountInRupees || initialExpense.amount || '',
        category: initialExpense.category?._id || initialExpense.category || '',
        date: initialExpense.date ? new Date(initialExpense.date).toISOString().split('T')[0] : '',
        paymentMethod: initialExpense.paymentMethod || 'upi',
        note: initialExpense.note || '',
        tags: Array.isArray(initialExpense.tags) ? initialExpense.tags.join(', ') : '',
      });
    } else {
      setFormData({
        amount: '',
        category: categories[0]?._id || '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'upi',
        note: '',
        tags: '',
      });
      setReceiptFile(null);
    }
  }, [initialExpense, categories, isOpen]);

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
      return setError('Please enter a valid amount');
    }
    if (!formData.category) {
      return setError('Please select a category');
    }

    setLoading(true);
    setError('');

    try {
      const formPayload = new FormData();
      formPayload.append('amount', formData.amount);
      formPayload.append('category', formData.category);
      formPayload.append('date', formData.date);
      formPayload.append('paymentMethod', formData.paymentMethod);
      formPayload.append('note', formData.note);

      if (formData.tags) {
        const tagList = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
        tagList.forEach((t) => formPayload.append('tags[]', t));
      }

      if (receiptFile) {
        formPayload.append('receiptPhoto', receiptFile);
      }

      if (initialExpense?._id) {
        await api.put(`/expenses/${initialExpense._id}`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/expenses', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
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
              {initialExpense ? 'Edit Expense' : '⚡ Log Expense (Quick Entry)'}
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

              {/* Amount Input */}
              <div className="mb-3 text-center">
                <label className="form-label small text-muted text-uppercase fw-bold">Amount (INR)</label>
                <div className="input-group input-group-lg justify-content-center">
                  <span className="input-group-text bg-light border-0 fw-bold fs-3 text-primary">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control bg-light border-0 fw-bold fs-2 text-primary"
                    style={{ maxWidth: '240px' }}
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Category</label>
                <select
                  className="form-select bg-light"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Payment Method */}
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
                  <label className="form-label small fw-semibold">Payment Method</label>
                  <select
                    className="form-select bg-light"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.icon} {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note / Merchant */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Note / Merchant</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="e.g. Swiggy lunch, Uber cab, Grocery"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>

              {/* Receipt upload and Tags */}
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Receipt Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control form-control-sm bg-light"
                    onChange={(e) => setReceiptFile(e.target.files[0])}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Tags</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-light"
                    placeholder="e.g. office, trip"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 pt-0 pb-4 px-4">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;
