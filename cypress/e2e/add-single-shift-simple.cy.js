describe('Add Single Shift Today - Simple Test', () => {
  it('should add exactly one shift today to Sarah Johnson', () => {
    // Navigate to scheduler
    cy.visit('http://localhost:5173/')
    cy.get('body', { timeout: 15000 }).should('be.visible')
    cy.get('[data-nav-item="scheduler"]', { timeout: 10000 }).click()
    cy.contains('Staff Scheduler').should('be.visible')
    
    // Go to current week (today)
    cy.get('[data-testid="today-button"]').click()
    cy.wait(1000)
    
    // Calculate today's day index (Monday = 0, Tuesday = 1, etc.)
    const today = new Date()
    const todayIndex = (today.getDay() + 6) % 7 // Convert to Monday=0 format
    
    // Clear any existing shifts for Sarah Johnson on today (first employee, today's column)
    cy.get('[data-testid="employee-row"]').first().within(() => {
      cy.get(`[data-day="${todayIndex}"]`).then(($dayColumn) => {
        // Check if there are any existing shifts to delete
        if ($dayColumn.find('[data-testid="shift-card"]').length > 0) {
          cy.wrap($dayColumn).within(() => {
            cy.get('button[title="Delete shift"]').each(($btn) => {
              cy.wrap($btn).click({ force: true })
              cy.wait(200)
            })
          })
        }
      })
    })
    cy.wait(500)
    
    // Open Add Shift modal
    cy.get('[data-testid="add-shift-button"]').click()
    cy.wait(500)
    
    // Fill out the form for Sarah Johnson using test attributes
    cy.get('[data-testid="employee-select"]').select('emp1') // Select Sarah Johnson
    cy.get('[data-testid="day-select"]').select(todayIndex.toString()) // Select today
    cy.get('[data-testid="shift-type-select"]').select('Regular') // Shift type
    cy.get('[data-testid="department-select"]').select('General') // Department
    cy.get('[data-testid="start-time-select"]').select('09:00') // Start time
    cy.get('[data-testid="end-time-select"]').select('17:00') // End time
    
    // Submit the shift
    cy.get('[data-testid="modal-submit-button"]').click()
    cy.wait(1000)
    
    // Verify the shift was added to Sarah Johnson's row (first row)
    cy.get('[data-testid="employee-row"]').first().within(() => {
      cy.get(`[data-day="${todayIndex}"]`).should('contain.text', 'Regular')
      cy.get(`[data-day="${todayIndex}"]`).within(() => {
        // Verify there's exactly one Regular shift
        cy.get('[data-testid="shift-card"][data-shift-type="Regular"]').should('have.length', 1)
        
        // Find the specific shift card with Regular type and verify its contents
        cy.get('[data-testid="shift-card"][data-shift-type="Regular"]').within(() => {
          cy.get('[data-testid="shift-time-display"]').should('contain.text', '09:00')
          cy.get('[data-testid="shift-time-display"]').should('contain.text', '17:00')
          cy.get('[data-testid="shift-duration"]').should('contain.text', '8h')
        })
      })
    })
    
    cy.log('✓ Successfully added one shift today to Sarah Johnson')
  })
})
