describe('Debug Test', () => {
  it('should find and click payroll button', () => {
    cy.visit('/')
    cy.wait(2000) // Wait for app to load
    
    // Take a screenshot to see what's on the page
    cy.screenshot('homepage')
    
    // Check if we can find navigation
    cy.get('nav').should('exist')
    
    // Look for payroll text specifically
    cy.contains('Payroll').should('be.visible').click()
    
    // Wait and take another screenshot
    cy.wait(1000)
    cy.screenshot('after-payroll-click')
  })
})
