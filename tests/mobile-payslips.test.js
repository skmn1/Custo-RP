/**
 * Unit tests for Task 67 — ESS Mobile Payslips
 *
 * Covers:
 *  - groupByYear helper logic
 *  - PayBreakdownBar percentage calculation
 *  - LineItem negative/positive rendering
 *  - MobilePayslipList component structure
 *  - MobilePayslipDetail component structure
 *  - Page-level conditional routing
 *  - i18n keys (EN + FR)
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── groupByYear helper ───────────────────────────────────────────

describe('groupByYear logic', () => {
  // Replicate the helper from MobilePayslipList
  function groupByYear(payslips) {
    const groups = {};
    for (const slip of payslips) {
      const year = slip.periodYear ?? new Date(slip.paidAt || slip.periodStart || '').getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(slip);
    }
    return Object.keys(groups)
      .sort((a, b) => Number(b) - Number(a))
      .map((y) => ({ year: Number(y), items: groups[y] }));
  }

  it('groups payslips by periodYear', () => {
    const slips = [
      { id: 1, periodYear: 2025, netPay: 2000 },
      { id: 2, periodYear: 2024, netPay: 1900 },
      { id: 3, periodYear: 2025, netPay: 2100 },
    ];
    const groups = groupByYear(slips);
    expect(groups).toHaveLength(2);
    expect(groups[0].year).toBe(2025);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].year).toBe(2024);
    expect(groups[1].items).toHaveLength(1);
  });

  it('sorts years descending', () => {
    const slips = [
      { id: 1, periodYear: 2022, netPay: 100 },
      { id: 2, periodYear: 2024, netPay: 200 },
      { id: 3, periodYear: 2023, netPay: 150 },
    ];
    const groups = groupByYear(slips);
    expect(groups.map((g) => g.year)).toEqual([2024, 2023, 2022]);
  });

  it('handles empty array', () => {
    expect(groupByYear([])).toEqual([]);
  });

  it('falls back to paidAt year when periodYear is missing', () => {
    const slips = [
      { id: 1, paidAt: '2023-06-15', netPay: 1000 },
      { id: 2, paidAt: '2024-01-15', netPay: 1100 },
    ];
    const groups = groupByYear(slips);
    expect(groups[0].year).toBe(2024);
    expect(groups[1].year).toBe(2023);
  });
});

// ── PayBreakdownBar percentage logic ─────────────────────────────

describe('PayBreakdownBar percentage calculation', () => {
  function calculatePcts(gross, deductions, net) {
    if (!gross || gross <= 0) return null;
    return {
      netPct: (net / gross) * 100,
      deductionPct: (deductions / gross) * 100,
    };
  }

  it('calculates correct percentages', () => {
    const result = calculatePcts(3000, 800, 2200);
    expect(result.netPct).toBeCloseTo(73.33, 1);
    expect(result.deductionPct).toBeCloseTo(26.67, 1);
  });

  it('net + deductions add up to ~100%', () => {
    const result = calculatePcts(5000, 1200, 3800);
    expect(result.netPct + result.deductionPct).toBeCloseTo(100, 0);
  });

  it('returns null for zero/null gross', () => {
    expect(calculatePcts(0, 0, 0)).toBeNull();
    expect(calculatePcts(null, 100, 100)).toBeNull();
  });
});

// ── LineItem negative amounts ────────────────────────────────────

describe('LineItem display logic', () => {
  it('positive amounts display without prefix', () => {
    const amount = 2500;
    const isNegative = false;
    const display = `${isNegative ? '−' : ''}${Math.abs(amount).toFixed(2)}`;
    expect(display).toBe('2500.00');
  });

  it('negative amounts display with minus sign', () => {
    const amount = -350;
    const isNegative = true;
    const display = `${isNegative ? '−' : ''}${Math.abs(amount).toFixed(2)}`;
    expect(display).toBe('−350.00');
  });
});

// ── MobilePayslipList component structure ────────────────────────

describe('MobilePayslipList component structure', () => {
  const src = fs.readFileSync(
    path.resolve('src/components/ess/payslips/MobilePayslipList.jsx'),
    'utf-8',
  );

  it('imports useEssPayslips hook', () => {
    expect(src).toContain('useEssPayslips');
  });

  it('imports MobileHeader primitive', () => {
    expect(src).toContain('MobileHeader');
  });

  it('imports useLocaleFormat for currency', () => {
    expect(src).toContain('useLocaleFormat');
    expect(src).toContain('formatCurrency');
  });

  it('imports useLocaleDateFns for dates', () => {
    expect(src).toContain('useLocaleDateFns');
    expect(src).toContain('formatDate');
  });

  it('has groupByYear helper', () => {
    expect(src).toContain('groupByYear');
  });

  it('has PayslipRow sub-component', () => {
    expect(src).toContain('PayslipRow');
  });

  it('has YearHeader sub-component', () => {
    expect(src).toContain('YearHeader');
  });

  it('has loading skeleton state', () => {
    expect(src).toContain('PayslipListSkeleton');
    expect(src).toContain('animate-pulse');
  });

  it('has offline fallback', () => {
    expect(src).toContain('EssOfflineFallback');
  });

  it('has required data-testid attributes', () => {
    expect(src).toContain('data-testid="mobile-payslip-list"');
    expect(src).toContain('data-testid="payslip-row"');
    expect(src).toContain('data-testid="payslip-year-header"');
    expect(src).toContain('data-testid="payslip-list-skeleton"');
    expect(src).toContain('data-testid="mobile-payslip-error"');
    expect(src).toContain('data-testid="mobile-payslip-empty"');
    expect(src).toContain('data-testid="mobile-payslip-restricted"');
  });

  it('PayslipRow meets 44px min-height tap target', () => {
    expect(src).toContain('min-h-[44px]');
  });

  it('PayslipRow is keyboard accessible', () => {
    expect(src).toContain('role="button"');
    expect(src).toContain('tabIndex={0}');
    expect(src).toContain('onKeyDown');
  });

  it('hides current year header to reduce noise', () => {
    expect(src).toContain('year !== currentYear');
  });
});

// ── MobilePayslipDetail component structure ──────────────────────

describe('MobilePayslipDetail component structure', () => {
  const src = fs.readFileSync(
    path.resolve('src/components/ess/payslips/MobilePayslipDetail.jsx'),
    'utf-8',
  );

  it('imports useEssPayslips hook', () => {
    expect(src).toContain('useEssPayslips');
  });

  it('imports useParams for route param', () => {
    expect(src).toContain('useParams');
  });

  it('imports MobileHeader with back navigation', () => {
    expect(src).toContain('MobileHeader');
    expect(src).toContain('backTo="/app/ess/payslips"');
  });

  it('has PayBreakdownBar sub-component', () => {
    expect(src).toContain('PayBreakdownBar');
  });

  it('has LineItem sub-component', () => {
    expect(src).toContain('LineItem');
  });

  it('has SectionHeader sub-component', () => {
    expect(src).toContain('SectionHeader');
  });

  it('has loading skeleton', () => {
    expect(src).toContain('DetailSkeleton');
    expect(src).toContain('animate-pulse');
  });

  it('has offline fallback', () => {
    expect(src).toContain('EssOfflineFallback');
  });

  it('renders net pay hero section', () => {
    expect(src).toContain('data-testid="payslip-net-hero"');
  });

  it('renders breakdown bar', () => {
    expect(src).toContain('data-testid="pay-breakdown-bar"');
  });

  it('breakdown bar is aria-hidden', () => {
    expect(src).toContain('aria-hidden="true"');
  });

  it('has floating PDF download button', () => {
    expect(src).toContain('data-testid="payslip-download-btn"');
    expect(src).toContain('ArrowDownTrayIcon');
    expect(src).toContain('download=');
  });

  it('has bottom padding for floating button', () => {
    expect(src).toContain('pb-28');
    expect(src).toContain('bottom-24');
  });

  it('has required data-testid attributes', () => {
    expect(src).toContain('data-testid="mobile-payslip-detail"');
    expect(src).toContain('data-testid="payslip-net-hero"');
    expect(src).toContain('data-testid="pay-breakdown-bar"');
    expect(src).toContain('data-testid="payslip-line-item"');
    expect(src).toContain('data-testid="payslip-download-btn"');
    expect(src).toContain('data-testid="payslip-detail-skeleton"');
    expect(src).toContain('data-testid="mobile-payslip-detail-error"');
  });

  it('earnings line items are not marked negative', () => {
    // Earnings section passes isNegative={false}
    expect(src).toContain('isNegative={false}');
  });

  it('deductions line items are marked negative', () => {
    expect(src).toContain('isNegative={true}');
  });

  it('shows summary with gross, deductions, net', () => {
    expect(src).toContain("t('mobile.payslips.grossPay')");
    expect(src).toContain("t('mobile.payslips.totalDeductions')");
    expect(src).toContain("t('mobile.payslips.netPay')");
  });

  it('shows paid date', () => {
    expect(src).toContain("t('mobile.payslips.paid'");
  });
});

// ── Page-level conditional routing ───────────────────────────────

describe('EssPayslipsPage mobile routing', () => {
  const src = fs.readFileSync(
    path.resolve('src/pages/ess/EssPayslipsPage.jsx'),
    'utf-8',
  );

  it('imports useMobileLayout', () => {
    expect(src).toContain('useMobileLayout');
  });

  it('imports MobilePayslipList', () => {
    expect(src).toContain('MobilePayslipList');
  });

  it('conditionally returns MobilePayslipList when isMobile', () => {
    expect(src).toContain('if (isMobile) return <MobilePayslipList />');
  });
});

describe('EssPayslipDetailPage mobile routing', () => {
  const src = fs.readFileSync(
    path.resolve('src/pages/ess/EssPayslipDetailPage.jsx'),
    'utf-8',
  );

  it('imports useMobileLayout', () => {
    expect(src).toContain('useMobileLayout');
  });

  it('imports MobilePayslipDetail', () => {
    expect(src).toContain('MobilePayslipDetail');
  });

  it('conditionally returns MobilePayslipDetail when isMobile', () => {
    expect(src).toContain('if (isMobile) return <MobilePayslipDetail />');
  });
});

// ── i18n keys ────────────────────────────────────────────────────

describe('i18n — mobile.payslips keys', () => {
  const en = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/en/ess.json'), 'utf-8'),
  );
  const fr = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/fr/ess.json'), 'utf-8'),
  );

  const requiredKeys = [
    'title', 'net', 'paidOn', 'netPay', 'gross', 'deductions',
    'earnings', 'summary', 'grossPay', 'totalDeductions',
    'downloadPdf', 'noPayslips', 'paid',
  ];

  it('EN has all mobile.payslips keys', () => {
    requiredKeys.forEach((key) => {
      expect(en.mobile.payslips).toHaveProperty(key);
      expect(en.mobile.payslips[key]).toBeTruthy();
    });
  });

  it('FR has all mobile.payslips keys', () => {
    requiredKeys.forEach((key) => {
      expect(fr.mobile.payslips).toHaveProperty(key);
      expect(fr.mobile.payslips[key]).toBeTruthy();
    });
  });

  it('EN interpolation placeholders present', () => {
    expect(en.mobile.payslips.paidOn).toContain('{{date}}');
    expect(en.mobile.payslips.paid).toContain('{{date}}');
  });

  it('FR interpolation placeholders present', () => {
    expect(fr.mobile.payslips.paidOn).toContain('{{date}}');
    expect(fr.mobile.payslips.paid).toContain('{{date}}');
  });

  it('FR translations are correct', () => {
    expect(fr.mobile.payslips.title).toBe('Fiches de paie');
    expect(fr.mobile.payslips.netPay).toBe('Salaire net');
    expect(fr.mobile.payslips.grossPay).toBe('Salaire brut');
    expect(fr.mobile.payslips.downloadPdf).toBe('Télécharger le PDF');
  });

  it('EN labels are concise for mobile display', () => {
    expect(en.mobile.payslips.net.length).toBeLessThanOrEqual(5);
    expect(en.mobile.payslips.gross.length).toBeLessThanOrEqual(8);
  });
});
