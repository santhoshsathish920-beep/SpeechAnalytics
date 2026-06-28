import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';

// Layout wrapper for dashboard pages that require the Sidebar and Navbar
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 transition-colors duration-300">
      {/* Sidebar for desktop navigation */}
      <Sidebar />
      
      {/* Top Navbar */}
      <Navbar />
      
      {/* Main page content area */}
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Landing Page is outside the dashboard shell layout for a cleaner look */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Dashboard and History pages run inside the Sidebar + Navbar shell */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
