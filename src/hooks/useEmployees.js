import { useState, useCallback, useMemo } from 'react';
import { initialEmployees } from '../data/employees';

const generateEmployeeId = () => {
  return `emp${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const generateAvatar = (name) => {
  const names = name.split(' ');
  return names.map(n => n.charAt(0)).join('').toUpperCase();
};

const getRandomColor = () => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-yellow-500',
    'bg-teal-500', 'bg-cyan-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const useEmployees = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // CRUD Operations
  const addEmployee = useCallback((employeeData) => {
    const newEmployee = {
      id: generateEmployeeId(),
      avatar: generateAvatar(employeeData.name),
      color: getRandomColor(),
      ...employeeData,
    };
    setEmployees(prev => [...prev, newEmployee]);
    return newEmployee;
  }, []);

  const updateEmployee = useCallback((employeeId, updates) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employeeId 
          ? { 
              ...emp, 
              ...updates,
              avatar: updates.name ? generateAvatar(updates.name) : emp.avatar
            }
          : emp
      )
    );
  }, []);

  const deleteEmployee = useCallback((employeeId) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  }, []);

  const getEmployee = useCallback((employeeId) => {
    return employees.find(emp => emp.id === employeeId);
  }, [employees]);

  // Filtering and searching
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (filterDepartment) {
      filtered = filtered.filter(emp => emp.department === filterDepartment);
    }

    // Role filter
    if (filterRole) {
      filtered = filtered.filter(emp => emp.role === filterRole);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [employees, searchTerm, filterDepartment, filterRole, sortBy, sortOrder]);

  // Get unique departments and roles for filters
  const departments = useMemo(() => {
    return [...new Set(employees.map(emp => emp.department))].sort();
  }, [employees]);

  const roles = useMemo(() => {
    return [...new Set(employees.map(emp => emp.role))].sort();
  }, [employees]);

  // Statistics
  const stats = useMemo(() => {
    return {
      totalEmployees: employees.length,
      totalDepartments: departments.length,
      averageMaxHours: employees.reduce((sum, emp) => sum + emp.maxHours, 0) / employees.length,
      departmentCounts: departments.reduce((acc, dept) => {
        acc[dept] = employees.filter(emp => emp.department === dept).length;
        return acc;
      }, {}),
    };
  }, [employees, departments]);

  return {
    // Data
    employees: filteredEmployees,
    allEmployees: employees,
    departments,
    roles,
    stats,
    
    // CRUD operations
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee,
    
    // Filtering and searching
    searchTerm,
    setSearchTerm,
    filterDepartment,
    setFilterDepartment,
    filterRole,
    setFilterRole,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
};
