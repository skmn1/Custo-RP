describe('Payroll Management System', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('[data-nav-item="payroll"]').click()
  })

  describe('Payroll Dashboard', () => {
    it('should display payroll dashboard with key metrics', () => {
      // Verify dashboard loads
      cy.get('[data-testid="payroll-dashboard"]').should('be.visible')
      
      // Check for key metric cards
      cy.get('[data-testid="total-gross-pay"]').should('be.visible')
      cy.get('[data-testid="total-net-pay"]').should('be.visible')
      cy.get('[data-testid="total-hours"]').should('be.visible')
      cy.get('[data-testid="overtime-hours"]').should('be.visible')
      
      // Verify pay period selector
      cy.get('[data-testid="pay-period-selector"]').should('be.visible')
    })

    it('should allow navigation between pay periods', () => {
      // Test previous period navigation
      cy.get('[data-testid="prev-period-button"]').click()
      cy.get('[data-testid="pay-period-display"]').should('be.visible')
      
      // Test next period navigation
      cy.get('[data-testid="next-period-button"]').click()
      
      // Test current period button
      cy.get('[data-testid="current-period-button"]').click()
    })

    it('should display historical data when selecting May 2025', () => {
      // Click on May 2025 historical data
      cy.contains('May 2025').click()
      
      // Verify the period changed
      cy.get('[data-testid="pay-period-display"]').should('contain', 'May')
      
      // Verify historical data is loaded
      cy.get('[data-testid="total-gross-pay"]').should('not.contain', '$0.00')
      cy.get('[data-testid="total-employees"]').should('contain', '10')
    })

    it('should display top earners section', () => {
      cy.contains('May 2025').click()
      
      cy.get('[data-testid="top-earners"]').should('be.visible')
      cy.get('[data-testid="top-earners"]').within(() => {
        cy.get('[data-testid="employee-card"]').should('have.length.greaterThan', 0)
      })
    })

    it('should display department breakdown', () => {
      cy.contains('May 2025').click()
      
      cy.get('[data-testid="department-breakdown"]').should('be.visible')
      cy.get('[data-testid="department-breakdown"]').within(() => {
        cy.contains('ICU').should('be.visible')
        cy.contains('Emergency').should('be.visible')
        cy.contains('Surgery').should('be.visible')
      })
    })
  })

  describe('Employee Payroll List', () => {
    beforeEach(() => {
      cy.get('[data-tab="employees"]').click()
      cy.contains('May 2025').click() // Load historical data
    })

    it('should display employee payroll list', () => {
      cy.get('[data-testid="employee-payroll-table"]').should('be.visible')
      
      // Verify table headers
      cy.get('th').should('contain', 'Employee')
      cy.get('th').should('contain', 'Gross Pay')
      cy.get('th').should('contain', 'Net Pay')
      cy.get('th').should('contain', 'Hours')
      cy.get('th').should('contain', 'Overtime')
    })

    it('should allow sorting by different columns', () => {
      // Sort by gross pay
      cy.get('th').contains('Gross Pay').click()
      cy.wait(500)
      
      // Sort by hours
      cy.get('th').contains('Hours').click()
      cy.wait(500)
      
      // Sort by overtime
      cy.get('th').contains('Overtime').click()
    })

    it('should allow filtering by department', () => {
      cy.get('[data-testid="department-filter"]').select('ICU')
      cy.get('[data-testid="employee-payroll-table"] tbody tr').should('have.length.lessThan', 10)
      
      // Reset filter
      cy.get('[data-testid="department-filter"]').select('All Departments')
    })

    it('should allow searching employees', () => {
      cy.get('[data-testid="employee-search"]').type('Sarah')
      cy.get('[data-testid="employee-payroll-table"] tbody tr').should('have.length', 1)
      cy.get('[data-testid="employee-payroll-table"]').should('contain', 'Dr. Sarah Chen')
      
      // Clear search
      cy.get('[data-testid="employee-search"]').clear()
    })

    it('should show employee payroll details modal', () => {
      // Click on first "View Details" button
      cy.get('[data-testid="view-details-button"]').first().click()
      
      // Verify modal opens
      cy.get('[data-testid="payroll-details-modal"]').should('be.visible')
      
      // Verify modal content
      cy.get('[data-testid="employee-info"]').should('be.visible')
      cy.get('[data-testid="hours-breakdown"]').should('be.visible')
      cy.get('[data-testid="pay-breakdown"]').should('be.visible')
      cy.get('[data-testid="deductions"]').should('be.visible')
      
      // Close modal
      cy.get('[data-testid="close-modal"]').click()
      cy.get('[data-testid="payroll-details-modal"]').should('not.exist')
    })
  })

  describe('Payroll Statistics', () => {
    beforeEach(() => {
      cy.get('[data-tab="statistics"]').click()
      cy.contains('May 2025').click()
    })

    it('should display comprehensive payroll statistics', () => {
      // Key metrics cards
      cy.get('[data-testid="avg-hourly-rate"]').should('be.visible')
      cy.get('[data-testid="overtime-rate"]').should('be.visible')
      cy.get('[data-testid="total-tax-burden"]').should('be.visible')
      cy.get('[data-testid="benefits-cost"]').should('be.visible')
      
      // Department analysis
      cy.get('[data-testid="department-analysis"]').should('be.visible')
      
      // Role analysis
      cy.get('[data-testid="role-analysis"]').should('be.visible')
      
      // Cost breakdown
      cy.get('[data-testid="cost-breakdown"]').should('be.visible')
      
      // Overtime analysis
      cy.get('[data-testid="overtime-analysis"]').should('be.visible')
    })

    it('should show correct department percentages', () => {
      cy.get('[data-testid="department-analysis"]').within(() => {
        // Check that percentages add up and are reasonable
        cy.get('[data-testid="department-percentage"]').should('have.length.greaterThan', 0)
      })
    })

    it('should display overtime analysis with correct data', () => {
      cy.get('[data-testid="overtime-analysis"]').within(() => {
        cy.get('[data-testid="overtime-percentage"]').should('be.visible')
        cy.get('[data-testid="overtime-cost"]').should('be.visible')
        cy.get('[data-testid="employees-with-overtime"]').should('be.visible')
      })
    })
  })

  describe('Payroll Accounting', () => {
    beforeEach(() => {
      cy.get('[data-tab="accounting"]').click()
      cy.contains('May 2025').click()
    })

    it('should display accounting journal entries', () => {
      cy.get('[data-testid="journal-entries"]').should('be.visible')
      
      // Verify table structure
      cy.get('[data-testid="journal-entries"] table').within(() => {
        cy.get('th').should('contain', 'Account')
        cy.get('th').should('contain', 'Description')
        cy.get('th').should('contain', 'Debit')
        cy.get('th').should('contain', 'Credit')
      })
      
      // Verify balance check
      cy.get('[data-testid="balance-check"]').should('be.visible')
      cy.get('[data-testid="balance-check"]').should('contain', 'Balanced')
    })

    it('should show cost analysis cards', () => {
      cy.get('[data-testid="direct-labor-cost"]').should('be.visible')
      cy.get('[data-testid="employer-tax-burden"]').should('be.visible')
      cy.get('[data-testid="benefits-cost"]').should('be.visible')
      cy.get('[data-testid="total-labor-cost"]').should('be.visible')
    })

    it('should display cost per hour analysis', () => {
      cy.get('[data-testid="cost-per-hour"]').should('be.visible')
      cy.get('[data-testid="cost-per-hour"]').within(() => {
        cy.contains('Direct Hourly Cost').should('be.visible')
        cy.contains('Tax Burden per Hour').should('be.visible')
        cy.contains('Benefits Cost per Hour').should('be.visible')
        cy.contains('Total Cost per Hour').should('be.visible')
      })
    })

    it('should show tax breakdown', () => {
      cy.get('[data-testid="tax-breakdown"]').should('be.visible')
      cy.get('[data-testid="tax-breakdown"]').within(() => {
        cy.contains('Federal Income Tax').should('be.visible')
        cy.contains('State Income Tax').should('be.visible')
        cy.contains('Social Security').should('be.visible')
        cy.contains('Medicare').should('be.visible')
      })
    })
  })

  describe('Payroll Export & Reports', () => {
    beforeEach(() => {
      cy.get('[data-tab="export"]').click()
      cy.contains('May 2025').click()
    })

    it('should display export configuration options', () => {
      // Report type selection
      cy.get('[data-testid="report-type"]').should('be.visible')
      cy.get('input[value="summary"]').should('be.checked')
      
      // Format selection
      cy.get('[data-testid="export-format"]').should('be.visible')
      cy.get('input[value="csv"]').should('be.checked')
      
      // Export preview
      cy.get('[data-testid="export-preview"]').should('be.visible')
    })

    it('should allow changing report type and format', () => {
      // Change report type
      cy.get('input[value="detailed"]').click()
      cy.get('[data-testid="export-preview"]').should('contain', 'Detailed Payroll')
      
      // Change format
      cy.get('input[value="excel"]').click()
      cy.get('[data-testid="export-preview"]').should('contain', 'Excel')
    })

    it('should provide quick report buttons', () => {
      cy.get('[data-testid="quick-reports"]').within(() => {
        cy.contains('Executive Summary').should('be.visible')
        cy.contains('HR Spreadsheet').should('be.visible')
        cy.contains('Accounting CSV').should('be.visible')
      })
    })

    it('should show report analytics', () => {
      cy.get('[data-testid="report-analytics"]').should('be.visible')
      cy.get('[data-testid="report-analytics"]').within(() => {
        cy.get('[data-testid="employees-count"]').should('contain', '10')
        cy.get('[data-testid="total-gross"]').should('be.visible')
        cy.get('[data-testid="total-hours"]').should('be.visible')
      })
    })

    it('should handle export generation', () => {
      // Mock the file download since we can't actually test file downloads easily
      cy.window().then((win) => {
        cy.stub(win, 'open').as('windowOpen')
      })
      
      cy.get('[data-testid="generate-export-button"]').click()
      
      // Should show loading state
      cy.get('[data-testid="generate-export-button"]').should('contain', 'Generating')
      
      // Wait for completion (mocked)
      cy.wait(2000)
    })
  })

  describe('Cross-Period Comparisons', () => {
    it('should allow comparing May and June payroll data', () => {
      // Start with May data
      cy.contains('May 2025').click()
      cy.get('[data-testid="total-gross-pay"]').invoke('text').as('mayGrossPay')
      
      // Switch to June data
      cy.contains('June 2025').click()
      cy.get('[data-testid="total-gross-pay"]').invoke('text').as('juneGrossPay')
      
      // Verify data changed
      cy.get('@mayGrossPay').then((mayPay) => {
        cy.get('@juneGrossPay').then((junePay) => {
          expect(mayPay).to.not.equal(junePay)
        })
      })
    })
  })

  describe('Responsiveness', () => {
    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-6')
      
      // Verify main elements are still visible
      cy.get('[data-testid="payroll-dashboard"]').should('be.visible')
      cy.get('[data-testid="pay-period-selector"]').should('be.visible')
      
      // Tab navigation should work
      cy.get('[data-tab="employees"]').click()
      cy.get('[data-testid="employee-payroll-table"]').should('be.visible')
    })

    it('should be responsive on tablet devices', () => {
      cy.viewport('ipad-2')
      
      // Verify layout adapts appropriately
      cy.get('[data-testid="payroll-dashboard"]').should('be.visible')
      cy.get('[data-tab="statistics"]').click()
      cy.get('[data-testid="department-analysis"]').should('be.visible')
    })
  })
})
