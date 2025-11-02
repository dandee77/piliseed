import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HomePage } from './pages/HomePage';
import { GreenhouseDetail } from './pages/GreenhouseDetail';
import { ExpandableNavBar } from './components/ExpandableNavBar';
function AnimatedRoutes() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const isDetailPage = location.pathname.includes('/greenhouse/');

  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('home');
    }
  }, [location.pathname]);
  return <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/greenhouse/:id" element={<GreenhouseDetail />} />
        </Routes>
      </AnimatePresence>
      {/* Navigation Bar - Outside page transitions */}
      <ExpandableNavBar activeTab={activeTab} setActiveTab={setActiveTab} isExpanded={isDetailPage} />
    </>;
}
export function App() {
  return <BrowserRouter>
      <div className="w-full min-h-screen bg-gray-50" style={{
      maxWidth: '430px',
      margin: '0 auto'
    }}>
        <AnimatedRoutes />
      </div>
    </BrowserRouter>;
}