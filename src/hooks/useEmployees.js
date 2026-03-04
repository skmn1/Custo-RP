import { useState, useCallback, useMemo, useEffect } from 'react';
import { employeesApi } from '../api/employeesApi';
import { initialEmployees } from '../data/employees';

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPos, setFilterPos] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // ── Fetch employees from backend (falls back to static data) ──

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await employeesApi.list({
        search: searchTerm || undefined,
        posId: filterPos || undefined,
        role: filterRole || undefined,
        sort: sortBy,
        order: sortOrder,
      });
      setEmployees(data);
    } catch (err) {
      console.warn('Backend unavailable, using local data:', err.message);
      setEmployees(initialEmployees);
      setError(null); // suppress — fallback is silent
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterPos, filterRole, sortBy, sortOrder]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ── CRUD Operations ──

  const addEmployee = useCallback(async (employeeData) => {
    try {
      const created = await employeesApi.create(employeeData);
      setEmployees(prev => [...prev, created]);
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateEmployee = useCallback(async (employeeId, updates) => {
    try {
      const updated = await employeesApi.update(employeeId, updates);
      setEmployees(prev =>
        prev.map(emp => (emp.id === employeeId ? updated : emp))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteEmployee = useCallback(async (employeeId) => {
    try {
      await employeesApi.delete(employeeId);
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getEmployee = useCallback(
    (employeeId) => employees.find(emp => emp.id === employeeId),
    [employees],
  );

  // ── Derived data (computed client-side from fetched list) ──

  const roles = useMemo(
    () => [...new Set(employees.map(emp => emp.role))].filter(Boolean).sort(),
    [employees],
  );

  const stats = useMemo(() => ({
    totalEmployees: employees.length,
    totalPosLocations: new Set(employees.map(e => e.posId).filter(Boolean)).size,
    totalRoles: new Set(employees.map(e => e.role).filter(Boolean)).size,
    averageMaxHours:
      employees.length > 0
        ? employees.reduce((sum, emp) => sum + (emp.maxHours || 0), 0) / employees.length
        : 0,
  }), [employees]);

  return {
    // Data
    employees,          // already filtered/sorted from API
    allEmployees: employees,
    roles,
    stats,
    isLoading,
    error,

    // CRUD operations
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee,
    refetch: fetchEmployees,

    // Filtering and searching
    searchTerm,
    setSearchTerm,
    filterPos,
    setFilterPos,
    filterRole,
    setFilterRole,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
};
