import React, { createContext, useContext, useState, useCallback } from 'react';

const BreadcrumbContext = createContext(null);

export function BreadcrumbProvider({ children }) {
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const setBreadcrumb = useCallback((items) => {
    setBreadcrumbs(Array.isArray(items) ? items : []);
  }, []);

  const clearBreadcrumb = useCallback(() => {
    setBreadcrumbs([]);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumb, clearBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

/**
 * Hook for pages to set the breadcrumb displayed in the GlobalTopBar.
 * Call setBreadcrumb([{ label: '...', to: '/...' }]) on mount.
 * Items: array of { label: string, to?: string }.
 * Last item has no `to` (current page).
 */
export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}
