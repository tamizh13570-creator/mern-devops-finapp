import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, showMobile, onClose, onCloseMobile }) => {
  const { logout, user } = useAuth();
  const isVisible = isOpen ?? showMobile ?? false;
  const handleClose = onClose || onCloseMobile;

  const navItems = [
    { to: '/', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
    { to: '/expenses', label: 'Expenses', icon: 'bi-wallet2' },
    { to: '/income', label: 'Income', icon: 'bi-cash-coin' },
    { to: '/budgets', label: 'Budgets & Alerts', icon: 'bi-pie-chart-fill' },
    { to: '/categories', label: 'Categories', icon: 'bi-tags-fill' },
    { to: '/recurring', label: 'Recurring Bills', icon: 'bi-arrow-repeat' },
    { to: '/reports', label: 'Reports & Download', icon: 'bi-cloud-arrow-down-fill', badge: 'Download' },
    { to: '/settings', label: 'Settings & Security', icon: 'bi-shield-lock-fill' },
  ];

  return (
    <aside className={`sidebar ${isVisible ? 'show' : ''}`}>
      {/* Prominent Close Button to close this tab */}
      <button
        type="button"
        className="sidebar-close-btn"
        onClick={handleClose}
        aria-label="Close sidebar"
        title="Close this menu"
      >
        <i className="bi bi-x-lg"></i>
      </button>

      <Link to="/" className="sidebar-brand text-decoration-none" onClick={handleClose}>
        <span className="sidebar-brand-icon">💰</span>
        <div>
          <div className="fw-bold tracking-tight sidebar-brand-title">FinApp</div>
          <div className="small text-muted fw-normal" style={{ fontSize: '0.7rem' }}>
            Smart Wealth Manager
          </div>
          {user?.isDemo && (
            <span className="badge bg-warning text-dark px-2 py-0 mt-1" style={{ fontSize: '0.62rem' }}>
              DEMO (LIMITED)
            </span>
          )}
        </div>
      </Link>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
            onClick={handleClose}
          >
            <i className={`bi ${item.icon}`}></i>
            <span className="flex-grow-1">{item.label}</span>
            {item.badge && (
              <span className="badge rounded-pill bg-success" style={{ fontSize: '0.65rem' }}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-top border-secondary border-opacity-25">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={() => {
            if (handleClose) handleClose();
            logout();
          }}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
