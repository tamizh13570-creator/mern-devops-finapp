import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { FREQUENCIES } from '../../utils/constants';

const RecurringList = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    source: 'Salary',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    note: '',
    paymentMethod: 'upi',
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recurring');
      setItems(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?type=expense');
      setCategories(res.data.data || []);
      if (res.data.data?.length) {
        setFormData((prev) => ({ ...prev, category: res.data.data[0]._id }));
      }
    } catch (err) {}
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/recurring/${id}/toggle`);
      fetchItems();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring rule?')) return;
    try {
      await api.delete(`/recurring/${id}`);
      fetchItems();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleProcessDue = async () => {
    setProcessing(true);
    try {
      const res = await api.post('/recurring/process');
      alert(res.data.message || 'Due transactions processed!');
      fetchItems();
    } catch (err) {
      alert('Failed to process recurring transactions');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return alert('Enter a valid amount');
    }

    try {
      await api.post('/recurring', formData);
      setShowAddModal(false);
      setFormData({
        type: 'expense',
        amount: '',
        category: categories[0]?._id || '',
        source: 'Salary',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        note: '',
        paymentMethod: 'upi',
      });
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create recurring rule');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Recurring Bills & Subscriptions</h2>
          <p className="text-muted mb-0">Automate repeat charges like Rent, Netflix, Spotify & Salary</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary fw-semibold d-flex align-items-center gap-2"
            onClick={handleProcessDue}
            disabled={processing}
            title="Trigger automated cron check immediately"
          >
            <i className={`bi bi-arrow-repeat ${processing ? 'spin' : ''}`}></i>
            <span>Process Due Now</span>
          </button>

          <button
            className="btn btn-primary fw-semibold d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-lg"></i>
            <span>New Recurring Bill</span>
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="fin-card">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-arrow-repeat fs-1 text-secondary opacity-50 mb-2 d-block"></i>
            <h5 className="fw-bold text-dark">No recurring transactions yet</h5>
            <p className="mb-3">Add your monthly rent, gym memberships, or salary to track them automatically.</p>
            <button className="btn btn-primary rounded-pill px-4" onClick={() => setShowAddModal(true)}>
              Add First Recurring Item
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Frequency</th>
                  <th>Next Due Date</th>
                  <th>Status</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-5">{it.category?.icon || (it.type === 'income' ? '💰' : '🔁')}</span>
                        <div>
                          <div className="fw-semibold text-dark">{it.note || it.category?.name || it.source}</div>
                          <div className="small text-muted">{it.paymentMethod}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${it.type === 'income' ? 'bg-success' : 'bg-danger'} text-capitalize`}>
                        {it.type}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border text-capitalize">
                        {it.frequency}
                      </span>
                    </td>
                    <td className="small fw-semibold">{formatDate(it.nextDueDate)}</td>
                    <td>
                      <button
                        className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                          it.isActive ? 'btn-success' : 'btn-secondary opacity-75'
                        }`}
                        onClick={() => handleToggle(it._id)}
                      >
                        {it.isActive ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td className={`text-end fw-bold fs-6 ${it.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {it.type === 'income' ? '+' : '-'}₹{it.amountInRupees?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(it._id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showAddModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '24px' }}>
              <div className="modal-header border-0 pb-0 pt-4 px-4">
                <h5 className="modal-title fw-bold text-dark">🔁 Schedule Recurring Transaction</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>

              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">
                  {/* Type */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Type</label>
                    <div className="btn-group w-100" role="group">
                      <button
                        type="button"
                        className={`btn ${formData.type === 'expense' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                      >
                        Expense (Rent, Netflix, EMI)
                      </button>
                      <button
                        type="button"
                        className={`btn ${formData.type === 'income' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setFormData({ ...formData, type: 'income' })}
                      >
                        Income (Salary, Dividend)
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Amount (INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="e.g. 500"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  {formData.type === 'expense' && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.icon} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Frequency and Start Date */}
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Frequency</label>
                      <select
                        className="form-select"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      >
                        {FREQUENCIES.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Next / Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Note */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Netflix 4K, House Rent, Gym"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0 pb-4 px-4">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold">
                    Schedule Rule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringList;
