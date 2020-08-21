import { buildApiUrl } from '../../support/api'

describe('REST API: login', function () {
  it('returns a token with user claims', () => {
    const email = Cypress.env('USER_EMAIL')
    const password = Cypress.env('USER_PASSWORD')
    const name = Cypress.env('USER_NAME')

    cy.request('POST', buildApiUrl('/login'), { email, password })
      .its('body.token')
      .should('not.be.empty')
      .then((token) => token.split('.')[1])
      .then((claims) => JSON.parse(atob(claims)))
      .then(({ user }) => {
        expect(user.email).to.equal(email)
        expect(user.name).to.equal(name)
        expect(user.id).to.be.a('number')
        expect(user).to.not.have.property('password')
      })
  })

  it('returns an unauthorized error with invalid credentials', function () {
    const email = Cypress.env('USER_EMAIL')
    const password = 'invalid-password'

    cy.request({
      method: 'POST',
      url: buildApiUrl('/login'),
      body: { email, password },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.equal(401)
      expect(body).to.deep.equal({ message: 'Unauthorized' })
    })
  })

  it('returns an unauthorized error with unknown email', function () {
    const email = 'fake-user@example.com'
    const password = Cypress.env('USER_PASSWORD')

    cy.request({
      method: 'POST',
      url: buildApiUrl('/login'),
      body: { email, password },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.equal(401)
      expect(body).to.deep.equal({ message: 'Unauthorized' })
    })
  })
})
