import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Navbar = ({ onToggleSidebar, onToggleMobile, onOpenQuickAdd }) => {
  const { user, logout, updateUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fileInputRef = useRef(null);
  const userDropdownRef = useRef(null);
  const handleToggle = onToggleSidebar || onToggleMobile;

  // Real-time live clock: updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showUserMenu]);

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

  // Helper to format avatar image URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http') || avatarPath.startsWith('data:image')) {
      return avatarPath;
    }
    const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
    return `${baseUrl}${avatarPath}`;
  };

  const avatarSrc = getAvatarUrl(user?.avatar);

  // Formatted date and time
  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Handle local disk image picker click
  const handlePickImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image selected from local disk / gallery
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP, etc.).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Selected image exceeds the 5MB size limit.');
      return;
    }

    setUploadingPhoto(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      try {
        const formData = new FormData();
        formData.append('avatar', file);

        const res = await api.put('/auth/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data?.data?.user) {
          updateUser(res.data.data.user);
        } else {
          updateUser({ ...user, avatar: base64Data });
        }
      } catch (err) {
        // Fallback for demo mode or offline: store base64 in user state and localStorage
        updateUser({ ...user, avatar: base64Data });
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-2 gap-sm-3">
        {/* Dashboard Button: click to open this tab completely with full navigation access */}
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-3 py-2 fw-semibold shadow-sm"
          onClick={handleToggle}
          title="Click to open Dashboard Menu & complete access"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 4px 18px rgba(99, 102, 241, 0.45)',
          }}
        >
          <i className="bi bi-grid-1x2-fill fs-6"></i>
          <span>Dashboard</span>
        </button>

        <span className="fw-semibold text-muted d-none d-md-inline ms-1">
          Welcome back, <strong className="text-dark">{user?.name || 'User'}</strong> 👋
          {user?.isDemo && (
            <span className="badge bg-warning text-dark ms-2 fw-semibold" style={{ fontSize: '0.7rem' }}>
              DEMO
            </span>
          )}
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Quick Add Expense Button */}
        <button
          className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-3 py-2 fw-semibold shadow-sm"
          onClick={onOpenQuickAdd}
        >
          <i className="bi bi-plus-circle-fill"></i>
          <span className="d-none d-md-inline">Add Expense</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="dropdown position-relative">
          <button
            className="btn btn-light position-relative rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={() => {
              setShowDropdown(!showDropdown);
              if (!showDropdown && unreadCount > 0) markAllAsRead();
            }}
            style={{ width: '42px', height: '42px', border: '1px solid rgba(255,255,255,0.15)' }}
            aria-label="Notifications"
          >
            <i className="bi bi-bell-fill text-light"></i>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div
              className="dropdown-menu dropdown-menu-end show p-0 shadow-lg"
              style={{
                width: '320px',
                maxWidth: 'calc(100vw - 32px)',
                position: 'absolute',
                top: '52px',
                right: '0',
                borderRadius: '18px',
                zIndex: 1050,
              }}
            >
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center rounded-top-4" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <span className="fw-bold text-light">Notifications</span>
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
                      className={`p-3 border-bottom ${!n.isRead ? 'bg-primary bg-opacity-10' : ''}`}
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                      <div className="fw-semibold small text-light">{n.title}</div>
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

        {/* User Avatar & Profile Details Dropdown */}
        <div className="dropdown position-relative" ref={userDropdownRef}>
          <button
            type="button"
            className="rounded-circle p-0 border-0 d-flex align-items-center justify-content-center"
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              width: '42px',
              height: '42px',
              cursor: 'pointer',
              background: 'transparent',
              outline: 'none',
              boxShadow: showUserMenu ? '0 0 0 3px rgba(99, 102, 241, 0.6)' : 'none',
              borderRadius: '50%',
              transition: 'all 0.25s ease',
            }}
            aria-label="User profile details"
            title="Click to view Username, Date, Time, Profile Photo & Sign Out"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user?.name || 'User'}
                className="rounded-circle object-fit-cover"
                style={{
                  width: '42px',
                  height: '42px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 0 16px rgba(99, 102, 241, 0.5)',
                }}
              />
            ) : (
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: '42px',
                  height: '42px',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 0 16px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                  transition: 'transform 0.25s ease',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>

          {/* User Details Dropdown Menu */}
          {showUserMenu && (
            <div
              className="user-profile-dropdown shadow-lg"
              style={{
                position: 'absolute',
                top: '52px',
                right: '0',
                width: '320px',
                maxWidth: 'calc(100vw - 32px)',
                background: 'rgba(13, 19, 35, 0.94)',
                backdropFilter: 'blur(28px) saturate(190%)',
                WebkitBackdropFilter: 'blur(28px) saturate(190%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '24px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                padding: '24px 20px',
                zIndex: 1060,
                animation: 'modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                color: '#f8fafc',
              }}
            >
              {/* Profile Photo with Local Disk / Gallery Picker */}
              <div className="d-flex flex-column align-items-center text-center mb-3">
                <div
                  className="position-relative mb-2"
                  style={{ cursor: 'pointer' }}
                  onClick={handlePickImage}
                  title="Click to choose a photo from your local disk/gallery"
                >
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Profile Avatar"
                      className="rounded-circle object-fit-cover"
                      style={{
                        width: '84px',
                        height: '84px',
                        border: '3px solid rgba(99, 102, 241, 0.7)',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: '84px',
                        height: '84px',
                        fontSize: '2.2rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        boxShadow: '0 0 25px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  {/* Camera icon badge */}
                  <div
                    className="position-absolute bottom-0 end-0 rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow"
                    style={{
                      width: '28px',
                      height: '28px',
                      fontSize: '0.85rem',
                      border: '2px solid #0d1323',
                    }}
                    title="Upload photo from local disk"
                  >
                    <i className="bi bi-camera-fill"></i>
                  </div>
                </div>

                {/* Hidden File Input for Local Disk / Gallery Selection */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                {/* Upload Button */}
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none p-0 mb-2"
                  onClick={handlePickImage}
                  disabled={uploadingPhoto}
                  style={{ color: '#a5b4fc', fontSize: '0.78rem' }}
                >
                  {uploadingPhoto ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Saving Photo...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-folder2-open me-1"></i> Change Photo from Gallery
                    </>
                  )}
                </button>

                {/* Username & Email */}
                <h6 className="fw-bold mb-0 text-light fs-5">{user?.name || 'User'}</h6>
                <span className="text-muted small text-truncate d-block w-100" style={{ fontSize: '0.8rem' }}>
                  {user?.email || 'user@finapp.com'}
                </span>
                {user?.isDemo && (
                  <span className="badge bg-warning text-dark px-2 py-0 mt-1 fw-bold" style={{ fontSize: '0.65rem' }}>
                    DEMO ACCOUNT
                  </span>
                )}
              </div>

              {/* Date & Time Section */}
              <div
                className="p-3 rounded-3 mb-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Date */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small d-flex align-items-center gap-2">
                    <i className="bi bi-calendar3 text-primary"></i> Date:
                  </span>
                  <strong className="text-light small">{formattedDate}</strong>
                </div>

                {/* Time */}
                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-muted small d-flex align-items-center gap-2">
                    <i className="bi bi-clock-history text-info"></i> Time:
                  </span>
                  <strong className="text-light small font-monospace" style={{ letterSpacing: '0.5px' }}>
                    {formattedTime}
                  </strong>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 rounded-pill py-2 fw-semibold shadow-sm"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
              >
                <i className="bi bi-box-arrow-right fs-6"></i>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
