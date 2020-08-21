import * as axios from 'axios'

const baseUrl = 'http://localhost:4000'

const post = (url, body, headers = {}) =>
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  }).then(async (r) => {
    if (!r.ok) {
      const body = await r.json()
      const error = new Error(body.message)

      error.body = body
      error.status = r.status
      error.statusText = r.statusText

      throw error
    }

    return r.json()
  })

const get = (url, headers) =>
  axios
    .get(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    })
    .then((resp) => resp.data)

export const allAlbums = (jwt) =>
  get(`${baseUrl}/albums`, {
    Authorization: `Bearer ${jwt.token}`,
  })

export const fetchAlbum = (jwt, id) =>
  get(`${baseUrl}/albums/${id}`, {
    Authorization: `Bearer ${jwt.token}`,
  })

export const reviewAlbum = (jwt, id, review) =>
  post(
    `${baseUrl}/albums/${id}/review`,
    { review },
    { Authorization: `Bearer ${jwt.token}` }
  )

export const removeReview = (jwt, id) =>
  post(
    `${baseUrl}/albums/${id}/remove-review`,
    {},
    { Authorization: `Bearer ${jwt.token}` }
  )

export const rateAlbum = (jwt, id, rating) =>
  post(
    `${baseUrl}/albums/${id}/rate`,
    { rating },
    { Authorization: `Bearer ${jwt.token}` }
  )

export const login = (email, password) =>
  post(`${baseUrl}/login`, { email, password })
