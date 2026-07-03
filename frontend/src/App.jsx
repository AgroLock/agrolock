import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';
import Layout from './components/Layout';
import SiteBackground from './components/SiteBackground';
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Technology from './pages/Technology';
import Roadmap from './pages/Roadmap';
import Dashboard from './pages/Dashboard';
import CreateDeal from './pages/CreateDeal';
import DealDetail from './pages/DealDetail';

function Gate({ children }) {
  const { address, checkingSession } = useWallet();
  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;
  }
  if (!address) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <WalletProvider>
      <SiteBackground />
      {/* HashRouter: GitHub Pages has no server-side rewrites, so deep
          links / refreshes on a sub-route would 404 with BrowserRouter. */}
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/technology" element={<Technology />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route
            path="/dashboard"
            element={
              <Gate>
                <Dashboard />
              </Gate>
            }
          />
          <Route
            path="/deals/new"
            element={
              <Gate>
                <CreateDeal />
              </Gate>
            }
          />
          <Route
            path="/deals/:id"
            element={
              <Gate>
                <DealDetail />
              </Gate>
            }
          />
        </Routes>
      </HashRouter>
    </WalletProvider>
  );
}
