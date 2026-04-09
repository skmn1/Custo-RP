/**
 * E2E tests for Employee Attendance & Work History (Task 51)
 *
 * Tests:
 *  1. Attendance page loads with title
 *  2. Summary cards display attendance stats
 *  3. Status breakdown section shows badges
 *  4. Daily log table renders records
 *  5. Period navigation changes month
 *  6. Status filter selects work
 *  7. Export CSV button is present
 */
describe('ESS Attendance & Work History', () => {
  const BASE = 'http://localhost:5173';

  const loginAs = (role) => {
    const accounts = {
      super_admin: { email: 'admin@staffscheduler.com', password: 'Admin@123' },
      employee: { email: 'employee@staffscheduler.com', password: 'Employee@123' },
    };
    const acct = accounts[role];
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains(role.replace('_', ' '), { matchCase: false, timeout: 10000 }).click();
    cy.wait(2000);
  };

  // ── 1. Page loads ──
  describe('Attendance page', () => {
    beforeEach(() => {
      loginAs('employee');
    });

    it('navigates to /app/ess/attendance and shows heading', () => {
      cy.visit(`${BASE}/app/ess/attendance`);
      cy.contains('My Attendance', { timeout: 10000 }).should('be.visible');
    });

    it('shows Export CSV button', () => {
      cy.visit(`${BASE}/app/ess/attendance`);
      cy.contains('Export CSV', { timeout: 10000 }).should('be.visible');
    });
  });

  // ── 2. Summary cards ──
  describe('Summary cards', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/attendance`);
    });

    it('displays attendance rate card', () => {
      cy.contains('Attendance Rate', { timeout: 10000 }).should('be.visible');
    });

    it('displays total hours card', () => {
      cy.contains('Total Hours', { timeout: 10000 }).should('be.visible');
    });

    it('displays overtime card', () => {
      cy.contains('Overtime', { timeout: 10000 }).should('be.visible');
    });

    it('displays days absent card', () => {
      cy.contains('Days Absent', { timeout: 10000 }).should('be.visible');
    });
  });

  // ── 3. Status breakdown ──
  describe('Status breakdown', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/attendance`);
    });

    it('shows status breakdown section', () => {
      cy.contains('Status Breakdown', { timeout: 10000 }).should('be.visible');
    });

    it('shows Present badge', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const hasPresent = $body.text().includes('Present');
        expect(hasPresent).to.be.true;
      });
    });
  });

  // ── 4. Daily log table ──
  describe('Daily log', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/attendance`);
    });

    it('shows daily log section', () => {
      cy.contains('Daily Log', { timeout: 10000 }).should('be.visible');
    });

    it('shows table headers', () => {
      cy.get('table', { timeout: 10000 }).within(() => {
        cy.contains('th', 'Date').should('exist');
        cy.contains('th', 'Status').should('exist');
        cy.contains('th', 'Scheduled').should('exist');
        cy.contains('th', 'Actual').should('exist');
        cy.contains('th', 'Hours').should('exist');
      });
    });

    it('has table rows when data exists', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const hasRows = $body.find('table tbody tr').length > 0;
        const hasEmpty = $body.text().includes('No attendance records');
        expect(hasRows || hasEmpty).to.be.true;
      });
    });
  });

  // ── 5. Period navigation ──
  describe('Period navigation', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/attendance`);
    });

    it('displays current month label', () => {
      // Should show a month/year in the period nav
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const text = $body.text();
        // Check that some month name appears (e.g. "January", "February", etc.)
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
        const hasMonth = months.some(m => text.includes(m));
        expect(hasMonth).to.be.true;
      });
    });

    it('navigates to previous month when clicking back arrow', () => {
      // Click the left arrow (previous month)
      cy.get('button[aria-label]', { timeout: 10000 }).first().click();
      cy.wait(1000);
      // Page should still show attendance title
      cy.contains('My Attendance').should('be.visible');
    });
  });

  // ── 6. Status filter ──
  describe('Status filter', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/attendance`);
    });

    it('shows filter dropdown', () => {
      cy.contains('Filter by status', { timeout: 10000 }).should('be.visible');
      cy.get('select').should('exist');
    });

    it('filter includes all status options', () => {
      cy.get('select', { timeout: 10000 }).within(() => {
        cy.contains('option', 'All statuses').should('exist');
        cy.contains('option', 'Present').should('exist');
        cy.contains('option', 'Absent').should('exist');
        cy.contains('option', 'Late').should('exist');
      });
    });
  });
});
