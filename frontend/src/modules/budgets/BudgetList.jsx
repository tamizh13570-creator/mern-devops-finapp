import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { getCurrentMonthYear, getMonthName } from '../../utils/helpers';
import BudgetModal from './BudgetModal';

const BudgetList = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, [monthYear]);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/budgets?monthYear=${monthYear}`);
      setBudgets(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      alert('Failed to delete budget');
    }
  };

  const totalBudget = budgets.reduce((acc, b) => acc + (b.budgetAmount || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Monthly Budgets & Alerts</h2>
          <p className="text-muted mb-0">Set spending guardrails with automatic overspend detection</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Download link */}
          <Link
            to={`/reports?monthYear=${monthYear}`}
            className="btn btn-outline-success fw-semibold d-flex align-items-center gap-2 shadow-sm"
          >
            <i className="bi bi-cloud-arrow-down-fill fs-5"></i>
            <span className="d-none d-sm-inline">Export Data</span>
          </Link>

          <input
            type="month"
            className="form-control fw-bold border shadow-sm"
            style={{ width: '180px' }}
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
          />

          <button
            className="btn btn-primary fw-semibold d-flex align-items-center gap-2 shadow-sm"
            onClick={() => {
              setSelectedBudget(null);
              setModalOpen(true);
            }}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Top Overview Progress Card */}
      <div className="fin-card mb-4 bg-light bg-opacity-50">
        <div className="row align-items-center">
          <div className="col-12 col-md-4 mb-3 mb-md-0">
            <div className="small text-muted text-uppercase fw-semibold">Overall Budget Status</div>
            <div className="fs-3 fw-bold text-dark mt-1">
              ₹{totalSpent.toLocaleString('en-IN')} <span className="fs-6 fw-normal text-muted">/ ₹{totalBudget.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="col-12 col-md-5 mb-3 mb-md-0">
            <div className="d-flex justify-content-between small fw-semibold mb-1">
              <span>{overallPercentage}% Utilized</span>
              <span className={overallPercentage > 100 ? 'text-danger' : 'text-success'}>
                {overallPercentage > 100 ? 'Over Budget' : `₹${Math.max(0, totalBudget - totalSpent).toLocaleString('en-IN')} Left`}
              </span>
            </div>
            <div className="progress" style={{ height: '12px' }}>
              <div
                className={`progress-bar ${overallPercentage > 100 ? 'bg-danger' : overallPercentage > 80 ? 'bg-warning' : 'bg-primary'}`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="col-12 col-md-3 text-md-end">
            <span className="badge bg-white text-secondary border px-3 py-2 rounded-pill small">
              {budgets.length} Categories Configured
            </span>
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="fin-card text-center py-5 text-muted">
          <i className="bi bi-pie-chart-fill fs-1 text-secondary opacity-50 mb-2 d-block"></i>
          <h5 className="fw-bold text-dark">No budgets configured for {getMonthName(monthYear)}</h5>
          <p className="mb-3">Set monthly caps on categories like Food, Rent, or Shopping to prevent overspending.</p>
          <button
            className="btn btn-primary rounded-pill px-4"
            onClick={() => {
              setSelectedBudget(null);
              setModalOpen(true);
            }}
          >
            Create Category Budget
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {budgets.map((b) => (
            <div key={b._id} className="col-12 col-md-6 col-xl-4">
              <div className="fin-card h-100 position-relative">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-3">{b.category?.icon || '🏷️'}</span>
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">{b.category?.name || 'Category'}</h6>
                      <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                        Alert threshold: {b.alertAt}%
                      </span>
                    </div>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-sm btn-light border-0 rounded-circle"
                      onClick={() => handleDelete(b._id)}
                      title="Delete budget"
                    >
                      <i className="bi bi-trash text-danger"></i>
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-baseline mb-2">
                  <div className="fs-4 fw-bold text-dark">
                    ₹{b.spent.toLocaleString('en-IN')}
                  </div>
                  <div className="small text-muted">
                    Cap: <strong>₹{b.budgetAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress mb-2" style={{ height: '10px' }}>
                  <div
                    className={`progress-bar ${
                      b.status === 'exceeded'
                        ? 'bg-danger'
                        : b.status === 'warning'
                        ? 'bg-warning'
                        : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  ></div>
                </div>

                <div className="d-flex justify-content-between align-items-center small">
                  <span className={`fw-semibold ${b.status === 'exceeded' ? 'text-danger' : b.status === 'warning' ? 'text-warning' : 'text-success'}`}>
                    {b.status === 'exceeded' ? (
                      <>
                        <i className="bi bi-exclamation-triangle-fill me-1"></i> Over budget by ₹{(b.spent - b.budgetAmount).toLocaleString('en-IN')}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill me-1"></i> ₹{b.remaining.toLocaleString('en-IN')} left
                      </>
                    )}
                  </span>
                  <span className="badge bg-light text-dark border">{b.percentage}% used</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchBudgets}
        initialBudget={selectedBudget}
        defaultMonthYear={monthYear}
      />
    </div>
  );
};

export default BudgetList;
