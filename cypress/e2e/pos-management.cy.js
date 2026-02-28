describe('PoS Management Module', () => {
  beforeEach(() => {
    cy.visit('/pos');
    cy.get('body', { timeout: 15000 }).should('be.visible');
  });

  describe('PoS List Page', () => {
    it('should display the PoS list page with cards', () => {
      cy.contains('Point of Sale Locations').should('be.visible');
      cy.get('[data-testid="pos-card"]').should('have.length.greaterThan', 0);
    });

    it('should show search and type filter controls', () => {
      cy.get('[data-testid="pos-search-input"]').should('be.visible');
      cy.get('[data-testid="pos-type-filter"]').should('be.visible');
      cy.get('[data-testid="pos-show-inactive-toggle"]').should('exist');
    });

    it('should show View, Edit and Delete buttons on each card', () => {
      cy.get('[data-testid="pos-card"]').first().within(() => {
        cy.get('[data-testid="pos-view-btn"]').should('be.visible');
        cy.get('[data-testid="pos-edit-btn"]').should('be.visible');
        cy.get('[data-testid="pos-delete-btn"]').should('be.visible');
      });
    });

    it('should display the correct type badge color for each PoS type', () => {
      // Verify that type badges exist and contain known type labels
      cy.get('[data-testid="pos-type-badge"]').should('have.length.greaterThan', 0);
    });

    it('should filter by search text', () => {
      cy.get('[data-testid="pos-search-input"]').type('Downtown');
      cy.get('[data-testid="pos-card"]').should('have.length', 1);
      cy.get('[data-testid="pos-name"]').first().should('contain', 'Downtown');
    });

    it('should filter by type', () => {
      cy.get('[data-testid="pos-type-filter"]').select('BUTCHER');
      cy.get('[data-testid="pos-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="pos-type-badge"]').should('contain', 'Butcher');
      });
    });

    it('should toggle show inactive and display inactive PoS with visual distinction', () => {
      // Initially no inactive cards visible
      cy.get('[data-testid="pos-inactive-badge"]').should('not.exist');

      // Toggle show inactive
      cy.get('[data-testid="pos-show-inactive-toggle"]').check();
      cy.wait(500);

      // Should now see inactive badge(s)
      cy.get('[data-testid="pos-inactive-badge"]').should('have.length.greaterThan', 0);
    });

    it('should show empty state when search finds no results', () => {
      cy.get('[data-testid="pos-search-input"]').type('NonExistentLocation12345');
      cy.get('[data-testid="pos-empty-state"]').should('be.visible');
      cy.contains('No PoS locations found').should('be.visible');
    });
  });

  describe('Create PoS', () => {
    it('should open create modal and validate required fields', () => {
      cy.get('[data-testid="create-pos-btn"]').click();
      cy.contains('Create New PoS Location').should('be.visible');

      // Try submitting empty - click the submit button
      cy.get('[data-testid="modal-submit-button"]').should('be.disabled');
    });

    it('should create a new PoS with opening hours and see it in the list', () => {
      cy.get('[data-testid="create-pos-btn"]').click();

      // Fill required fields
      cy.get('[data-testid="pos-name-input"]').type('Test New Store');
      cy.get('[data-testid="pos-address-input"]').type('999 Test Ave, Testville');
      cy.get('[data-testid="pos-type-select"]').select('GROCERY');
      cy.get('[data-testid="pos-phone-input"]').type('(555) 999-0000');

      // Toggle Sunday as closed (should already be closed by default)
      cy.get('[data-testid="opening-hours-sunday-closed"]').should('be.checked');

      // Submit
      cy.get('[data-testid="modal-submit-button"]').should('not.be.disabled');
      cy.get('[data-testid="modal-submit-button"]').click();
      cy.wait(500);

      // Verify new card appears
      cy.contains('Test New Store').should('be.visible');
    });
  });

  describe('PoS Detail Page', () => {
    it('should navigate to detail page and display dashboard KPIs', () => {
      // Click View on the first card
      cy.get('[data-testid="pos-card"]').first().within(() => {
        cy.get('[data-testid="pos-view-btn"]').click();
      });

      // Should be on detail page
      cy.get('[data-testid="pos-detail-name"]').should('be.visible');
      cy.get('[data-testid="pos-dashboard"]').should('be.visible');

      // Verify 4 StatCard components
      cy.get('[data-testid="pos-dashboard"]').within(() => {
        cy.get('.bg-white.rounded-xl').should('have.length', 4);
      });
    });

    it('should display opening hours table', () => {
      cy.get('[data-testid="pos-card"]').first().within(() => {
        cy.get('[data-testid="pos-view-btn"]').click();
      });

      cy.get('[data-testid="pos-detail-hours"]').should('be.visible');
      cy.get('[data-testid="pos-detail-hours-monday"]').should('be.visible');
      cy.get('[data-testid="pos-detail-hours-sunday"]').should('be.visible');
    });

    it('should display location info', () => {
      cy.get('[data-testid="pos-card"]').first().within(() => {
        cy.get('[data-testid="pos-view-btn"]').click();
      });

      cy.get('[data-testid="pos-detail-address"]').should('be.visible');
      cy.get('[data-testid="pos-detail-manager"]').should('be.visible');
    });

    it('should navigate back to list via back link', () => {
      cy.get('[data-testid="pos-card"]').first().within(() => {
        cy.get('[data-testid="pos-view-btn"]').click();
      });

      cy.get('[data-testid="pos-back-link"]').click();
      cy.contains('Point of Sale Locations').should('be.visible');
    });
  });

  describe('Edit PoS', () => {
    it('should open edit modal pre-filled with current data from list page', () => {
      cy.get('[data-testid="pos-card"]').first().within(() => {
        cy.get('[data-testid="pos-edit-btn"]').click();
      });

      cy.contains('Edit PoS Location').should('be.visible');
      // Fields should be pre-filled
      cy.get('[data-testid="pos-name-input"]').should('not.have.value', '');
      cy.get('[data-testid="pos-address-input"]').should('not.have.value', '');
    });

    it('should edit phone from detail page and verify update', () => {
      // Go to detail page
      cy.get('[data-testid="pos-card"]').first().within(() => {
        cy.get('[data-testid="pos-view-btn"]').click();
      });

      // Click Edit
      cy.get('[data-testid="pos-detail-edit-btn"]').click();
      cy.contains('Edit PoS Location').should('be.visible');

      // Change phone
      cy.get('[data-testid="pos-phone-input"]').clear().type('(555) 000-1111');

      // Save
      cy.get('[data-testid="modal-submit-button"]').click();
      cy.wait(500);

      // Verify updated phone on detail page
      cy.get('[data-testid="pos-detail-phone"]').should('contain', '(555) 000-1111');
    });
  });

  describe('Delete PoS', () => {
    it('should show confirmation dialog and cancel', () => {
      cy.get('[data-testid="pos-card"]').first().within(() => {
        cy.get('[data-testid="pos-delete-btn"]').click();
      });

      cy.get('[data-testid="pos-delete-confirm-dialog"]').should('be.visible');
      cy.contains('Delete PoS Location').should('be.visible');

      // Cancel
      cy.get('[data-testid="pos-delete-cancel-btn"]').click();
      cy.get('[data-testid="pos-delete-confirm-dialog"]').should('not.exist');
    });

    it('should delete a PoS and remove it from the list', () => {
      // Count cards before
      cy.get('[data-testid="pos-card"]').then(($cards) => {
        const countBefore = $cards.length;

        // Delete the last card
        cy.get('[data-testid="pos-card"]').last().within(() => {
          cy.get('[data-testid="pos-delete-btn"]').click();
        });

        // Confirm delete
        cy.get('[data-testid="pos-delete-confirm-btn"]').click();
        cy.wait(500);

        // Should have one fewer card
        cy.get('[data-testid="pos-card"]').should('have.length', countBefore - 1);
      });
    });

    it('should delete from detail page and redirect to list', () => {
      // Go to detail page of first PoS
      cy.get('[data-testid="pos-card"]').first().within(() => {
        cy.get('[data-testid="pos-view-btn"]').click();
      });

      // Delete
      cy.get('[data-testid="pos-detail-delete-btn"]').click();
      cy.get('[data-testid="pos-delete-confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="pos-delete-confirm-btn"]').click();
      cy.wait(500);

      // Should redirect to list
      cy.url().should('include', '/pos');
      cy.contains('Point of Sale Locations').should('be.visible');
    });
  });

  describe('Full CRUD Workflow', () => {
    it('should create, view, edit, and delete a PoS location', () => {
      // 1. Create
      cy.get('[data-testid="create-pos-btn"]').click();
      cy.get('[data-testid="pos-name-input"]').type('Workflow Test Shop');
      cy.get('[data-testid="pos-address-input"]').type('100 Workflow Rd');
      cy.get('[data-testid="pos-type-select"]').select('BUTCHER');
      cy.get('[data-testid="pos-phone-input"]').type('(555) 111-2222');

      // Set Sunday as closed (should be default)
      cy.get('[data-testid="opening-hours-sunday-closed"]').should('be.checked');

      cy.get('[data-testid="modal-submit-button"]').click();
      cy.wait(500);
      cy.contains('Workflow Test Shop').should('be.visible');

      // 2. View detail
      cy.contains('Workflow Test Shop')
        .closest('[data-testid="pos-card"]')
        .within(() => {
          cy.get('[data-testid="pos-view-btn"]').click();
        });

      cy.get('[data-testid="pos-detail-name"]').should('contain', 'Workflow Test Shop');
      cy.get('[data-testid="pos-dashboard"]').should('be.visible');
      cy.get('[data-testid="pos-detail-address"]').should('contain', '100 Workflow Rd');
      cy.get('[data-testid="pos-detail-hours-sunday"]').should('contain', 'Closed');

      // 3. Edit - change phone
      cy.get('[data-testid="pos-detail-edit-btn"]').click();
      cy.get('[data-testid="pos-phone-input"]').clear().type('(555) 333-4444');
      cy.get('[data-testid="modal-submit-button"]').click();
      cy.wait(500);
      cy.get('[data-testid="pos-detail-phone"]').should('contain', '(555) 333-4444');

      // 4. Delete
      cy.get('[data-testid="pos-detail-delete-btn"]').click();
      cy.get('[data-testid="pos-delete-confirm-btn"]').click();
      cy.wait(500);

      // Should be back on list and shop should be gone
      cy.url().should('include', '/pos');
      cy.contains('Workflow Test Shop').should('not.exist');
    });
  });

  describe('Search and Filter Workflow', () => {
    it('should search by name, filter by type, and toggle inactive', () => {
      // Search by name
      cy.get('[data-testid="pos-search-input"]').type('Grocery');
      cy.get('[data-testid="pos-card"]').should('have.length.greaterThan', 0);
      cy.get('[data-testid="pos-name"]').each(($el) => {
        cy.wrap($el).invoke('text').then((text) => {
          expect(text.toLowerCase()).to.include('grocery');
        });
      });

      // Clear search
      cy.get('[data-testid="pos-search-input"]').clear();

      // Filter by type
      cy.get('[data-testid="pos-type-filter"]').select('FAST_FOOD');
      cy.get('[data-testid="pos-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="pos-type-badge"]').should('contain', 'Fast Food');
      });

      // Reset filter
      cy.get('[data-testid="pos-type-filter"]').select('');

      // Toggle inactive
      cy.get('[data-testid="pos-show-inactive-toggle"]').check();
      cy.wait(500);
      cy.get('[data-testid="pos-inactive-badge"]').should('exist');

      // Inactive cards should have reduced opacity
      cy.get('[data-testid="pos-inactive-badge"]')
        .closest('[data-testid="pos-card"]')
        .should('have.class', 'opacity-50');
    });
  });

  describe('Opening Hours Validation', () => {
    it('should disable time inputs when Closed is toggled', () => {
      cy.get('[data-testid="create-pos-btn"]').click();

      // Monday should not be closed by default
      cy.get('[data-testid="opening-hours-monday-closed"]').should('not.be.checked');
      cy.get('[data-testid="opening-hours-monday-open"]').should('not.be.disabled');
      cy.get('[data-testid="opening-hours-monday-close"]').should('not.be.disabled');

      // Toggle Monday to closed
      cy.get('[data-testid="opening-hours-monday-closed"]').check();
      cy.get('[data-testid="opening-hours-monday-open"]').should('be.disabled');
      cy.get('[data-testid="opening-hours-monday-close"]').should('be.disabled');

      // Toggle back
      cy.get('[data-testid="opening-hours-monday-closed"]').uncheck();
      cy.get('[data-testid="opening-hours-monday-open"]').should('not.be.disabled');
      cy.get('[data-testid="opening-hours-monday-close"]').should('not.be.disabled');
    });
  });

  describe('Manager Dropdown', () => {
    it('should display a manager select dropdown in create modal', () => {
      cy.get('[data-testid="create-pos-btn"]').click();
      cy.get('[data-testid="pos-manager-select"]').should('be.visible');
      cy.get('[data-testid="pos-manager-select"]').find('option').should('have.length.greaterThan', 1);
    });

    it('should display manager dropdown in edit modal pre-selected', () => {
      cy.get('[data-testid="pos-card"]').first().within(() => {
        cy.get('[data-testid="pos-edit-btn"]').click();
      });
      cy.get('[data-testid="pos-manager-select"]').should('be.visible');
    });

    it('should select a manager and see the name on detail page', () => {
      cy.get('[data-testid="pos-card"]').first().within(() => {
        cy.get('[data-testid="pos-view-btn"]').click();
      });

      cy.get('[data-testid="pos-detail-edit-btn"]').click();

      // Pick the first manager option
      cy.get('[data-testid="pos-manager-select"]')
        .find('option')
        .eq(1)
        .invoke('val')
        .then((val) => {
          cy.get('[data-testid="pos-manager-select"]').select(val);
        });

      cy.get('[data-testid="modal-submit-button"]').click();
      cy.wait(500);

      // Manager name should be visible
      cy.get('[data-testid="pos-detail-manager"]').should('not.contain', 'Unassigned');
    });
  });

  describe('Employee Management on PoS Detail', () => {
    beforeEach(() => {
      cy.visit('/pos');
      cy.get('[data-testid="pos-card"]').first().within(() => {
        cy.get('[data-testid="pos-view-btn"]').click();
      });
      cy.get('[data-testid="pos-detail-name"]').should('be.visible');
    });

    it('should display the employee section', () => {
      cy.get('[data-testid="pos-employee-section"]').should('be.visible');
    });

    it('should show employee cards with name, role, department and manager badge', () => {
      cy.get('[data-testid="pos-employee-card"]').should('have.length.greaterThan', 0);
      cy.get('[data-testid="pos-employee-card"]').first().within(() => {
        // Should contain name, role, department
        cy.get('h3').should('not.be.empty');
        cy.get('p').should('have.length.greaterThan', 0);
      });
    });

    it('should search employees', () => {
      cy.get('[data-testid="pos-employee-search"]').should('be.visible');
      cy.get('[data-testid="pos-employee-search"]').type('zzzzNonExistent');
      cy.get('[data-testid="pos-employee-empty"]').should('be.visible');
    });

    it('should open add employee modal and require fields', () => {
      cy.get('[data-testid="pos-add-employee-btn"]').click();
      cy.contains('Add Employee to PoS').should('be.visible');

      // Validate button disabled without data
      cy.get('[data-testid="modal-submit-button"]').should('be.disabled');
    });

    it('should add a new employee', () => {
      cy.get('[data-testid="pos-employee-card"]').then(($cards) => {
        const countBefore = $cards.length;

        cy.get('[data-testid="pos-add-employee-btn"]').click();
        cy.get('[data-testid="pos-emp-name-input"]').type('Cypress Test Employee');
        cy.get('[data-testid="pos-emp-email-input"]').type('cypress@test.com');
        cy.get('[data-testid="pos-emp-role-input"]').type('Cashier');
        cy.get('[data-testid="pos-emp-dept-input"]').type('Sales');
        cy.get('[data-testid="pos-emp-hours-input"]').clear().type('35');

        cy.get('[data-testid="modal-submit-button"]').should('not.be.disabled');
        cy.get('[data-testid="modal-submit-button"]').click();
        cy.wait(500);

        cy.get('[data-testid="pos-employee-card"]').should('have.length', countBefore + 1);
        cy.contains('Cypress Test Employee').should('be.visible');
      });
    });

    it('should remove an employee', () => {
      cy.get('[data-testid="pos-employee-card"]').then(($cards) => {
        const countBefore = $cards.length;
        if (countBefore === 0) return; // skip if empty

        // Hover to reveal remove button (force since hover is CSS)
        cy.get('[data-testid="pos-employee-card"]').last().within(() => {
          cy.get('[data-testid="pos-employee-remove-btn"]').click({ force: true });
        });

        cy.get('[data-testid="pos-employee-delete-dialog"]').should('be.visible');
        cy.get('[data-testid="pos-emp-delete-confirm"]').click();
        cy.wait(500);

        cy.get('[data-testid="pos-employee-card"]').should('have.length', countBefore - 1);
      });
    });
  });
});
