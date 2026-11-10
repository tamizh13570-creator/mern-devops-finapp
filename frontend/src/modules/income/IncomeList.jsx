import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatDate, getCurrentMonthYear } from '../../utils/helpers';
import IncomeModal from './IncomeModal';
import { INCOME_SOURCES } from '../../utils/constants';

const IncomeList = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    source: '',
    monthYear: getCurrentMonthYear(),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);

  useEffect(() => {
    fetchIncomes();
  }, [filters]);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.monthYear) params.append('monthYear', filters.monthYear);
      if (filters.source) params.append('source', filters.source);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/income?${params.toString()}`);
      setIncomes(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income entry?')) return;
    try {
      await api.delete(`/income/${id}`);
      fetchIncomes();
    } catch (err) {
      alert('Failed to delete income');
    }
  };

  const totalIncome = incomes.reduce((sum, i) => sum + (i.amountInRupees || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Income Streams</h2>
          <p className="text-muted mb-0">Track all your earnings, salaries, and investment returns</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Direct link to download module */}
          <Link
            to={`/reports?monthYear=${filters.monthYear}`}
            className="btn btn-outline-success fw-semibold d-flex align-items-center gap-2 shadow-sm"
          >
            <i className="bi bi-cloud-arrow-down-fill fs-5"></i>
            <span className="d-none d-sm-inline">Download Data</span>
          </Link>

          <button
            className="btn btn-success fw-semibold d-flex align-items-center gap-2 shadow-sm"
            onClick={() => {
              setSelectedIncome(null);
              setModalOpen(true);
            }}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Log Income</span>
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
                placeholder="Search notes..."
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
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            >
              <option value="">All Sources</option>
              {INCOME_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-2 text-md-end">
            <div className="fw-bold text-success fs-5">
              +₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Total in view</div>
          </div>
        </div>
      </div>

      {/* Incomes Table */}
      <div className="fin-card">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : incomes.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-cash-stack fs-1 text-secondary opacity-50 mb-2 d-block"></i>
            <p className="mb-2">No income records found for this period.</p>
            <button
              className="btn btn-sm btn-success rounded-pill px-3"
              onClick={() => {
                setSelectedIncome(null);
                setModalOpen(true);
              }}
            >
              Log Income
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Source</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((inc) => (
                  <tr key={inc._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success bg-opacity-10 text-success p-2 rounded-circle fs-6">
                          <i className="bi bi-cash"></i>
                        </span>
                        <span className="fw-semibold text-dark">{inc.source}</span>
                      </div>
                    </td>
                    <td className="text-dark">{inc.note || '-'}</td>
                    <td className="text-muted small">{formatDate(inc.date)}</td>
                    <td>
                      <span className="badge bg-light text-dark text-capitalize border">
                        {inc.paymentMethod?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-end fw-bold text-success fs-6">
                      +₹{inc.amountInRupees?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setSelectedIncome(inc);
                            setModalOpen(true);
                          }}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(inc._id)}
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

      <IncomeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchIncomes}
        initialIncome={selectedIncome}
      />
    </div>
  );
};

export default IncomeList;
