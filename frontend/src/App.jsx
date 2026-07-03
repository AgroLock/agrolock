import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';
import Layout from './components/Layout';
import SiteBackground from './components/SiteBackground';
import Home from './pages/Home';
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

export default function App() {
  return (
    <WalletProvider>
      <SiteBackground />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
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
      </BrowserRouter>
    </WalletProvider>
  );
}
