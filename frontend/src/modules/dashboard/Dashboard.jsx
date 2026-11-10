import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, getCurrentMonthYear, getMonthName } from '../../utils/helpers';
import PieChart from '../../components/charts/PieChart';
import TrendChart from '../../components/charts/TrendChart';

const Dashboard = ({ onOpenQuickAdd }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());

  useEffect(() => {
    fetchDashboardData(monthYear);
  }, [monthYear]);

  const fetchDashboardData = async (mYear) => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard?monthYear=${mYear}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const summary = data?.summary || { totalSpent: 0, totalIncome: 0, savings: 0, savingsRate: 0 };
  const currency = summary.currency || 'INR';

  // Calculate total budget & remaining across categories
  const totalBudgeted = data?.budgets?.reduce((acc, b) => acc + (b.budgetAmount || 0), 0) || 0;
  const totalBudgetSpent = data?.budgets?.reduce((acc, b) => acc + (b.spent || 0), 0) || 0;
  const budgetLeft = Math.max(0, totalBudgeted - totalBudgetSpent);

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Financial Overview</h2>
          <p className="text-muted mb-0">Track budgets, monitor spending, and download monthly statements</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Month Picker */}
          <input
            type="month"
            className="form-control fw-semibold border shadow-sm"
            style={{ width: '180px' }}
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
          />

          {/* User Requirement 3: Direct module/icon to download monthly data */}
          <Link
            to={`/reports?monthYear=${monthYear}`}
            className="btn btn-outline-success fw-semibold d-flex align-items-center gap-2 shadow-sm"
            title="Download Monthly Data"
          >
            <i className="bi bi-cloud-arrow-down-fill fs-5"></i>
            <span className="d-none d-sm-inline">Export Data</span>
          </Link>

          <button
            className="btn btn-primary fw-semibold d-flex align-items-center gap-2 shadow-sm"
            onClick={onOpenQuickAdd}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* 4 Top Stat Cards */}
      <div className="row g-3 mb-4">
        {/* Total Income */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card income-card">
            <div className="stat-label">Monthly Income</div>
            <div className="stat-value">{formatCurrency(summary.totalIncome, currency)}</div>
            <div className="small opacity-75">
              <i className="bi bi-arrow-up-circle-fill me-1"></i>
              {summary.incomeCount || 0} entries this month
            </div>
            <i className="bi bi-cash-stack stat-icon"></i>
          </div>
        </div>

        {/* Total Spent */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card expense-card">
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">{formatCurrency(summary.totalSpent, currency)}</div>
            <div className="small opacity-75">
              <i className="bi bi-arrow-down-circle-fill me-1"></i>
              {summary.expenseCount || 0} expenses recorded
            </div>
            <i className="bi bi-credit-card-2-front stat-icon"></i>
          </div>
        </div>

        {/* Net Savings */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card savings-card">
            <div className="stat-label">Net Savings</div>
            <div className="stat-value">{formatCurrency(summary.savings, currency)}</div>
            <div className="small opacity-75">
              <i className="bi bi-piggy-bank-fill me-1"></i>
              {summary.savingsRate}% Savings Rate
            </div>
            <i className="bi bi-wallet-fill stat-icon"></i>
          </div>
        </div>

        {/* Budget Left to Spend */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card budget-card">
            <div className="stat-label">Left to Spend</div>
            <div className="stat-value">
              {totalBudgeted > 0 ? formatCurrency(budgetLeft, currency) : 'No Budget'}
            </div>
            <div className="small opacity-75">
              <i className="bi bi-shield-check me-1"></i>
              {totalBudgeted > 0 ? `${formatCurrency(totalBudgetSpent, currency)} spent` : 'Set a monthly budget'}
            </div>
            <i className="bi bi-graph-up-arrow stat-icon"></i>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Category Breakdown (Pie/Donut) */}
        <div className="col-12 col-lg-5">
          <div className="fin-card h-100">
            <div className="fin-card-header">
              <h5 className="fw-bold mb-0">Expense Breakdown</h5>
              <span className="badge bg-light text-muted border">{getMonthName(monthYear)}</span>
            </div>
            <PieChart data={data?.categoryBreakdown || []} height={230} />
          </div>
        </div>

        {/* 6-Month Income vs Expense Trend (Bar Chart) */}
        <div className="col-12 col-lg-7">
          <div className="fin-card h-100">
            <div className="fin-card-header">
              <h5 className="fw-bold mb-0">Income vs Expense Trend</h5>
              <span className="badge bg-light text-muted border">Last 6 Months</span>
            </div>
            <TrendChart data={data?.monthlyTrends || []} height={230} />
          </div>
        </div>
      </div>

      {/* Budgets & Recent Transactions Row */}
      <div className="row g-4">
        {/* Budgets Progress List */}
        <div className="col-12 col-lg-6">
          <div className="fin-card h-100">
            <div className="fin-card-header">
              <h5 className="fw-bold mb-0">Category Budgets</h5>
              <Link to="/budgets" className="text-primary text-decoration-none small fw-semibold">
                Manage All <i className="bi bi-chevron-right"></i>
              </Link>
            </div>

            {(!data?.budgets || data.budgets.length === 0) ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-pie-chart fs-1 text-secondary opacity-50 mb-2 d-block"></i>
                <p className="mb-2">No budgets set for {getMonthName(monthYear)}</p>
                <Link to="/budgets" className="btn btn-sm btn-outline-primary rounded-pill">
                  Set Your First Budget
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {data.budgets.slice(0, 4).map((b) => (
                  <div key={b._id}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span>{b.category?.icon || '🏷️'}</span>
                        <span className="fw-semibold small">{b.category?.name || 'Category'}</span>
                      </div>
                      <div className="small">
                        <strong>₹{b.spent.toLocaleString('en-IN')}</strong> / ₹{b.budgetAmount.toLocaleString('en-IN')}
                        <span className={`badge ms-2 ${b.status === 'exceeded' ? 'bg-danger' : b.status === 'warning' ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {b.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="progress">
                      <div
                        className={`progress-bar ${b.status === 'exceeded' ? 'bg-danger' : b.status === 'warning' ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${Math.min(b.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="col-12 col-lg-6">
          <div className="fin-card h-100">
            <div className="fin-card-header">
              <h5 className="fw-bold mb-0">Recent Activity</h5>
              <Link to="/expenses" className="text-primary text-decoration-none small fw-semibold">
                View All <i className="bi bi-chevron-right"></i>
              </Link>
            </div>

            {(!data?.recentTransactions || data.recentTransactions.length === 0) ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-receipt fs-1 text-secondary opacity-50 mb-2 d-block"></i>
                <p className="mb-0">No recent transactions yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {data.recentTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="p-2 px-3 rounded-3 d-flex justify-content-between align-items-center bg-light bg-opacity-50"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '38px', height: '38px', backgroundColor: '#e2e8f0', fontSize: '1.2rem' }}
                      >
                        {tx.icon}
                      </div>
                      <div>
                        <div className="fw-semibold text-dark small">{tx.title}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {tx.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className={`fw-bold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
