export const API_PORT = Cypress.env('API_PORT')
export const API_HOST = Cypress.env('API_HOST')
export const baseApiUrl = `http://${API_HOST}:${API_PORT}`

export const buildApiUrl = (path) => new URL(path, baseApiUrl).toString()

export const graphQLURL = buildApiUrl('/graphql')
