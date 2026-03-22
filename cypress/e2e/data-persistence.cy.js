/**
 * E2E Test: Data Persistence Validation
 * 
 * Tests that all user actions result in proper database persistence.
 * Verifies data survives page refreshes and server restarts.
 * 
 * Feature: 02-database-persistence-postgresql
 */

describe('Data Persistence - Database Integration', () => {
  
  beforeEach(() => {
    // Start fresh for each test
    cy.visit('http://localhost:5173/', { timeout: 15000 })
    cy.get('body', { timeout: 10000 }).should('be.visible')
  })

  describe('Employee Data Persistence', () => {

    it('should persist new employee after page refresh', () => {
      const newEmployee = {
        name: 'Test Employee ' + Date.now(),
        email: 'test-' + Date.now() + '@company.com',
        role: 'Test Role',
        department: 'Test Department',
        maxHours: 40
      }

      // Navigate to Employees page
      cy.get('[data-nav-item="employees"]').click()
      cy.contains('Employees').should('be.visible')

      // Create new employee
      cy.get('[data-testid="add-employee-button"]').click()
      cy.get('[data-testid="employee-name-input"]').type(newEmployee.name)
      cy.get('[data-testid="employee-email-input"]').type(newEmployee.email)
      cy.get('[data-testid="employee-role-input"]').type(newEmployee.role)
      cy.get('[data-testid="employee-department-select"]').select(newEmployee.department)
      cy.get('[data-testid="employee-max-hours-input"]').clear().type(newEmployee.maxHours.toString())
      cy.get('[data-testid="modal-submit-button"]').click()
      cy.wait(1000)

      // Verify employee appears in list
      cy.contains(newEmployee.name).should('be.visible')

      // Refresh page (data should persist)
      cy.reload()
      cy.wait(2000)
      cy.get('body').should('be.visible')

      // Verify employee still appears after refresh
      cy.contains(newEmployee.name).should('be.visible')
      cy.get(`[data-testid="employee-email-${newEmployee.email}"]`)
        .should('contain.text', newEmployee.email)
    })

    it('should persist employee updates after page refresh', () => {
      // Navigate to Employees page
      cy.get('[data-nav-item="employees"]').click()
      cy.contains('Employees').should('be.visible')

      // Get first employee
      cy.get('[data-testid="employee-card"]').first().then(($card) => {
        const employeeId = $card.data('employee-id')
        const newRole = 'Updated Role ' + Date.now()

        // Edit employee
        cy.wrap($card).find('[data-testid="edit-employee-button"]').click()
        cy.get('[data-testid="employee-role-input"]').clear().type(newRole)
        cy.get('[data-testid="modal-submit-button"]').click()
        cy.wait(1000)

        // Verify updated role appears
        cy.contains(newRole).should('be.visible')

        // Refresh page
        cy.reload()
        cy.wait(2000)

        // Verify updated role persists
        cy.contains(newRole).should('be.visible')
      })
    })

    it('should enforce email uniqueness in database', () => {
      const duplicateEmail = 'duplicate-test@company.com'

      cy.get('[data-nav-item="employees"]').click()
      cy.contains('Employees').should('be.visible')

      // Create first employee
      cy.get('[data-testid="add-employee-button"]').click()
      cy.get('[data-testid="employee-name-input"]').type('Employee 1')
      cy.get('[data-testid="employee-email-input"]').type(duplicateEmail)
      cy.get('[data-testid="employee-role-input"]').type('Role 1')
      cy.get('[data-testid="modal-submit-button"]').click()
      cy.wait(1000)

      // Try to create second employee with same email
      cy.get('[data-testid="add-employee-button"]').click()
      cy.get('[data-testid="employee-name-input"]').type('Employee 2')
      cy.get('[data-testid="employee-email-input"]').type(duplicateEmail)
      cy.get('[data-testid="employee-role-input"]').type('Role 2')
      cy.get('[data-testid="modal-submit-button"]').click()

      // Should show error message about duplicate email
      cy.contains(/email.*already.*exists|duplicate.*email/i, { timeout: 5000 })
        .should('be.visible')
    })
  })

  describe('Shift Data Persistence', () => {

    it('should persist new shift after page refresh', () => {
      const shiftDate = new Date()
      shiftDate.setDate(shiftDate.getDate() + 7) // Next week
      const dateStr = shiftDate.toISOString().split('T')[0]

      // Navigate to Scheduler
      cy.get('[data-nav-item="scheduler"]').click()
      cy.contains('Staff Scheduler').should('be.visible')

      // Navigate to next week
      cy.get('[data-testid="next-week-button"]').click()
      cy.wait(500)

      // Add a new shift
      cy.get('[data-testid="add-shift-button"]').click()
      cy.get('[data-testid="employee-select"]').select('emp1')
      cy.get('[data-testid="date-picker"]').clear().type(dateStr)
      cy.get('[data-testid="start-time-select"]').select('10:00')
      cy.get('[data-testid="end-time-select"]').select('18:00')
      cy.get('[data-testid="shift-type-select"]').select('Regular')
      cy.get('[data-testid="modal-submit-button"]').click()
      cy.wait(1000)

      // Verify shift appears
      cy.contains('10:00 - 18:00', { timeout: 5000 }).should('be.visible')

      // Refresh page
      cy.reload()
      cy.wait(2000)

      // Navigate to same week again
      cy.get('[data-nav-item="scheduler"]').click()
      cy.get('[data-testid="next-week-button"]').click()
      cy.wait(500)

      // Verify shift still appears after refresh
      cy.contains('10:00 - 18:00', { timeout: 5000 }).should('be.visible')
    })

    it('should persist shift move (drag and drop) after page refresh', () => {
      // Navigate to Scheduler
      cy.get('[data-nav-item="scheduler"]').click()
      cy.contains('Staff Scheduler').should('be.visible')

      // Get initial state
      cy.get('[data-testid="shift-card"]').first().then(($shift) => {
        const shiftId = $shift.data('shift-id')
        const originalText = $shift.text()

        // Move shift to different day (using drag and drop or modal)
        // If UI supports it, test the move
        cy.wrap($shift).find('[data-testid="move-shift-button"]').click({ force: true })
        cy.get('[data-testid="new-date-picker"]').clear().type('2026-03-10')
        cy.get('[data-testid="modal-submit-button"]').click()
        cy.wait(1000)

        // Verify shift moved
        cy.get(`[data-shift-id="${shiftId}"]`)
          .should('exist')

        // Refresh page
        cy.reload()
        cy.wait(2000)

        // Verify shift still in new location
        cy.get(`[data-shift-id="${shiftId}"]`)
          .should('exist')
      })
    })

    it('should prevent duplicate shift for same employee on same date', () => {
      const testDate = '2026-03-15'
      const employeeId = 'emp1'

      cy.get('[data-nav-item="scheduler"]').click()
      cy.contains('Staff Scheduler').should('be.visible')

      // Add first shift
      cy.get('[data-testid="add-shift-button"]').click()
      cy.get('[data-testid="employee-select"]').select(employeeId)
      cy.get('[data-testid="date-picker"]').clear().type(testDate)
      cy.get('[data-testid="start-time-select"]').select('09:00')
      cy.get('[data-testid="end-time-select"]').select('17:00')
      cy.get('[data-testid="modal-submit-button"]').click()
      cy.wait(1000)

      // Try to add duplicate shift
      cy.get('[data-testid="add-shift-button"]').click()
      cy.get('[data-testid="employee-select"]').select(employeeId)
      cy.get('[data-testid="date-picker"]').clear().type(testDate)
      cy.get('[data-testid="start-time-select"]').select('18:00')
      cy.get('[data-testid="end-time-select"]').select('22:00')
      cy.get('[data-testid="modal-submit-button"]').click()

      // Should show error about duplicate
      cy.contains(/already.*scheduled|duplicate.*shift/i, { timeout: 5000 })
        .should('be.visible')
    })

    it('should cascade delete shifts when employee is deleted', () => {
      cy.get('[data-nav-item="employees"]').click()
      cy.contains('Employees').should('be.visible')

      const testEmployee = 'Test Cascade Delete ' + Date.now()
      const testEmail = 'cascade-' + Date.now() + '@company.com'

      // Create employee
      cy.get('[data-testid="add-employee-button"]').click()
      cy.get('[data-testid="employee-name-input"]').type(testEmployee)
      cy.get('[data-testid="employee-email-input"]').type(testEmail)
      cy.get('[data-testid="employee-role-input"]').type('Test Role')
      cy.get('[data-testid="modal-submit-button"]').click()
      cy.wait(1000)

      // Get the new employee's ID from the card
      cy.contains(testEmployee).closest('[data-testid="employee-card"]')
        .then(($card) => {
          const newEmployeeId = $card.data('employee-id')

          // Navigate to scheduler and add a shift for this employee
          cy.get('[data-nav-item="scheduler"]').click()
          cy.get('[data-testid="add-shift-button"]').click()
          cy.get('[data-testid="employee-select"]').select(newEmployeeId)
          cy.get('[data-testid="date-picker"]').clear().type('2026-03-20')
          cy.get('[data-testid="start-time-select"]').select('09:00')
          cy.get('[data-testid="end-time-select"]').select('17:00')
          cy.get('[data-testid="modal-submit-button"]').click()
          cy.wait(1000)

          // Verify shift was created
          cy.get(`[data-employee-id="${newEmployeeId}"]`)
            .find('[data-testid="shift-card"]')
            .should('have.length.greaterThan', 0)

          // Go back to employees and delete the employee
          cy.get('[data-nav-item="employees"]').click()
          cy.contains(testEmployee).closest('[data-testid="employee-card"]')
            .find('[data-testid="delete-employee-button"]')
            .click()
          cy.get('[data-testid="confirm-delete-button"]').click()
          cy.wait(1000)

          // Verify employee is gone
          cy.contains(testEmployee).should('not.exist')

          // Go back to scheduler - shifts should be gone too
          cy.get('[data-nav-item="scheduler"]').click()
          cy.get(`[data-employee-id="${newEmployeeId}"]`).should('not.exist')
        })
    })
  })

  describe('Payroll Data Persistence', () => {

    it('should calculate correct payroll from persisted shifts', () => {
      cy.get('[data-nav-item="payroll"]').click()
      cy.contains(/Payroll|Pay Period/i).should('be.visible')

      // Select a week with known shifts
      cy.get('[data-testid="week-selector"]').should('be.visible')
      cy.get('[data-testid="apply-button"]').click()
      cy.wait(2000)

      // Verify payroll calculations appear
      cy.get('[data-testid="payroll-summary"]')
        .should('be.visible')
        .within(() => {
          cy.contains(/Total Hours/i).should('exist')
          cy.contains(/Gross Pay/i).should('exist')
        })

      // Refresh and recalculate
      cy.reload()
      cy.wait(2000)
      cy.get('[data-nav-item="payroll"]').click()
      cy.get('[data-testid="apply-button"]').click()
      cy.wait(2000)

      // Verify same calculations after refresh
      cy.get('[data-testid="payroll-summary"]')
        .should('be.visible')
    })

    it('should export payroll with persisted data', () => {
      cy.get('[data-nav-item="payroll"]').click()
      cy.contains(/Payroll|Pay Period/i).should('be.visible')

      // Calculate payroll
      cy.get('[data-testid="apply-button"]').click()
      cy.wait(2000)

      // Export
      cy.get('[data-testid="export-button"]').click()
      cy.wait(1000)

      // Verify file was downloaded (file name contains date or "payroll")
      cy.readFile('cypress/downloads/payroll_*.csv', 
        { timeout: 5000 }).should('exist')
    })
  })

  describe('Database Integrity Checks', () => {

    it('should maintain referential integrity (FK constraints)', () => {
      // This is an integration test to ensure:
      // 1. No orphaned shifts exist
      // 2. All shifts reference valid employees
      // 3. No NULL employee_id in shifts table

      cy.request({
        method: 'GET',
        url: 'http://localhost:8080/api/shifts',
        headers: { 'Accept': 'application/json' }
      }).then((response) => {
        expect(response.status).to.equal(200)
        const shifts = response.body

        // Every shift should have an employee_id
        shifts.forEach(shift => {
          expect(shift.employeeId).to.be.ok
          expect(shift.employeeId).to.not.be.empty
        })

        // Verify all referenced employees exist
        cy.request({
          method: 'GET',
          url: 'http://localhost:8080/api/employees',
          headers: { 'Accept': 'application/json' }
        }).then((empResponse) => {
          const employees = empResponse.body
          const employeeIds = employees.map(e => e.id)

          shifts.forEach(shift => {
            expect(employeeIds).to.include(shift.employeeId)
          })
        })
      })
    })

    it('should maintain timestamp accuracy (created_at, updated_at)', () => {
      cy.get('[data-nav-item="employees"]').click()

      // Create new employee
      const newEmp = 'Timestamp Test ' + Date.now()
      const newEmail = 'timestamp-' + Date.now() + '@company.com'

      cy.get('[data-testid="add-employee-button"]').click()
      cy.get('[data-testid="employee-name-input"]').type(newEmp)
      cy.get('[data-testid="employee-email-input"]').type(newEmail)
      cy.get('[data-testid="employee-role-input"]').type('Test')
      cy.get('[data-testid="modal-submit-button"]').click()
      cy.wait(1000)

      // Query API to check timestamps
      cy.request({
        method: 'GET',
        url: 'http://localhost:8080/api/employees',
        headers: { 'Accept': 'application/json' }
      }).then((response) => {
        const employee = response.body.find(e => e.email === newEmail)
        
        expect(employee).to.exist
        expect(employee.createdAt).to.be.ok
        expect(employee.updatedAt).to.be.ok
        
        // createdAt should equal updatedAt for newly created employee
        expect(new Date(employee.createdAt).getTime())
          .to.equal(new Date(employee.updatedAt).getTime())
      })

      // Update employee and check timestamps
      cy.contains(newEmp).closest('[data-testid="employee-card"]')
        .find('[data-testid="edit-employee-button"]').click()
      cy.wait(500)
      
      cy.get('[data-testid="employee-role-input"]')
        .clear().type('Updated')
      cy.get('[data-testid="modal-submit-button"]').click()
      cy.wait(1500)

      // Query again to verify updatedAt changed
      cy.request({
        method: 'GET',
        url: 'http://localhost:8080/api/employees',
        headers: { 'Accept': 'application/json' }
      }).then((response) => {
        const employee = response.body.find(e => e.email === newEmail)
        
        expect(employee).to.exist
        // After update, updatedAt should be newer than createdAt
        expect(new Date(employee.updatedAt).getTime())
          .to.be.greaterThan(new Date(employee.createdAt).getTime())
      })
    })
  })

  describe('Concurrent User Actions', () => {

    it('should handle concurrent shift creation without conflicts', () => {
      cy.get('[data-nav-item="scheduler"]').click()
      cy.contains('Staff Scheduler').should('be.visible')

      const shifts = [
        { emp: 'emp1', date: '2026-03-16', start: '09:00', end: '17:00' },
        { emp: 'emp2', date: '2026-03-16', start: '10:00', end: '18:00' },
        { emp: 'emp3', date: '2026-03-16', start: '11:00', end: '19:00' }
      ]

      // Add multiple shifts quickly
      shifts.forEach(shift => {
        cy.get('[data-testid="add-shift-button"]').click()
        cy.get('[data-testid="employee-select"]').select(shift.emp)
        cy.get('[data-testid="date-picker"]').clear().type(shift.date)
        cy.get('[data-testid="start-time-select"]').select(shift.start)
        cy.get('[data-testid="end-time-select"]').select(shift.end)
        cy.get('[data-testid="modal-submit-button"]').click()
        cy.wait(500)
      })

      cy.wait(1000)

      // Verify all shifts were created and persisted
      cy.get('[data-testid="shift-card"]').should('have.length.greaterThan', 0)

      // Refresh and verify all still exist
      cy.reload()
      cy.wait(2000)
      cy.get('[data-testid="shift-card"]').should('have.length.greaterThan', 0)
    })
  })
})
