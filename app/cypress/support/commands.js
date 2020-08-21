import { buildApiUrl } from './api'

Cypress.Commands.add('getByDataTest', (key) => cy.get(`[data-test="${key}"]`))

Cypress.Commands.add('containsByDataTest', (key, content) =>
  cy.contains(`[data-test="${key}"]`, content)
)

Cypress.Commands.add('findByDataTest', { prevSubject: true }, (subject, key) =>
  cy.wrap(subject).find(`[data-test="${key}"]`)
)

Cypress.Commands.add('apiRequest', ({ body, url, ...options }) => {
  const token = localStorage.getItem('jwt')

  return cy.request({
    ...options,
    failOnStatusCode: false,
    url: buildApiUrl(url),
    headers: {
      'Content-Type': 'application/json',
    },
    auth: { bearer: token },
    ...(body && { body: JSON.stringify(body) }),
  })
})

Cypress.Commands.add('apiGet', (url) => cy.apiRequest({ url, method: 'GET' }))

Cypress.Commands.add('apiPost', (url, body = null) =>
  cy.apiRequest({ body, url, method: 'POST' })
)

Cypress.Commands.add(
  'login',
  (
    email = Cypress.env('USER_EMAIL'),
    password = Cypress.env('USER_PASSWORD')
  ) =>
    cy
      .request('POST', buildApiUrl('/login'), { email, password })
      .its('body.token')
      .then((token) => {
        localStorage.setItem('jwt', token)
      })
)

Cypress.Commands.add('logout', () => {
  localStorage.removeItem('jwt')
})

Cypress.Commands.add('graphQL', (query, variables = {}) =>
  cy.apiPost('/graphql', { query, variables })
)

Cypress.Commands.add('likeAlbum', (id) =>
  cy.apiPost(`/albums/${id}/rate`, { rating: 'LIKED' })
)

Cypress.Commands.add('dislikeAlbum', (id) =>
  cy.apiPost(`/albums/${id}/rate`, { rating: 'DISLIKED' })
)

Cypress.Commands.add('resetAlbum', (id) =>
  cy
    .apiPost(`/albums/${id}/remove-review`)
    .apiPost(`/albums/${id}/rate`, { rating: 'NOT_RATED' })
)
