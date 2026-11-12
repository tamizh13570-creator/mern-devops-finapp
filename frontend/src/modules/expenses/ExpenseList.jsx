import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatDate, getCurrentMonthYear } from '../../utils/helpers';
import ExpenseModal from './ExpenseModal';

const ExpenseList = ({ onOpenQuickAdd }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    monthYear: getCurrentMonthYear(),
    paymentMethod: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories?type=expense');
      setCategories(res.data.data || []);
    } catch (err) {}
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.monthYear) params.append('monthYear', filters.monthYear);
      if (filters.category) params.append('category', filters.category);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/expenses?${params.toString()}`);
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setModalOpen(true);
  };

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amountInRupees || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Expenses</h2>
          <p className="text-muted mb-0">Record, filter, and track all your outgoings</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Download Module Link */}
          <Link
            to={`/reports?monthYear=${filters.monthYear}`}
            className="btn btn-outline-success fw-semibold d-flex align-items-center gap-2 shadow-sm"
            title="Download this month data to disk"
          >
            <i className="bi bi-cloud-arrow-down-fill fs-5"></i>
            <span className="d-none d-sm-inline">Download Data</span>
          </Link>

          <button
            className="btn btn-primary fw-semibold d-flex align-items-center gap-2 shadow-sm"
            onClick={() => {
              setSelectedExpense(null);
              setModalOpen(true);
            }}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="fin-card mb-4 p-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-0"
                placeholder="Search notes or tags..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <input
              type="month"
              className="form-control bg-light border-0 fw-semibold"
              value={filters.monthYear}
              onChange={(e) => setFilters({ ...filters, monthYear: e.target.value })}
            />
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select bg-light border-0"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-2 text-md-end">
            <div className="fw-bold text-danger fs-5">
              ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Total in view</div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="fin-card">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-receipt-cutoff fs-1 text-secondary opacity-50 mb-2 d-block"></i>
            <p className="mb-2">No expenses found matching the current filters.</p>
            <button
              className="btn btn-sm btn-primary rounded-pill px-3"
              onClick={() => {
                setSelectedExpense(null);
                setModalOpen(true);
              }}
            >
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Category</th>
                  <th>Note & Tags</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-5">{exp.category?.icon || '🏷️'}</span>
                        <span className="fw-semibold text-dark">{exp.category?.name || 'General'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="fw-normal text-dark">{exp.note || '-'}</div>
                      {exp.tags?.length > 0 && (
                        <div className="d-flex gap-1 mt-1">
                          {exp.tags.map((t, i) => (
                            <span key={i} className="badge bg-light text-secondary border" style={{ fontSize: '0.65rem' }}>
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-muted small">{formatDate(exp.date)}</td>
                    <td>
                      <span className="badge bg-light text-dark text-capitalize border">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="text-end fw-bold text-danger fs-6">
                      -₹{exp.amountInRupees?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleEdit(exp)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(exp._id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchExpenses}
        initialExpense={selectedExpense}
      />
    </div>
  );
};

export default ExpenseList;
