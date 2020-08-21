import * as loginPage from '../support/pages/login'

describe('Login page', function () {
  beforeEach(function () {
    this.baseUrl = Cypress.config('baseUrl')

    cy.logout()
    cy.visit('/')
  })

  it('logs in successfully', function () {
    const email = 'ebrown@jigowatts.com'
    const password = 'GreatScott!'

    cy.url().should('have.urlPath', '/login')

    loginPage.email().type(email)
    loginPage.password().type(password)
    loginPage.logIn().click()

    cy.url().should('have.urlPath', '/')
  })

  it('fails to login with incorrect credentials', function () {
    const email = 'fake@example.com'
    const password = 'badpassword1'

    cy.url().should('have.urlPath', '/login')

    loginPage.email().type(email)
    loginPage.password().type(password)
    loginPage.logIn().click()

    cy.url().should('have.urlPath', '/login')

    loginPage.error().should('contain', 'Unauthorized')
  })
})
