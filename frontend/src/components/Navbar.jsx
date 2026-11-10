import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Navbar = ({ onToggleMobile, onOpenQuickAdd }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // Ignore if offline
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setUnreadCount(0);
    } catch (err) {}
  };

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-light d-lg-none p-2 border-0"
          onClick={onToggleMobile}
          aria-label="Toggle menu"
        >
          <i className="bi bi-list fs-4"></i>
        </button>
        <span className="fw-semibold text-muted d-none d-sm-inline">
          Welcome back, <strong className="text-dark">{user?.name || 'User'}</strong> 👋
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Quick Add Expense Button */}
        <button
          className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-3 py-2 fw-semibold shadow-sm"
          onClick={onOpenQuickAdd}
        >
          <i className="bi bi-plus-circle-fill"></i>
          <span>Add Expense</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="dropdown position-relative">
          <button
            className="btn btn-light position-relative rounded-circle p-2"
            onClick={() => {
              setShowDropdown(!showDropdown);
              if (!showDropdown && unreadCount > 0) markAllAsRead();
            }}
            style={{ width: '42px', height: '42px' }}
          >
            <i className="bi bi-bell-fill text-secondary"></i>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div
              className="dropdown-menu dropdown-menu-end show p-0 shadow-lg border-0"
              style={{
                width: '320px',
                position: 'absolute',
                top: '50px',
                right: '0',
                borderRadius: '16px',
                zIndex: 1050,
              }}
            >
              <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center rounded-top-4">
                <span className="fw-bold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="badge bg-danger rounded-pill">{unreadCount} new</span>
                )}
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted small">
                    <i className="bi bi-check2-circle fs-3 text-success d-block mb-1"></i>
                    All caught up! No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 border-bottom ${!n.isRead ? 'bg-light bg-opacity-75' : ''}`}
                    >
                      <div className="fw-semibold small text-dark">{n.title}</div>
                      <div className="small text-muted">{n.message}</div>
                      <div className="text-end text-muted" style={{ fontSize: '0.7rem' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '40px', height: '40px', fontSize: '1rem' }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
