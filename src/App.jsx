import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SchedulerPage from './pages/SchedulerPage';
import EmployeesPage from './pages/EmployeesPage';
import PayrollPage from './pages/PayrollPage';
import PosListPage from './pages/PosListPage';
import PosDetailPage from './pages/PosDetailPage';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/scheduler" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scheduler" element={<SchedulerPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/pos" element={<PosListPage />} />
          <Route path="/pos/:id" element={<PosDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
