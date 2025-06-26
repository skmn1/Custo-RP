import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SchedulerPage from './pages/SchedulerPage';

const App = () => {
  const [currentView, setCurrentView] = useState('scheduler');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'scheduler':
        return <SchedulerPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      {renderCurrentView()}
    </div>
  );
};

export default App;
