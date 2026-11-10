import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ showMobile, onCloseMobile }) => {
  const { logout } = useAuth();

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
    <aside className={`sidebar ${showMobile ? 'show' : ''}`}>
      <div className="sidebar-brand">
        <span className="fs-3">💰</span>
        <div>
          <div className="fw-bold tracking-tight">FinApp</div>
          <div className="small text-muted fw-normal" style={{ fontSize: '0.7rem' }}>
            Smart Wealth Manager
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
            onClick={onCloseMobile}
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
          onClick={logout}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
