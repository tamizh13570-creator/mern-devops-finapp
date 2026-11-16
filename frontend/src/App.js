import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LockScreen from './components/LockScreen';
import DemoBanner from './components/DemoBanner';
import ExpenseModal from './modules/expenses/ExpenseModal';

// Auth Pages
import Welcome from './modules/auth/Welcome';
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';
import VerifyOTP from './modules/auth/VerifyOTP';

// App Modules
import Dashboard from './modules/dashboard/Dashboard';
import ExpenseList from './modules/expenses/ExpenseList';
import IncomeList from './modules/income/IncomeList';
import BudgetList from './modules/budgets/BudgetList';
import CategoryList from './modules/categories/CategoryList';
import RecurringList from './modules/recurring/RecurringList';
import Reports from './modules/reports/Reports';
import Settings from './modules/settings/Settings';

const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading, isLocked } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100" style={{ background: 'transparent' }}>
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} role="status"></div>
        <div className="text-muted small fw-medium">Loading FinApp...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  if (isLocked) {
    return <LockScreen />;
  }

  const handleQuickAddSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar showMobile={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      {/* Main Content */}
      <div className="main-wrapper">
        <DemoBanner />
        <Navbar
          onToggleMobile={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
        />

        <main className="page-content" key={refreshKey}>
          {React.cloneElement(children, { onOpenQuickAdd: () => setQuickAddOpen(true) })}
        </main>
      </div>

      {/* Floating Action Button (FAB) for fast expense entry in under 5 seconds */}
      <button
        className="fab-quick-add"
        title="Quick Add Expense (<5 seconds)"
        onClick={() => setQuickAddOpen(true)}
      >
        <i className="bi bi-plus-lg"></i>
      </button>

      {/* Quick Add Expense Modal */}
      <ExpenseModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={handleQuickAddSuccess}
      />
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100" style={{ background: 'transparent' }}>
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} role="status"></div>
        <div className="text-muted small fw-medium">Loading FinApp...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing Portal with 3-Second Cool Intro & Login Panel */}
      <Route
        path="/welcome"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Welcome />}
      />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="/verify-otp"
        element={isAuthenticated ? <Navigate to="/" replace /> : <VerifyOTP />}
      />

      {/* Main Home Route: Dashboard if logged in, else Welcome */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          ) : (
            <Welcome />
          )
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedLayout>
            <ExpenseList />
          </ProtectedLayout>
        }
      />
      <Route
        path="/income"
        element={
          <ProtectedLayout>
            <IncomeList />
          </ProtectedLayout>
        }
      />
      <Route
        path="/budgets"
        element={
          <ProtectedLayout>
            <BudgetList />
          </ProtectedLayout>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedLayout>
            <CategoryList />
          </ProtectedLayout>
        }
      />
      <Route
        path="/recurring"
        element={
          <ProtectedLayout>
            <RecurringList />
          </ProtectedLayout>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedLayout>
            <Reports />
          </ProtectedLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <Settings />
          </ProtectedLayout>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="ambient-background" aria-hidden="true">
          <div className="ambient-orb orb-1"></div>
          <div className="ambient-orb orb-2"></div>
          <div className="ambient-orb orb-3"></div>
          <div className="ambient-orb orb-4"></div>
        </div>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
