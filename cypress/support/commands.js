// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands for the Scheduler Pro application

// Navigation commands
Cypress.Commands.add('navigateToPayroll', () => {
  cy.get('[data-testid="nav-payroll"]').click()
  cy.url().should('include', '/payroll')
})

Cypress.Commands.add('navigateToEmployees', () => {
  cy.get('[data-testid="nav-employees"]').click()
  cy.url().should('include', '/employees')
})

Cypress.Commands.add('navigateToScheduler', () => {
  cy.get('[data-testid="nav-scheduler"]').click()
  cy.url().should('include', '/scheduler')
})

// Payroll specific commands
Cypress.Commands.add('selectPayrollPeriod', (period) => {
  if (period === 'may') {
    cy.get('[data-testid="historical-may-button"]').click()
  } else if (period === 'june') {
    cy.get('[data-testid="historical-june-button"]').click()
  }
})

Cypress.Commands.add('verifyPayrollSummary', (expectedData) => {
  if (expectedData.totalGrossPay) {
    cy.get('[data-testid="total-gross-pay"]').should('contain', expectedData.totalGrossPay)
  }
  if (expectedData.totalNetPay) {
    cy.get('[data-testid="total-net-pay"]').should('contain', expectedData.totalNetPay)
  }
  if (expectedData.totalHours) {
    cy.get('[data-testid="total-hours"]').should('contain', expectedData.totalHours)
  }
})

// Employee management commands
Cypress.Commands.add('addEmployee', (employee) => {
  cy.get('[data-testid="add-employee-button"]').click()
  cy.get('[data-testid="employee-name-input"]').type(employee.name)
  cy.get('[data-testid="employee-role-select"]').select(employee.role)
  cy.get('[data-testid="employee-department-select"]').select(employee.department)
  cy.get('[data-testid="employee-email-input"]').type(employee.email)
  cy.get('[data-testid="save-employee-button"]').click()
})

Cypress.Commands.add('searchEmployee', (searchTerm) => {
  cy.get('[data-testid="employee-search-input"]').clear().type(searchTerm)
})

// Shift management commands
Cypress.Commands.add('addShift', (shift) => {
  cy.get('[data-testid="add-shift-button"]').click()
  cy.get('[data-testid="shift-employee-select"]').select(shift.employeeName)
  cy.get('[data-testid="shift-start-time"]').type(shift.startTime)
  cy.get('[data-testid="shift-end-time"]').type(shift.endTime)
  cy.get('[data-testid="shift-type-select"]').select(shift.type)
  cy.get('[data-testid="save-shift-button"]').click()
})

// Utility commands
Cypress.Commands.add('waitForLoader', () => {
  cy.get('[data-testid="loading-spinner"]', { timeout: 10000 }).should('not.exist')
})

Cypress.Commands.add('verifyToast', (message) => {
  cy.get('[data-testid="toast-message"]').should('contain', message)
})

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
