import React, { createContext, useContext, useState, useEffect } from 'react';
import { SCENARIOS } from '../data/scenarios';

const ForecastingContext = createContext();

export function ForecastingProvider({ children }) {
  const [currentScenario, setCurrentScenario] = useState(SCENARIOS[0]); // Default to DDoS
  const [selectedHorizon, setSelectedHorizon] = useState('T + 15 min');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSimulating, setIsSimulating] = useState(true);
  const [liveTick, setLiveTick] = useState(0);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isMitigateModalOpen, setIsMitigateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [mitigationsApplied, setMitigationsApplied] = useState([]);
  const [isTechMode, setIsTechMode] = useState(false); // Default to Simple / Normal Language Mode
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'High Risk Attack Forecast Triggered',
      message: 'Multi-vector SYN Flood predicted to peak at T+15m with 96.4% confidence.',
      type: 'critical',
      timestamp: 'Just now'
    },
    {
      id: 2,
      title: 'New Flow Ingestion Pipeline Active',
      message: 'Ingesting 48,200 flows/sec from Edge Ingress 10.0.1.1.',
      type: 'info',
      timestamp: '2m ago'
    }
  ]);

  // Live simulation tick timer
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setLiveTick(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const changeScenario = (scenarioId) => {
    const found = SCENARIOS.find(s => s.id === scenarioId);
    if (found) {
      setCurrentScenario(found);
      setSelectedHorizon(found.horizon);
      addNotification(
        `Scenario Switched: ${found.shortName}`,
        `Loaded real-time predictive model profile for ${found.title}.`,
        found.severity.toLowerCase()
      );
    }
  };

  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 7)]);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const applyMitigation = (type, target) => {
    const newMitigation = {
      id: Date.now(),
      type,
      target,
      timestamp: new Date().toLocaleTimeString(),
      scenarioId: currentScenario.id
    };
    setMitigationsApplied(prev => [newMitigation, ...prev]);
    addNotification(
      'Automated Mitigation Deployed 🛡️',
      `Applied ${type} on target [${target}]. Forecasted risk curve descending.`,
      'safe'
    );
  };

  return (
    <ForecastingContext.Provider
      value={{
        scenarios: SCENARIOS,
        currentScenario,
        changeScenario,
        selectedHorizon,
        setSelectedHorizon,
        activeTab,
        setActiveTab,
        isSimulating,
        setIsSimulating,
        liveTick,
        notifications,
        addNotification,
        dismissNotification,
        isTourOpen,
        setIsTourOpen,
        isMitigateModalOpen,
        setIsMitigateModalOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        mitigationsApplied,
        applyMitigation,
        isTechMode,
        setIsTechMode
      }}
    >
      {children}
    </ForecastingContext.Provider>
  );
}

export function useForecasting() {
  const context = useContext(ForecastingContext);
  if (!context) {
    throw new Error('useForecasting must be used within a ForecastingProvider');
  }
  return context;
}
