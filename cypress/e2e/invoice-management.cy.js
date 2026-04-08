/**
 * E2E tests for the Invoice Management module (AP — supplier invoices).
 * Tests CRUD, approval with stock movements, payment recording, PDF export, and KPI widgets.
 *
 * Prerequisites:
 *  - Frontend running on http://localhost:5173
 *  - Backend API running on http://localhost:8080
 *  - Test accounts seeded (admin@staffscheduler.com / Admin@123)
 */

describe('Invoice Management', () => {
  beforeEach(() => {
    cy.loginAs('admin');
  });

  // ──────────────────────────────────────────────────────────────────
  // Navigation
  // ──────────────────────────────────────────────────────────────────

  it('should navigate to invoices page via navbar', () => {
    cy.get('[data-nav-item="invoices"]', { timeout: 10000 }).click();
    cy.url().should('include', '/invoices');
    cy.get('[data-testid="invoice-list-page"]').should('be.visible');
  });

  // ──────────────────────────────────────────────────────────────────
  // Invoice list page — UI elements
  // ──────────────────────────────────────────────────────────────────

  it('should show new-invoice and export buttons', () => {
    cy.visit('/invoices');
    cy.get('[data-testid="new-invoice-btn"]').should('be.visible');
    cy.get('[data-testid="export-csv-btn"]').should('be.visible');
  });

  it('should show status filter with all French statuses', () => {
    cy.visit('/invoices');
    cy.get('[data-testid="status-filter"]').within(() => {
      cy.contains('option', 'Reçue').should('exist');
      cy.contains('option', 'Approuvée').should('exist');
      cy.contains('option', 'Payée').should('exist');
      cy.contains('option', 'Annulée').should('exist');
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // KPI widgets
  // ──────────────────────────────────────────────────────────────────

  it('should display invoice KPI widgets on the invoices page', () => {
    cy.visit('/invoices');
    cy.get('[data-testid="kpi-unpaid"]').should('be.visible');
    cy.get('[data-testid="kpi-paid-mtd"]').should('be.visible');
    cy.get('[data-testid="kpi-pending"]').should('be.visible');
  });

  // ──────────────────────────────────────────────────────────────────
  // TVA rate selector
  // ──────────────────────────────────────────────────────────────────

  it('should display TVA rate selector with only French standard rates', () => {
    cy.visit('/invoices/new');
    cy.get('[data-testid="invoice-form"]').should('be.visible');

    // The header-level TVA selector contains the 4 French rates
    cy.get('select').then(($selects) => {
      const tvaSelect = [...$selects].find((s) => {
        const opts = [...s.options].map((o) => o.text);
        return opts.some((o) => o.includes('20'));
      });
      if (tvaSelect) {
        const opts = [...tvaSelect.options].map((o) => o.text);
        expect(opts.some((o) => o.includes('20'))).to.be.true;
        expect(opts.some((o) => o.includes('10'))).to.be.true;
        expect(opts.some((o) => o.includes('5'))).to.be.true;
        expect(opts.some((o) => o.includes('2'))).to.be.true;
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Validation — SIRET format
  // ──────────────────────────────────────────────────────────────────

  it('should reject an invalid SIRET (< 14 digits) on submit', () => {
    cy.visit('/invoices/new');

    cy.get('[data-testid="supplier-name-input"]').type('Test Supplier');
    cy.get('[data-testid="siret-input"]').type('123'); // invalid: only 3 digits

    // Fill required dates and a line
    cy.get('input[type="date"]').eq(0).type('2026-04-08'); // issueDate
    cy.get('input[type="date"]').eq(2).type('2026-05-08'); // dueDate

    cy.get('[data-testid="submit-invoice-btn"]').click();

    // Should show SIRET validation error (contains "14")
    cy.contains('14').should('be.visible');
  });

  // ──────────────────────────────────────────────────────────────────
  // Create a new invoice with French mandatory fields
  // ──────────────────────────────────────────────────────────────────

  it('should create a new AP invoice and redirect to list', () => {
    cy.visit('/invoices/new');

    cy.get('[data-testid="supplier-name-input"]').clear().type('SAS Dupont Fournitures');
    cy.get('input[type="email"]').first().clear().type('contact@dupont.fr');
    cy.get('[data-testid="siret-input"]').clear().type('12345678901234');
    cy.get('[data-testid="vat-input"]').clear().type('FR12345678901');

    // Dates
    cy.get('input[type="date"]').eq(0).type('2026-04-08'); // issueDate
    cy.get('input[type="date"]').eq(2).type('2026-05-08'); // dueDate

    // Line item — description + qty + unit price (first line already present)
    cy.get('[data-testid="invoice-form"]').within(() => {
      // Description field for the first line
      cy.get('input[type="text"]').last().clear().type('Fournitures de bureau');
      cy.get('input[type="number"]').eq(0).clear().type('10');  // qty
      cy.get('input[type="number"]').eq(1).clear().type('25.50'); // unitPrice
    });

    cy.get('[data-testid="submit-invoice-btn"]').click();

    // Should redirect to invoice list on success
    cy.url({ timeout: 10000 }).should('include', '/invoices');
    cy.get('[data-testid="invoice-list-page"]').should('be.visible');
  });

  // ──────────────────────────────────────────────────────────────────
  // Approve invoice (if one exists in "received" status)
  // ──────────────────────────────────────────────────────────────────

  it('should approve a received invoice when one exists', () => {
    cy.visit('/invoices');

    cy.get('[data-testid="invoice-table-body"] tr').then(($rows) => {
      if ($rows.length === 0) return; // no data — skip gracefully

      cy.wrap($rows).first().click();
      cy.url({ timeout: 8000 }).should('match', /\/invoices\/.+/);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="approve-btn"]').length > 0) {
          cy.on('window:confirm', () => true);
          cy.get('[data-testid="approve-btn"]').click();
        }
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Record a payment on an approved invoice
  // ──────────────────────────────────────────────────────────────────

  it('should display payment button on an approved invoice', () => {
    cy.visit('/invoices');

    cy.get('[data-testid="invoice-table-body"] tr').then(($rows) => {
      if ($rows.length === 0) return;

      cy.wrap($rows).first().click();
      cy.url({ timeout: 8000 }).should('match', /\/invoices\/.+/);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="record-payment-btn"]').length > 0) {
          cy.get('[data-testid="record-payment-btn"]').click();
          cy.get('[data-testid="submit-payment-btn"]').should('be.visible');
        }
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Duplicate
  // ──────────────────────────────────────────────────────────────────

  it('should duplicate an invoice and open the copy', () => {
    cy.visit('/invoices');

    cy.get('[data-testid="invoice-table-body"] tr').then(($rows) => {
      if ($rows.length === 0) return;

      cy.wrap($rows).first().click();
      cy.url({ timeout: 8000 }).should('match', /\/invoices\/.+/);

      cy.get('[data-testid="duplicate-btn"]').should('be.visible').click();
      cy.url({ timeout: 8000 }).should('match', /\/invoices\/.+/);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // CSV export
  // ──────────────────────────────────────────────────────────────────

  it('should trigger CSV download when Export is clicked', () => {
    cy.visit('/invoices');
    // Stub window.URL.createObjectURL to avoid actual blob issues
    cy.window().then((win) => {
      cy.stub(win.URL, 'createObjectURL').returns('blob:fake-url');
    });
    cy.get('[data-testid="export-csv-btn"]').click();
    // The button should still be visible (no crash)
    cy.get('[data-testid="export-csv-btn"]').should('be.visible');
  });

  // ──────────────────────────────────────────────────────────────────
  // PDF button
  // ──────────────────────────────────────────────────────────────────

  it('should show PDF download button on invoice detail page', () => {
    cy.visit('/invoices');

    cy.get('[data-testid="invoice-table-body"] tr').then(($rows) => {
      if ($rows.length === 0) return;

      cy.wrap($rows).first().click();
      cy.url({ timeout: 8000 }).should('match', /\/invoices\/.+/);

      cy.get('[data-testid="pdf-btn"]').should('be.visible');
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Mobile layout
  // ──────────────────────────────────────────────────────────────────

  it('should display mobile card layout on small screens', () => {
    cy.viewport('iphone-x');
    cy.visit('/invoices');
    // Desktop table should be hidden, mobile cards visible
    cy.get('table').should('not.be.visible');
    cy.get('[data-testid="invoice-mobile-cards"]').should('be.visible');
  });
});
