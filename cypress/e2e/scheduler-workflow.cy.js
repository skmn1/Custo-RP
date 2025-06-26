describe('Staff Scheduler Workflow Test', () => {
  it('should add 3 shifts to Sarah Johnson using Add Shift modal and test complete workflow', () => {
    // Step 1: Open home page and wait 3 seconds (with flexible URL handling)
    cy.visit('http://localhost:5173/')
    
    // Wait for page to load
    cy.get('body', { timeout: 15000 }).should('be.visible')
    cy.wait(3000)
    cy.log('✓ Home page loaded')
    
    // Step 2: Navigate to Staff Scheduler and wait 3 seconds
    cy.get('[data-nav-item="scheduler"]', { timeout: 10000 }).should('be.visible').click()
    cy.wait(3000)
    cy.contains('Staff Scheduler', { timeout: 10000 }).should('be.visible')
    cy.log('✓ Navigated to Staff Scheduler')
    
    // Step 3: Use Add Shift button to add 3 shifts to Sarah Johnson on the same day
    cy.get('button').contains('Add Shift').should('be.visible').click()
    cy.wait(1000)
    cy.log('✓ Opened Add Shift modal')
    
    // First shift - Morning (06:00-14:00)
    cy.get('select').eq(0).select('emp1') // Select Sarah Johnson
    cy.get('select').eq(1).select('0') // Select Monday
    cy.get('select').eq(2).select('Regular') // Shift type
    cy.get('select').eq(3).select('General') // Department
    cy.get('select').eq(4).select('06:00') // Start time
    cy.get('select').eq(5).select('14:00') // End time
    cy.get('button').contains('Add Shift').click()
    cy.wait(1500)
    cy.log('✓ Added first shift (Morning) to Sarah Johnson')
    
    // Second shift - Evening (16:00-22:00) 
    cy.get('button').contains('Add Shift').should('be.visible').click()
    cy.wait(1000)
    cy.get('select').eq(0).select('emp1') // Select Sarah Johnson
    cy.get('select').eq(1).select('0') // Select Monday (same day)
    cy.get('select').eq(2).select('Overtime') // Shift type
    cy.get('select').eq(3).select('Service') // Department
    cy.get('select').eq(4).select('16:00') // Start time
    cy.get('select').eq(5).select('22:00') // End time
    cy.get('button').contains('Add Shift').click()
    cy.wait(1500)
    cy.log('✓ Added second shift (Evening) to Sarah Johnson')
    
    // Third shift - Night (23:00-06:00)
    cy.get('button').contains('Add Shift').should('be.visible').click()
    cy.wait(1000)
    cy.get('select').eq(0).select('emp1') // Select Sarah Johnson
    cy.get('select').eq(1).select('0') // Select Monday (same day)
    cy.get('select').eq(2).select('Training') // Shift type
    cy.get('select').eq(3).select('Management') // Department
    cy.get('select').eq(4).select('23:00') // Start time
    cy.get('select').eq(5).select('06:00') // End time (next day)
    cy.get('button').contains('Add Shift').click()
    cy.wait(3000)
    cy.log('✓ Added third shift (Night) to Sarah Johnson')
    
    // Step 4: Verify Sarah Johnson has 3 shifts on Monday and navigate to next week
    cy.get('[data-testid="employee-row"]').first().within(() => {
      // Check that Monday (day 0) has 3 shifts for Sarah Johnson
      cy.get('[data-day="0"]').should('contain.text', 'Regular')
      cy.get('[data-day="0"]').should('contain.text', 'Overtime') 
      cy.get('[data-day="0"]').should('contain.text', 'Training')
    })
    cy.wait(1000)
    cy.log('✓ Verified Sarah Johnson has 3 shifts on Monday')
    
    cy.get('[data-testid="next-week-button"]').should('be.visible').click()
    cy.wait(3000)
    cy.log('✓ Navigated to next week')
    
    // Step 5: Add two quick shifts to the second employee (Michael Chen) and wait 3 seconds
    cy.get('[data-testid="employee-row"]').eq(1).within(() => {
      // Add first shift to day 0
      cy.get('[data-day="0"]').click()
    })
    cy.wait(1500) // Half time between shifts
    
    cy.get('[data-testid="employee-row"]').eq(1).within(() => {
      // Add second shift to day 1
      cy.get('[data-day="1"]').click()
    })
    cy.wait(3000)
    cy.log('✓ Added two shifts to second employee (Michael Chen)')
    
    // Step 6: Go back to previous week to see Sarah Johnson's 3 shifts
    cy.get('[data-testid="prev-week-button"]').should('be.visible').click()
    cy.wait(3000)
    cy.log('✓ Navigated back to previous week')
    
    // Step 7: Verify Sarah Johnson still has her 3 shifts and delete one shift from the third employee
    cy.get('[data-testid="employee-row"]').first().within(() => {
      cy.get('[data-day="0"]').should('contain.text', 'Regular')
    })
    cy.log('✓ Verified Sarah Johnson still has her shifts')
    
    cy.get('[data-testid="employee-row"]').eq(2).within(() => {
      // Use a more robust approach to find and delete shifts
      cy.get('[data-day]').each(($day) => {
        cy.wrap($day).within(() => {
          // Check if there are any delete buttons in this day and click each one
          cy.get('button[title="Delete shift"]').then(($buttons) => {
            if ($buttons.length > 0) {
              // Click each button individually
              cy.wrap($buttons).each(($button) => {
                cy.wrap($button).click()
                cy.wait(300) // Small delay between deletions
              })
            }
          })
        })
      })
    })
    cy.wait(3000)
    cy.log('✓ Deleted shifts for third employee')
    
    // Step 8: Navigate to payroll page and wait 3 seconds
    cy.get('[data-nav-item="payroll"]').should('be.visible').click()
    cy.wait(3000)
    
    // Test completed - payroll page should be visible
    cy.contains('Payroll Management').should('be.visible')
    cy.log('✓ Navigated to payroll page - Test completed successfully!')
    cy.log('✓ Successfully tested: 3 shifts added to Sarah Johnson using Add Shift modal, navigation, and shift management')
  })
})