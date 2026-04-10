import React from 'react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import OfflineDisabled from './OfflineDisabled';

/* ─── Styles ──────────────────────────────────────────────── */

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1f2937' },
  header: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#6b7280' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 10 },
  summaryBox: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 4, padding: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  summaryLabel: { fontSize: 8, color: '#6b7280', textTransform: 'uppercase', marginBottom: 2 },
  summaryValue: { fontSize: 14, fontWeight: 'bold' },
  netValue: { fontSize: 14, fontWeight: 'bold', color: '#4f46e5' },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#374151', marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 4 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  lineLabel: { color: '#4b5563' },
  lineAmount: { fontWeight: 'bold' },
  deductionAmount: { fontWeight: 'bold', color: '#dc2626' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#d1d5db', marginTop: 4, paddingTop: 4 },
  totalLabel: { fontWeight: 'bold' },
  totalAmount: { fontWeight: 'bold' },
  footer: { marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', fontSize: 9, color: '#9ca3af' },
});

function fmtCurrency(amount, currency = 'USD') {
  if (amount == null) return '—';
  return `$${Number(amount).toFixed(2)}`;
}

/* ─── PDF Document ────────────────────────────────────────── */

function PayslipDocument({ detail }) {
  const lines = detail.lines || { earnings: [], deductions: [] };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>{detail.periodLabel}</Text>
          <Text style={s.subtitle}>
            {detail.periodStart} — {detail.periodEnd} {detail.employeeName ? `• ${detail.employeeName}` : ''}
          </Text>
        </View>

        {/* Summary boxes */}
        <View style={s.summaryRow}>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Worked Hours</Text>
            <Text style={s.summaryValue}>{detail.workedHours != null ? `${detail.workedHours}h` : '—'}</Text>
          </View>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Gross Pay</Text>
            <Text style={s.summaryValue}>{fmtCurrency(detail.grossPay, detail.currency)}</Text>
          </View>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Total Deductions</Text>
            <Text style={[s.summaryValue, { color: '#dc2626' }]}>−{fmtCurrency(detail.totalDeductions, detail.currency)}</Text>
          </View>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Net Pay</Text>
            <Text style={s.netValue}>{fmtCurrency(detail.netPay, detail.currency)}</Text>
          </View>
        </View>

        {/* Earnings */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Earnings</Text>
          {(lines.earnings || []).map((line, i) => (
            <View key={i} style={s.lineRow}>
              <Text style={s.lineLabel}>{line.label}</Text>
              <Text style={s.lineAmount}>{fmtCurrency(line.amount, detail.currency)}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total Earnings</Text>
            <Text style={s.totalAmount}>{fmtCurrency(detail.grossPay, detail.currency)}</Text>
          </View>
        </View>

        {/* Deductions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Deductions</Text>
          {(lines.deductions || []).map((line, i) => (
            <View key={i} style={s.lineRow}>
              <Text style={s.lineLabel}>{line.label}</Text>
              <Text style={s.deductionAmount}>−{fmtCurrency(Math.abs(line.amount), detail.currency)}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total Deductions</Text>
            <Text style={[s.totalAmount, { color: '#dc2626' }]}>−{fmtCurrency(detail.totalDeductions, detail.currency)}</Text>
          </View>
        </View>

        {/* Employer contributions */}
        {detail.employerContributions != null && (
          <View style={s.section}>
            <View style={s.lineRow}>
              <Text style={s.lineLabel}>Employer Contributions</Text>
              <Text style={s.lineAmount}>{fmtCurrency(detail.employerContributions, detail.currency)}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          {detail.paidAt && <Text>Paid: {new Date(detail.paidAt).toLocaleDateString()}</Text>}
          {detail.paymentMethod && <Text>Method: {detail.paymentMethod.replace('_', ' ')}</Text>}
          <Text>Generated {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
}

/* ─── Download button ─────────────────────────────────────── */

export default function PayslipPdf({ detail, t: tProp }) {
  const { t: tHook } = useTranslation('ess');
  const t = tProp ?? tHook;
  const [generating, setGenerating] = React.useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const blob = await pdf(<PayslipDocument detail={detail} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${detail.periodLabel?.replace(/\s+/g, '-') || detail.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <OfflineDisabled fallbackTooltip={t('pwa.offline.downloadDisabled', 'Download is unavailable offline')}>
      <button
        onClick={handleDownload}
        disabled={generating}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        {generating ? '…' : t('payslips.download')}
      </button>
    </OfflineDisabled>
  );
}
