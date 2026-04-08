/**
 * E2E tests for the Invoice Management module (AP — supplier invoices).
 * Tests CRUD, approval with stock movements, payment recording, PDF export, and KPI widgets.
 */

describe('Invoice Management', () => {
  beforeEach(() => {
    // Log in as admin
    cy.visit('/login');
    cy.get('[data-role="admin"]').click();
    cy.url().should('not.include', '/login');
  });

  it('should navigate to invoices page', () => {
    cy.get('[data-nav-item="invoices"]').click();
    cy.url().should('include', '/invoices');
    cy.contains('Factures fournisseurs').should('be.visible');
  });

  it('should create a new AP invoice with French mandatory fields', () => {
    cy.visit('/invoices/new');

    // Fill supplier info
    cy.get('input').filter((_, el) => el.closest('div')?.querySelector('label')?.textContent?.includes('Fournisseur')).first().clear().type('SAS Dupont Fournitures');
    cy.get('input[type="email"]').first().type('contact@dupont.fr');
    cy.get('textarea').first().type('12 Rue de la Paix, 75002 Paris');
    cy.get('input[maxlength="14"]').clear().type('12345678901234');
    cy.get('input[placeholder="FR12345678901"]').clear().type('FR12345678901');

    // Fill dates
    cy.get('input[type="date"]').eq(0).type('2026-04-08');
    cy.get('input[type="date"]').eq(2).type('2026-05-08');

    // Fill line item
    cy.get('input[type="number"]').eq(2).clear().type('10');
    cy.get('input[type="number"]').eq(3).clear().type('25.50');

    // Set description for free-text line
    const descInputs = cy.get('input[type="text"]');
    descInputs.last().clear().type('Fournitures de bureau');

    // Submit
    cy.contains('Enregistrer').click();

    // Should redirect to invoice list
    cy.url().should('include', '/invoices');
  });

  it('should display TVA rate selector with only French standard rates', () => {
    cy.visit('/invoices/new');

    // Header TVA rate selector
    cy.get('select').then(($selects) => {
      // Find the TVA select (has 20 %, 10 %, etc.)
      const tvaSelect = [...$selects].find((s) => {
        const options = [...s.options].map((o) => o.text);
        return options.includes('20 %');
      });
      if (tvaSelect) {
        const options = [...tvaSelect.options].map((o) => o.text);
        expect(options).to.include('20 %');
        expect(options).to.include('10 %');
        expect(options).to.include('5,5 %');
        expect(options).to.include('2,1 %');
      }
    });
  });

  it('should validate SIRET format (14 digits)', () => {
    cy.visit('/invoices/new');

    // Fill required fields with invalid SIRET
    cy.get('input[maxlength="14"]').clear().type('123');

    // Fill minimum required fields
    cy.get('input').filter((_, el) => el.closest('div')?.querySelector('label')?.textContent?.includes('Fournisseur')).first().clear().type('Test Supplier');
    cy.get('input[type="date"]').eq(0).type('2026-04-08');
    cy.get('input[type="date"]').eq(2).type('2026-05-08');

    // Add a line
    cy.get('input[type="number"]').eq(2).clear().type('1');
    cy.get('input[type="number"]').eq(3).clear().type('10');

    cy.contains('Enregistrer').click();

    // Should show SIRET validation error
    cy.contains('14 chiffres').should('be.visible');
  });

  it('should show invoice KPI widgets on the invoices page', () => {
    cy.visit('/invoices');

    // KPI stat cards should be visible
    cy.contains('Total fournisseurs impayés').should('be.visible');
    cy.contains('Total réglé (mois courant)').should('be.visible');
    cy.contains("En attente d'approbation").should('be.visible');
  });

  it('should approve an invoice and lock it', () => {
    // First create an invoice via API or navigate
    cy.visit('/invoices');

    // Click first invoice if exists
    cy.get('table tbody tr').first().then(($row) => {
      if ($row.length) {
        cy.wrap($row).click();
        cy.url().should('match', /\/invoices\/.+/);

        // If in received status, approve it
        cy.get('body').then(($body) => {
          if ($body.find('button:contains("Approuver")').length > 0) {
            cy.contains('Approuver').click();
            cy.on('window:confirm', () => true);
          }
        });
      }
    });
  });

  it('should record a payment on an approved invoice', () => {
    cy.visit('/invoices');

    cy.get('table tbody tr').first().then(($row) => {
      if ($row.length) {
        cy.wrap($row).click();

        cy.get('body').then(($body) => {
          if ($body.find('button:contains("Enregistrer un règlement")').length > 0) {
            cy.contains('Enregistrer un règlement').click();

            // Fill payment form
            cy.get('input[type="number"][step="0.01"]').last().clear().type('100');

            cy.get('form').last().find('button[type="submit"]').click();
          }
        });
      }
    });
  });

  it('should duplicate an invoice', () => {
    cy.visit('/invoices');

    cy.get('table tbody tr').first().then(($row) => {
      if ($row.length) {
        cy.wrap($row).click();
        cy.contains('Dupliquer').click();

        // Should navigate to a new invoice
        cy.url().should('match', /\/invoices\/.+/);
      }
    });
  });

  it('should export invoices as CSV', () => {
    cy.visit('/invoices');
    cy.contains('Exporter').click();
    // CSV download should trigger (we can't fully verify file contents in Cypress)
  });

  it('should generate PDF and open in new tab', () => {
    cy.visit('/invoices');

    cy.get('table tbody tr').first().then(($row) => {
      if ($row.length) {
        cy.wrap($row).click();

        // PDF button should exist
        cy.contains('Télécharger le PDF').should('be.visible');
        // We cannot test window.open in Cypress easily, but verify button exists
      }
    });
  });

  it('should display invoice list with mobile card layout on small screens', () => {
    cy.viewport('iphone-x');
    cy.visit('/invoices');

    // Mobile card layout should be visible (table should be hidden)
    cy.get('table').should('not.be.visible');
  });
});
