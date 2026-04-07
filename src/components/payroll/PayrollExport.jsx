import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useLocaleDateFns } from '../../utils/formatLocale';
import Button from '../ui/Button';

const PayrollExport = ({ payrollData, employees }) => {
  const { t } = useTranslation(['payroll']);
  const { formatDate } = useLocaleDateFns();
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportType, setExportType] = useState('summary');
  const [isExporting, setIsExporting] = useState(false);

  const { selectedPayPeriod, employeePayrolls, payrollStats } = payrollData;

  const exportOptions = [
    { id: 'summary', label: t('payroll:export.options.summary'), description: t('payroll:export.options.summaryDesc') },
    { id: 'detailed', label: t('payroll:export.options.detailed'), description: t('payroll:export.options.detailedDesc') },
    { id: 'accounting', label: t('payroll:export.options.accounting'), description: t('payroll:export.options.accountingDesc') },
    { id: 'paystubs', label: t('payroll:export.options.paystubs'), description: t('payroll:export.options.paystubsDesc') },
    { id: 'taxes', label: t('payroll:export.options.taxes'), description: t('payroll:export.options.taxesDesc') },
    { id: 'timesheets', label: t('payroll:export.options.timesheets'), description: t('payroll:export.options.timesheetsDesc') }
  ];

  const formatOptions = [
    { id: 'csv', label: t('payroll:export.formats.csv'), description: t('payroll:export.formats.csvDesc') },
    { id: 'excel', label: t('payroll:export.formats.excel'), description: t('payroll:export.formats.excelDesc') },
    { id: 'pdf', label: t('payroll:export.formats.pdf'), description: t('payroll:export.formats.pdfDesc') },
    { id: 'json', label: t('payroll:export.formats.json'), description: t('payroll:export.formats.jsonDesc') }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate export data based on type
      let exportData;
      let filename;
      
      switch (exportType) {
        case 'summary':
          exportData = generateSummaryData();
          filename = `payroll-summary-${format(selectedPayPeriod.start, 'yyyy-MM-dd')}`;
          break;
        case 'detailed':
          exportData = generateDetailedData();
          filename = `payroll-detailed-${format(selectedPayPeriod.start, 'yyyy-MM-dd')}`;
          break;
        case 'accounting':
          exportData = generateAccountingData();
          filename = `payroll-accounting-${format(selectedPayPeriod.start, 'yyyy-MM-dd')}`;
          break;
        case 'paystubs':
          exportData = generatePayStubsData();
          filename = `paystubs-${format(selectedPayPeriod.start, 'yyyy-MM-dd')}`;
          break;
        case 'taxes':
          exportData = generateTaxData();
          filename = `payroll-taxes-${format(selectedPayPeriod.start, 'yyyy-MM-dd')}`;
          break;
        case 'timesheets':
          exportData = generateTimesheetData();
          filename = `timesheets-${format(selectedPayPeriod.start, 'yyyy-MM-dd')}`;
          break;
        default:
          exportData = generateSummaryData();
          filename = `payroll-export-${format(selectedPayPeriod.start, 'yyyy-MM-dd')}`;
      }

      // Download the file
      downloadFile(exportData, filename, exportFormat);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert(t('payroll:export.exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  const generateSummaryData = () => {
    if (exportFormat === 'json') {
      return JSON.stringify({
        payPeriod: {
          start: selectedPayPeriod.start,
          end: selectedPayPeriod.end
        },
        summary: payrollStats,
        employeeCount: employeePayrolls.length
      }, null, 2);
    }

    // CSV format
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Pay Period Start', format(selectedPayPeriod.start, 'yyyy-MM-dd')],
      ['Pay Period End', format(selectedPayPeriod.end, 'yyyy-MM-dd')],
      ['Total Employees', payrollStats.totalEmployees],
      ['Total Hours', payrollStats.totalHours.toFixed(2)],
      ['Total Overtime Hours', payrollStats.totalOvertimeHours.toFixed(2)],
      ['Total Gross Pay', payrollStats.totalGrossPay.toFixed(2)],
      ['Total Net Pay', payrollStats.totalNetPay.toFixed(2)],
      ['Total Taxes', payrollStats.totalTaxes.toFixed(2)],
      ['Average Hourly Rate', payrollStats.avgHourlyRate.toFixed(2)]
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateDetailedData = () => {
    if (exportFormat === 'json') {
      return JSON.stringify({
        payPeriod: {
          start: selectedPayPeriod.start,
          end: selectedPayPeriod.end
        },
        employees: employeePayrolls
      }, null, 2);
    }

    // CSV format
    const headers = [
      'Employee ID', 'Name', 'Role', 'Department', 'Regular Hours', 'Overtime Hours',
      'Double Time Hours', 'Total Hours', 'Hourly Rate', 'Gross Pay', 'Federal Tax',
      'State Tax', 'Social Security', 'Medicare', 'Total Deductions', 'Net Pay'
    ];

    const rows = employeePayrolls.map(emp => [
      emp.id,
      emp.name,
      emp.role,
      emp.department,
      emp.regularHours.toFixed(2),
      emp.overtimeHours.toFixed(2),
      emp.doubleTimeHours.toFixed(2),
      emp.totalHours.toFixed(2),
      emp.hourlyRate.toFixed(2),
      emp.grossPay.toFixed(2),
      emp.taxes.federal.toFixed(2),
      emp.taxes.state.toFixed(2),
      emp.taxes.socialSecurity.toFixed(2),
      emp.taxes.medicare.toFixed(2),
      (emp.grossPay - emp.netPay).toFixed(2),
      emp.netPay.toFixed(2)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateAccountingData = () => {
    const entries = [
      ['Account', 'Type', 'Amount', 'Description'],
      ['Salaries and Wages Expense', 'Debit', payrollStats.totalGrossPay.toFixed(2), 'Employee gross wages'],
      ['Payroll Tax Expense', 'Debit', payrollStats.totalEmployerTaxes.toFixed(2), 'Employer payroll taxes'],
      ['Federal Income Tax Payable', 'Credit', payrollStats.totalFederalTax.toFixed(2), 'Federal tax withheld'],
      ['State Income Tax Payable', 'Credit', payrollStats.totalStateTax.toFixed(2), 'State tax withheld'],
      ['Wages Payable', 'Credit', payrollStats.totalNetPay.toFixed(2), 'Net wages payable']
    ];

    return entries.map(row => row.join(',')).join('\n');
  };

  const generatePayStubsData = () => {
    return JSON.stringify({
      payPeriod: {
        start: selectedPayPeriod.start,
        end: selectedPayPeriod.end
      },
      payStubs: employeePayrolls.map(emp => ({
        employeeId: emp.id,
        name: emp.name,
        payPeriod: `${format(selectedPayPeriod.start, 'MM/dd/yyyy')} - ${format(selectedPayPeriod.end, 'MM/dd/yyyy')}`,
        earnings: {
          regularHours: emp.regularHours,
          overtimeHours: emp.overtimeHours,
          hourlyRate: emp.hourlyRate,
          grossPay: emp.grossPay
        },
        deductions: {
          federalTax: emp.taxes.federal,
          stateTax: emp.taxes.state,
          socialSecurity: emp.taxes.socialSecurity,
          medicare: emp.taxes.medicare,
          totalDeductions: emp.grossPay - emp.netPay
        },
        netPay: emp.netPay
      }))
    }, null, 2);
  };

  const generateTaxData = () => {
    const headers = ['Employee ID', 'Name', 'Federal Tax', 'State Tax', 'Social Security', 'Medicare', 'Total Witheld'];
    const rows = employeePayrolls.map(emp => [
      emp.id,
      emp.name,
      emp.taxes.federal.toFixed(2),
      emp.taxes.state.toFixed(2),
      emp.taxes.socialSecurity.toFixed(2),
      emp.taxes.medicare.toFixed(2),
      (emp.taxes.federal + emp.taxes.state + emp.taxes.socialSecurity + emp.taxes.medicare).toFixed(2)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateTimesheetData = () => {
    const headers = ['Employee ID', 'Name', 'Date', 'Start Time', 'End Time', 'Hours', 'Shift Type'];
    const rows = [];

    employeePayrolls.forEach(emp => {
      if (emp.shifts) {
        emp.shifts.forEach(shift => {
          rows.push([
            emp.id,
            emp.name,
            shift.date,
            shift.startTime,
            shift.endTime,
            shift.duration.toFixed(2),
            shift.type || 'Regular'
          ]);
        });
      }
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadFile = (data, filename, format) => {
    let mimeType;
    let fileExtension;

    switch (format) {
      case 'csv':
        mimeType = 'text/csv';
        fileExtension = 'csv';
        break;
      case 'json':
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
      case 'excel':
        mimeType = 'application/vnd.ms-excel';
        fileExtension = 'xls';
        break;
      case 'pdf':
        mimeType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      default:
        mimeType = 'text/plain';
        fileExtension = 'txt';
    }

    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('payroll:export.title')}</h2>
        <p className="text-gray-600">{t('payroll:export.subtitle')}</p>
      </div>

      {/* Export Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Type Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span>
            {t('payroll:export.reportType')}
          </h3>
          <div className="space-y-3">
            {exportOptions.map((option) => (
              <label key={option.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportType"
                  value={option.id}
                  checked={exportType === option.id}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📄</span>
            {t('payroll:export.exportFormat')}
          </h3>
          <div className="space-y-3">
            {formatOptions.map((format) => (
              <label key={format.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value={format.id}
                  checked={exportFormat === format.id}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">{format.label}</div>
                  <div className="text-sm text-gray-600">{format.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Export Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">👀</span>
          {t('payroll:export.preview')}
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t('payroll:export.previewType')}</span>
              <div className="font-medium">{exportOptions.find(opt => opt.id === exportType)?.label}</div>
            </div>
            <div>
              <span className="text-gray-600">{t('payroll:export.previewFormat')}</span>
              <div className="font-medium">{formatOptions.find(fmt => fmt.id === exportFormat)?.label}</div>
            </div>
            <div>
              <span className="text-gray-600">{t('payroll:export.previewPeriod')}</span>
              <div className="font-medium">
                {formatDate(selectedPayPeriod.start, 'MMM dd')} - {formatDate(selectedPayPeriod.end, 'MMM dd, yyyy')}
              </div>
            </div>
            <div>
              <span className="text-gray-600">{t('payroll:export.previewEmployees')}</span>
              <div className="font-medium">{employeePayrolls.length}</div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full md:w-auto"
        >
          {isExporting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('payroll:export.generating')}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>📥</span>
              {t('payroll:export.generate')}
            </div>
          )}
        </Button>
      </div>

      {/* Quick Reports */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">⚡</span>
          {t('payroll:export.quickReports')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setExportType('summary');
              setExportFormat('pdf');
              handleExport();
            }}
            className="flex items-center gap-2 h-auto py-4"
          >
            <div className="text-left">
              <div className="font-medium">{t('payroll:export.executiveSummary')}</div>
              <div className="text-sm text-gray-600">{t('payroll:export.executiveSummaryDesc')}</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setExportType('detailed');
              setExportFormat('excel');
              handleExport();
            }}
            className="flex items-center gap-2 h-auto py-4"
          >
            <div className="text-left">
              <div className="font-medium">{t('payroll:export.hrSpreadsheet')}</div>
              <div className="text-sm text-gray-600">{t('payroll:export.hrSpreadsheetDesc')}</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setExportType('accounting');
              setExportFormat('csv');
              handleExport();
            }}
            className="flex items-center gap-2 h-auto py-4"
          >
            <div className="text-left">
              <div className="font-medium">{t('payroll:export.accountingCsv')}</div>
              <div className="text-sm text-gray-600">{t('payroll:export.accountingCsvDesc')}</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Historical Reports */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          {t('payroll:export.reportAnalytics')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{employeePayrolls.length}</div>
            <div className="text-sm text-gray-600">{t('payroll:export.employeesInReport')}</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">${payrollStats.totalGrossPay.toFixed(0)}</div>
            <div className="text-sm text-gray-600">{t('payroll:export.totalGrossPay')}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{payrollStats.totalHours.toFixed(0)}</div>
            <div className="text-sm text-gray-600">{t('payroll:export.totalHoursWorked')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollExport;
