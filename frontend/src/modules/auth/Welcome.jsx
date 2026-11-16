import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Welcome.css';

const Welcome = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState('');
  const { demoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 3-Second Cinematic Intro Animation Timer
  useEffect(() => {
    if (!showIntro) return;

    // Start fade-out slightly before 3 seconds (at 2.6s) for smooth transition
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2600);

    // Fully hide intro and reveal login panel at 3.0s
    const endTimer = setTimeout(() => {
      setShowIntro(false);
      setIsFading(false);
    }, 3100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [showIntro]);

  const handleSkipIntro = () => {
    setIsFading(true);
    setTimeout(() => {
      setShowIntro(false);
      setIsFading(false);
    }, 250);
  };

  const handleReplayIntro = () => {
    setIsFading(false);
    setShowIntro(true);
  };

  const handleDemoLogin = async () => {
    setDemoError('');
    setDemoLoading(true);
    try {
      await demoLogin();
      navigate('/');
    } catch (err) {
      setDemoError(err.response?.data?.message || 'Demo login failed. Please ensure the backend is running.');
      setDemoLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="finapp-welcome-stage">
      {/* =========================================================
          1. COOL FINAPP INTRO ANIMATION (Active for 3 seconds)
          ========================================================= */}
      {showIntro && (
        <div className={`finapp-intro-container ${isFading ? 'fade-out' : ''}`}>
          {/* Top Skip Button */}
          <button
            type="button"
            className="intro-skip-btn"
            onClick={handleSkipIntro}
            title="Skip directly to Login Panel"
          >
            Skip Intro <i className="bi bi-chevron-right ms-1"></i>
          </button>

          {/* 3D Visual Emblem with Orbital Rings */}
          <div className="intro-visual-core">
            <div className="intro-glow-disc"></div>
            <div className="intro-orbit-ring ring-outer"></div>
            <div className="intro-orbit-ring ring-inner"></div>

            {/* Orbiting Satellite Badges */}
            <div className="intro-satellite sat-1" title="Currency Pulse">
              <i className="bi bi-currency-rupee"></i>
            </div>
            <div className="intro-satellite sat-2" title="Growth Analytics">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <div className="intro-satellite sat-3" title="Budget Guard">
              <i className="bi bi-shield-check"></i>
            </div>

            {/* Core Emblem */}
            <div className="intro-emblem">
              <span>💰</span>
            </div>
          </div>

          {/* Brand Title with Specular Shimmer */}
          <h1 className="intro-brand-title">FINAPP</h1>

          {/* Dynamic Tagline */}
          <div className="intro-brand-tagline">
            <span className="pulse-dot"></span>
            <span>Intelligent Wealth & Expense Engine</span>
          </div>

          {/* Soundwave/Pulse Visualizer */}
          <div className="intro-wave-bar">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* 3-Second Countdown Progress Indicator */}
          <div className="intro-progress-panel">
            <div className="intro-progress-bar-bg">
              <div className="intro-progress-bar-fill"></div>
            </div>
            <span className="intro-countdown-text">Launching FinApp Portal • 3s</span>
          </div>
        </div>
      )}

      {/* =========================================================
          2. WELCOME & LOGIN PANEL (Revealed after Intro)
          ========================================================= */}
      {!showIntro && (
        <div className="welcome-portal-card">
          {/* Header */}
          <div className="portal-header">
            <div className="portal-brand-badge">
              <i className="bi bi-stars"></i> Personal Finance Platform
            </div>
            <h2 className="portal-title">Welcome to FinApp</h2>
            <p className="portal-subtitle">
              Master your daily spending, automate recurring bills, and build lasting financial freedom.
            </p>
          </div>

          {/* About FinApp Section */}
          <div className="about-finapp-section">
            <p className="about-lead-text">
              <strong>About FinApp:</strong> FinApp is an all-in-one personal finance hub engineered
              to give you absolute visibility and control over your money. Designed for rapid 5-second
              logging, proactive budget alerts, and instant visual statements.
            </p>

            {/* 4 Feature Highlights Grid */}
            <div className="features-grid">
              <div className="feature-pill">
                <div className="feature-icon-box purple">
                  <i className="bi bi-lightning-charge-fill"></i>
                </div>
                <div>
                  <div className="feature-title">5-Second Expense Add</div>
                  <div className="feature-desc">Quickly record transactions with receipt photos & tags.</div>
                </div>
              </div>

              <div className="feature-pill">
                <div className="feature-icon-box emerald">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <div>
                  <div className="feature-title">Proactive Budget Guard</div>
                  <div className="feature-desc">Category limit warnings before you overspend.</div>
                </div>
              </div>

              <div className="feature-pill">
                <div className="feature-icon-box cyan">
                  <i className="bi bi-arrow-repeat"></i>
                </div>
                <div>
                  <div className="feature-title">Automated Subscriptions</div>
                  <div className="feature-desc">Daily background cron scheduler for recurring bills.</div>
                </div>
              </div>

              <div className="feature-pill">
                <div className="feature-icon-box amber">
                  <i className="bi bi-pie-chart-fill"></i>
                </div>
                <div>
                  <div className="feature-title">Visual Reports & PDF</div>
                  <div className="feature-desc">6-month trends and 1-click PDF/CSV monthly statements.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Error Alert */}
          {demoError && (
            <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <div>{demoError}</div>
            </div>
          )}

          {/* The 2 Primary Action Options */}
          <div className="portal-actions-group">
            {/* Option 1: Click to Login */}
            <button
              type="button"
              className="btn-portal-login"
              onClick={handleGoToLogin}
            >
              <div className="btn-label-wrap">
                <span className="main-label">
                  <i className="bi bi-box-arrow-in-right"></i> Click to Login
                </span>
                <span className="sub-label">Sign in to your registered account</span>
              </div>
              <div className="btn-arrow-badge">
                <i className="bi bi-arrow-right"></i>
              </div>
            </button>

            {/* Option 2: Continue as a Demo Account */}
            <button
              type="button"
              className="btn-portal-demo"
              onClick={handleDemoLogin}
              disabled={demoLoading}
            >
              <div className="btn-label-wrap">
                <span className="main-label">
                  <i className="bi bi-play-circle-fill"></i> Continue as a Demo Account
                </span>
                <span className="sub-label">Instant 1-click test drive with pre-seeded data</span>
              </div>
              <span className="btn-demo-badge">
                {demoLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Starting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lightning-fill me-1"></i> Instant Demo
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Footer Navigation Links */}
          <div className="portal-footer-links">
            <div>
              New here? <Link to="/register">Create an Account</Link>
            </div>
            <button
              type="button"
              className="replay-intro-btn"
              onClick={handleReplayIntro}
              title="Replay the 3-second FinApp animation"
            >
              <i className="bi bi-arrow-counterclockwise"></i> Replay Intro
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcome;
