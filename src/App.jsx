import React, { useState } from 'react';
import { ForecastingProvider, useForecasting } from './context/ForecastingContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import JudgeTourModal from './components/layout/JudgeTourModal';
import MitigationModal from './components/common/MitigationModal';
import ExportReportModal from './components/common/ExportReportModal';

import DashboardPage from './pages/DashboardPage';
import TrafficAnalysisPage from './pages/TrafficAnalysisPage';
import AttackForecastPage from './pages/AttackForecastPage';
import ExplainabilityPage from './pages/ExplainabilityPage';
import PredictionHistoryPage from './pages/PredictionHistoryPage';
import DemoUploadPage from './pages/DemoUploadPage';

function MainAppLayout() {
  const { activeTab } = useForecasting();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'traffic':
        return <TrafficAnalysisPage />;
      case 'forecast':
        return <AttackForecastPage />;
      case 'explainability':
        return <ExplainabilityPage />;
      case 'history':
        return <PredictionHistoryPage />;
      case 'upload':
        return <DemoUploadPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] cyber-grid text-slate-100 flex flex-col font-sans">
      {/* Top Status & Navigation Bar */}
      <Header />

      <div className="flex flex-1 relative">
        {/* Collapsible Left SOC Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Main Dashboard Canvas Area */}
        <main
          className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 min-w-0 ${
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <JudgeTourModal />
      <MitigationModal />
      <ExportReportModal />
    </div>
  );
}

export default function App() {
  return (
    <ForecastingProvider>
      <MainAppLayout />
    </ForecastingProvider>
  );
}
