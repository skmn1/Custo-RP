import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { usePosTerminal } from '../../hooks/usePosTerminal';

/**
 * Guards a terminal-scoped route.
 * Redirects to /app/pos if the user has no access to the terminal.
 */
const TerminalGuard = ({ children }) => {
  const { terminalId } = useParams();
  const { hasAccess, isLoading } = usePosTerminal();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!hasAccess(terminalId)) {
    return <Navigate to="/app/pos" replace />;
  }

  return children;
};

export default TerminalGuard;
