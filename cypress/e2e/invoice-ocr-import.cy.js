// Invoice OCR Import, Settings, Management & Navbar E2E Tests
describe('Invoice OCR Import & Settings', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('[data-testid="dev-login-admin"]').click();
    cy.url().should('not.include', '/login');
  });

  describe('Navbar - Factures entry', () => {
    it('should show invoices link for admin', () => {
      cy.get('[data-nav-item="invoices"]').should('exist').and('be.visible');
    });

    it('should navigate to invoices page when clicked', () => {
      cy.get('[data-nav-item="invoices"]').click();
      cy.url().should('include', '/invoices');
      cy.get('[data-testid="invoice-list-page"]').should('exist');
    });
  });

  describe('Invoice List - Import PDF button', () => {
    beforeEach(() => {
      cy.visit('/invoices');
    });

    it('should display the Import PDF button', () => {
      cy.get('[data-testid="import-pdf-btn"]').should('exist').and('be.visible');
    });

    it('should open the import modal when clicked', () => {
      cy.get('[data-testid="import-pdf-btn"]').click();
      cy.get('[data-testid="invoice-import-modal"]').should('exist');
    });

    it('should close the modal on cancel', () => {
      cy.get('[data-testid="import-pdf-btn"]').click();
      cy.get('[data-testid="invoice-import-modal"]').should('exist');
      cy.get('[data-testid="invoice-import-modal"]').contains('Annuler').click();
      cy.get('[data-testid="invoice-import-modal"]').should('not.exist');
    });

    it('should show the drop zone in the modal', () => {
      cy.get('[data-testid="import-pdf-btn"]').click();
      cy.get('[data-testid="pdf-drop-zone"]').should('exist');
    });

    it('should reject non-PDF files', () => {
      cy.get('[data-testid="import-pdf-btn"]').click();
      const blob = new Blob(['test content'], { type: 'text/plain' });
      const file = new File([blob], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      cy.get('[data-testid="pdf-file-input"]').then(($input) => {
        $input[0].files = dataTransfer.files;
        $input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });
      cy.get('[data-testid="import-error"]').should('exist');
    });

    it('should have the submit button disabled when no file selected', () => {
      cy.get('[data-testid="import-pdf-btn"]').click();
      cy.get('[data-testid="import-submit-btn"]').should('be.disabled');
    });
  });

  describe('Invoice List - Management actions', () => {
    beforeEach(() => {
      cy.visit('/invoices');
    });

    it('should show New Invoice button', () => {
      cy.get('[data-testid="new-invoice-btn"]').should('exist').and('be.visible');
    });

    it('should navigate to new invoice form', () => {
      cy.get('[data-testid="new-invoice-btn"]').click();
      cy.url().should('include', '/invoices/new');
    });

    it('should show Export CSV button', () => {
      cy.get('[data-testid="export-csv-btn"]').should('exist').and('be.visible');
    });

    it('should show actions column header in table', () => {
      cy.get('[data-testid="invoice-list-page"]').should('exist');
      cy.get('th').contains('Actions').should('exist');
    });
  });

  describe('Invoice Settings', () => {
    beforeEach(() => {
      cy.visit('/settings');
    });

    it('should show Factures category in settings sidebar', () => {
      cy.contains('Factures').should('exist');
    });

    it('should display invoice settings when category is clicked', () => {
      cy.contains('Factures').click();
      cy.get('[data-testid="invoice-settings-section"]').should('exist');
    });

    it('should show OCR provider selector', () => {
      cy.contains('Factures').click();
      cy.get('[data-testid="invoice-settings-section"]')
        .find('select')
        .should('exist');
    });

    it('should show default currency field', () => {
      cy.contains('Factures').click();
      cy.get('[data-testid="invoice-settings-section"]')
        .contains('Devise par défaut')
        .should('exist');
    });

    it('should show save button for admin', () => {
      cy.contains('Factures').click();
      cy.get('[data-testid="invoice-settings-section"]')
        .contains('Enregistrer')
        .should('exist');
    });
  });

  describe('Invoice Settings - Manager view', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('[data-testid="dev-login-manager"]').click();
      cy.url().should('not.include', '/login');
      cy.visit('/settings');
    });

    it('should show invoices category as read-only for manager', () => {
      cy.contains('Factures').click();
      cy.get('[data-testid="invoice-settings-section"]').should('exist');
      // Manager should not see save/reset buttons
      cy.get('[data-testid="invoice-settings-section"]')
        .find('button')
        .filter(':contains("Enregistrer")')
        .should('not.exist');
    });
  });
});
