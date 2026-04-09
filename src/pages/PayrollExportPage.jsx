import React from 'react';
import { useTranslation } from 'react-i18next';
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';
import { usePayroll } from '../hooks/usePayroll';
import PayrollExport from '../components/payroll/PayrollExport';

/**
 * Payroll Export page — /app/payroll/export
 * Wraps the existing PayrollExport component in the app shell.
 */
const PayrollExportPage = () => {
  const { employees } = useEmployees();
  const { shifts } = useShifts();
  const payrollData = usePayroll(employees, shifts);

  return (
    <div className="p-6">
      <PayrollExport payrollData={payrollData} employees={employees} />
    </div>
  );
};

export default PayrollExportPage;
