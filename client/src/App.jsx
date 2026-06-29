import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Segments from './pages/Segments';
import SalesDashboard from './pages/SalesDashboard';
import BusinessAnalytics from './pages/BusinessAnalytics';
import FinancialManagement from './pages/FinancialManagement';
import AlertsInsights from './pages/AlertsInsights';

function App() {
  const [user, setUser] = useState(null);
  const [lastRoute, setLastRoute] = useState('/');

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const storedRoute = sessionStorage.getItem('lastRoute');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        if (storedRoute) {
          setLastRoute(storedRoute);
        }
      } catch (e) {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('lastRoute');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', userData.token);
    // Set default route based on role
    const defaultRoute = userData.role === 'sales_staff' ? '/sales' : '/';
    setLastRoute(defaultRoute);
    sessionStorage.setItem('lastRoute', defaultRoute);
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('lastRoute');
    setLastRoute('/');
  };

  const handleRouteChange = (route) => {
    setLastRoute(route);
    sessionStorage.setItem('lastRoute', route);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={lastRoute} />} />
        <Route path="/" element={user ? <Layout user={user} onLogout={handleLogout} onRouteChange={handleRouteChange} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard user={user} />} />
          <Route path="segments" element={<Segments user={user} />} />
          <Route path="sales" element={<SalesDashboard user={user} />} />
          <Route path="analytics" element={<BusinessAnalytics user={user} />} />
          <Route path="financial" element={<FinancialManagement user={user} />} />
          <Route path="alerts" element={<AlertsInsights user={user} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
