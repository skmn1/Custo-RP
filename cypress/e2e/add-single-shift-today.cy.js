describe('Add Single Shift Today Test', () => {
  it('should add one shift today to Sarah Johnson using Add Shift modal', () => {
    // Step 1: Open home page and wait for it to load
    cy.visit('http://localhost:5173/')
    
    // Wait for page to load
    cy.get('body', { timeout: 15000 }).should('be.visible')
    cy.wait(2000)
    cy.log('✓ Home page loaded')
    
    // Step 2: Navigate to Staff Scheduler
    cy.get('[data-nav-item="scheduler"]', { timeout: 10000 }).should('be.visible').click()
    cy.wait(2000)
    cy.contains('Staff Scheduler', { timeout: 10000 }).should('be.visible')
    cy.log('✓ Navigated to Staff Scheduler')
    
    // Step 3: Make sure we're viewing the current week (today)
    cy.get('[data-testid="today-button"]').should('be.visible').click()
    cy.wait(1000)
    cy.log('✓ Navigated to current week')
    
    // Step 4: Open Add Shift modal
    cy.get('[data-testid="add-shift-button"]').should('be.visible').click()
    cy.wait(1000)
    cy.log('✓ Opened Add Shift modal')
    
    // Step 5: Get today's day of week (0 = Monday, 1 = Tuesday, etc.)
    const today = new Date()
    const dayOfWeek = (today.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0 format
    
    // Step 6: Add a single shift to Sarah Johnson for today using test attributes
    cy.get('[data-testid="employee-select"]').select('emp1') // Select Sarah Johnson
    cy.get('[data-testid="day-select"]').select(dayOfWeek.toString()) // Select today
    cy.get('[data-testid="shift-type-select"]').select('Regular') // Shift type
    cy.get('[data-testid="department-select"]').select('General') // Department
    cy.get('[data-testid="start-time-select"]').select('09:00') // Start time
    cy.get('[data-testid="end-time-select"]').select('17:00') // End time (8-hour shift)
    
    // Step 7: Submit the shift
    cy.get('[data-testid="modal-submit-button"]').click()
    cy.wait(2000)
    cy.log('✓ Added single shift to Sarah Johnson for today')
    
    // Step 8: Verify the shift was added using test attributes
    cy.get('[data-testid="employee-row"]').first().within(() => {
      // Check that today's column has the Regular shift
      cy.get(`[data-day="${dayOfWeek}"]`).should('contain.text', 'Regular')
      cy.get(`[data-day="${dayOfWeek}"]`).within(() => {
        cy.get('[data-testid="shift-card"][data-shift-type="Regular"]').within(() => {
          cy.get('[data-testid="shift-time-display"]').should('contain.text', '09:00')
          cy.get('[data-testid="shift-time-display"]').should('contain.text', '17:00')
        })
      })
    })
    cy.log('✓ Verified shift appears in Sarah Johnson\'s schedule for today')
    
    // Step 9: Verify shift duration shows correctly
    cy.get('[data-testid="employee-row"]').first().within(() => {
      cy.get(`[data-day="${dayOfWeek}"]`).within(() => {
        cy.get('[data-testid="shift-card"][data-shift-type="Regular"]').within(() => {
          cy.get('[data-testid="shift-duration"]').should('contain.text', '8h')
        })
      })
    })
    cy.log('✓ Verified shift duration is displayed correctly (8 hours)')
    
    // Step 10: Test shift interaction - click to edit time
    cy.get('[data-testid="employee-row"]').first().within(() => {
      cy.get(`[data-day="${dayOfWeek}"]`).within(() => {
        // Click on the time to open edit dropdown for the Regular shift
        cy.get('[data-testid="shift-card"][data-shift-type="Regular"]').within(() => {
          cy.get('[data-testid="shift-time-display"]').click()
        })
        cy.wait(500)
        cy.log('✓ Opened time edit dropdown')
        
        // Close the dropdown by clicking elsewhere
        cy.get('body').click(0, 0)
        cy.wait(500)
        cy.log('✓ Closed time edit dropdown')
      })
    })
    
    // Step 11: Test shift deletion capability
    cy.get('[data-testid="employee-row"]').first().within(() => {
      cy.get(`[data-day="${dayOfWeek}"]`).within(() => {
        // Hover over shift to show delete button
        cy.get('[data-testid="shift-card"][data-shift-type="Regular"]').trigger('mouseover')
        cy.wait(300)
        
        // Verify delete button appears on hover
        cy.get('[data-testid="shift-card"][data-shift-type="Regular"]').within(() => {
          cy.get('button[title="Delete shift"]').should('be.visible')
        })
        cy.log('✓ Verified delete button appears on hover')
        
        // Don't actually delete - just verify it's there
        cy.get('[data-testid="shift-card"][data-shift-type="Regular"]').trigger('mouseout')
      })
    })
    
    // Step 12: Verify the shift persists when navigating away and back
    cy.get('[data-nav-item="employees"]').should('be.visible').click()
    cy.wait(1000)
    cy.get('[data-nav-item="scheduler"]').should('be.visible').click()
    cy.wait(1000)
    
    // Ensure we're still on today's week
    cy.get('[data-testid="today-button"]').click()
    cy.wait(1000)
    
    // Verify shift is still there
    cy.get('[data-testid="employee-row"]').first().within(() => {
      cy.get(`[data-day="${dayOfWeek}"]`).should('contain.text', 'Regular')
      cy.get(`[data-day="${dayOfWeek}"]`).within(() => {
        cy.get('[data-testid="shift-card"][data-shift-type="Regular"]').within(() => {
          cy.get('[data-testid="shift-time-display"]').should('contain.text', '09:00')
        })
      })
    })
    cy.log('✓ Verified shift persists after navigation')
    
    // Test completed successfully
    cy.log('✓ Test completed successfully!')
    cy.log('✓ Successfully added and verified one shift today for Sarah Johnson')
  })
  
  it('should handle adding shift for different time slots today', () => {
    // Step 1: Navigate to scheduler
    cy.visit('http://localhost:5173/')
    cy.get('body', { timeout: 15000 }).should('be.visible')
    cy.get('[data-nav-item="scheduler"]', { timeout: 10000 }).should('be.visible').click()
    cy.wait(2000)
    
    // Step 2: Go to current week
    cy.get('[data-testid="today-button"]').should('be.visible').click()
    cy.wait(1000)
    
    // Step 3: Add an early morning shift
    cy.get('[data-testid="add-shift-button"]').should('be.visible').click()
    cy.wait(1000)
    
    const today = new Date()
    const dayOfWeek = (today.getDay() + 6) % 7
    
    cy.get('[data-testid="employee-select"]').select('emp1') // Sarah Johnson
    cy.get('[data-testid="day-select"]').select(dayOfWeek.toString()) // Today
    cy.get('[data-testid="shift-type-select"]').select('Overtime') // Different shift type
    cy.get('[data-testid="department-select"]').select('Service') // Different department
    cy.get('[data-testid="start-time-select"]').select('06:00') // Early start
    cy.get('[data-testid="end-time-select"]').select('12:00') // 6-hour shift
    
    cy.get('[data-testid="modal-submit-button"]').click()
    cy.wait(2000)
    cy.log('✓ Added early morning shift to Sarah Johnson')
    
    // Step 4: Verify the new shift
    cy.get('[data-testid="employee-row"]').first().within(() => {
      cy.get(`[data-day="${dayOfWeek}"]`).should('contain.text', 'Overtime')
      cy.get(`[data-day="${dayOfWeek}"]`).within(() => {
        cy.get('[data-testid="shift-time-display"]').should('contain.text', '06:00')
        cy.get('[data-testid="shift-time-display"]').should('contain.text', '12:00')
        cy.get('[data-testid="shift-duration"]').should('contain.text', '6h')
      })
    })
    cy.log('✓ Verified early morning shift details')
    
    // Step 5: Test that Sarah Johnson now has multiple shifts today
    cy.get('[data-testid="employee-row"]').first().within(() => {
      // Should have both Regular and Overtime shifts
      cy.get(`[data-day="${dayOfWeek}"]`).should('contain.text', 'Regular')
      cy.get(`[data-day="${dayOfWeek}"]`).should('contain.text', 'Overtime')
    })
    cy.log('✓ Verified Sarah Johnson now has multiple shifts today')
    
    cy.log('✓ Multiple shift test completed successfully!')
  })
})
