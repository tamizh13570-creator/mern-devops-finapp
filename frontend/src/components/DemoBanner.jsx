import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DemoBanner = () => {
  const { user } = useAuth();

  if (!user?.isDemo) return null;

  return (
    <div
      className="alert alert-warning border-0 rounded-0 mb-0 py-2 px-4 shadow-sm"
      style={{
        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.12) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
      }}
    >
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2 small">
          <span className="badge bg-warning text-dark fw-bold px-2 py-1">
            <i className="bi bi-shield-exclamation me-1"></i> DEMO MODE
          </span>
          <span className="text-light fw-medium">
            You are browsing as a <strong className="text-warning">Demo User</strong> with limited access (max 15 expenses, 3 budgets, security settings locked).
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link
            to="/register"
            className="btn btn-sm btn-warning text-dark rounded-pill px-3 py-1 fw-bold text-nowrap shadow-sm"
            style={{ fontSize: '0.78rem' }}
          >
            <i className="bi bi-person-plus-fill me-1"></i> Create Free Full Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
