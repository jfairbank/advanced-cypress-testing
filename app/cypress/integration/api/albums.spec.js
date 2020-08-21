import { buildApiUrl, graphQLURL } from '../../support/api'
import albums from '../../../../server/jazz-albums-test-pristine.json'

describe('REST API: albums', function () {
  beforeEach(function () {
    cy.login()

    this.albums = albums
    this.albumTitles = albums.map(({ title }) => title)
  })

  it('endpoints require an authenticated user', function () {
    cy.request({
      method: 'GET',
      url: buildApiUrl('/albums'),
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.equal(401)
      expect(body).to.deep.equal({ message: 'Unauthorized' })
    })
  })

  it('can fetch all albums', function () {
    cy.apiGet('/albums')
      .its('body')
      .should('have.length', this.albums.length)
      .each((album) => {
        expect(this.albumTitles).to.include(album.title)
      })
  })

  it('can fetch an album', function () {
    const album = this.albums[0]

    cy.apiGet(`/albums/${album.id}`).its('body').should('containSubset', {
      id: album.id,
      title: album.title,
      artists: album.artists,
      rating: 'NOT_RATED',
      userReviews: [],
    })
  })

  it('can review an album and remove the review', function () {
    const album = this.albums[0]
    const review = 'Great album!'
    const expectedReview = {
      review,
      user: { name: 'Emmett Brown', email: 'ebrown@jigowatts.com' },
    }

    cy.apiPost(`/albums/${album.id}/review`, { review })
      .its('body')
      .should('deep.equal', expectedReview)

    cy.apiGet(`/albums/${album.id}`)
      .its('body.userReviews')
      .should('deep.equal', [expectedReview])

    cy.apiPost(`/albums/${album.id}/remove-review`)
      .its('body')
      .should('deep.equal', { status: 'Removed review' })

    cy.apiGet(`/albums/${album.id}`)
      .its('body.userReviews')
      .should('deep.equal', [])
  })

  it('can rate an album and remove the rating', function () {
    const id = 2
    const rating = 'LIKED'
    const notRated = 'NOT_RATED'

    cy.apiPost(`/albums/${id}/rate`, { rating })
      .its('body')
      .should('deep.equal', { rating })

    cy.apiGet(`/albums/${id}`).its('body.rating').should('equal', rating)

    cy.apiPost(`/albums/${id}/rate`, { rating: notRated })
      .its('body')
      .should('deep.equal', { rating: notRated })

    cy.apiGet(`/albums/${id}`).its('body.rating').should('equal', notRated)
  })

  it('prevents invalid ratings', function () {
    const id = 2
    const rating = 'INVALID_RATING'

    cy.apiPost(`/albums/${id}/rate`, { rating }).then(({ status, body }) => {
      expect(status).to.equal(422)
      expect(body).to.deep.equal({
        message: 'Invalid rating. Must be one of NOT_RATED, LIKED, DISLIKED.',
      })
    })
  })
})

describe('GraphQL API: albums', function () {
  beforeEach(function () {
    cy.login()

    this.albums = albums
    this.albumTitles = albums.map(({ title }) => title)
  })

  it('endpoints require an authenticated user', function () {
    const query = /* GraphQL */ `
      query AllAlbums {
        allAlbums {
          title
        }
      }
    `

    cy.request({
      method: 'POST',
      url: graphQLURL,
      body: JSON.stringify({ query }),
      headers: {
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false,
    })
      .its('body')
      .should('have.graphQLError', 'Unauthorized')
  })

  it('can fetch all albums', function () {
    const query = /* GraphQL */ `
      query AllAlbums {
        allAlbums {
          title
        }
      }
    `

    cy.graphQL(query)
      .its('body.data.allAlbums')
      .should('have.length', this.albums.length)
      .each((album) => {
        expect(this.albumTitles).to.include(album.title)
      })
  })

  it('can fetch an album', function () {
    const album = this.albums[0]
    const query = /* GraphQL */ `
      query Album($id: ID!) {
        album(id: $id) {
          title
          artists
          rating
          userReviews {
            review
          }
        }
      }
    `
    cy.graphQL(query, { id: album.id })
      .its('body.data.album')
      .should('deep.equal', {
        title: album.title,
        artists: album.artists,
        rating: 'NOT_RATED',
        userReviews: [],
      })
  })

  it('can review an album and remove the review', function () {
    const album = this.albums[0]
    const review = 'Great album!'
    const expectedReview = {
      review,
      user: { name: 'Emmett Brown', email: 'ebrown@jigowatts.com' },
    }

    const query = /* GraphQL */ `
      query Album($id: ID!) {
        album(id: $id) {
          userReviews {
            user {
              name
              email
            }
            review
          }
        }
      }
    `

    const reviewMutation = /* GraphQL */ `
      mutation ReviewAlbum($id: ID!, $review: String!) {
        reviewAlbum(id: $id, review: $review) {
          user {
            name
            email
          }
          review
        }
      }
    `

    const removeReviewMutation = /* GraphQL */ `
      mutation RemoveAlbumReview($id: ID!) {
        removeAlbumReview(id: $id) {
          status
        }
      }
    `

    cy.graphQL(reviewMutation, { id: album.id, review })
      .its('body.data.reviewAlbum')
      .should('deep.equal', expectedReview)

    cy.graphQL(query, { id: album.id })
      .its('body.data.album.userReviews')
      .should('deep.equal', [expectedReview])

    cy.graphQL(removeReviewMutation, { id: album.id })
      .its('body.data.removeAlbumReview.status')
      .should('equal', 'Removed review')

    cy.graphQL(query, { id: album.id })
      .its('body.data.album.userReviews')
      .should('deep.equal', [])
  })

  it('can rate an album and remove the rating', function () {
    const album = this.albums[0]
    const rating = 'LIKED'
    const notRated = 'NOT_RATED'

    const query = /* GraphQL */ `
      query Album($id: ID!) {
        album(id: $id) {
          rating
        }
      }
    `

    const rateMutation = /* GraphQL */ `
      mutation RateAlbum($id: ID!, $rating: Rating!) {
        rateAlbum(id: $id, rating: $rating) {
          rating
        }
      }
    `

    cy.graphQL(rateMutation, { id: album.id, rating })
      .its('body.data.rateAlbum.rating')
      .should('equal', rating)

    cy.graphQL(query, { id: album.id })
      .its('body.data.album.rating')
      .should('equal', rating)

    cy.graphQL(rateMutation, { id: album.id, rating: notRated })
      .its('body.data.rateAlbum.rating')
      .should('equal', notRated)

    cy.graphQL(query, { id: album.id })
      .its('body.data.album.rating')
      .should('equal', notRated)
  })

  it('prevents invalid ratings', function () {
    const album = this.albums[0]
    const rating = 'INVALID_RATING'

    const rateMutation = /* GraphQL */ `
      mutation RateAlbum($id: ID!, $rating: Rating!) {
        rateAlbum(id: $id, rating: $rating) {
          rating
        }
      }
    `

    cy.graphQL(rateMutation, { id: album.id, rating })
      .its('body')
      .should(
        'have.graphQLError',
        new RegExp(`Value "${rating}" does not exist in "Rating" enum`)
      )
  })
})
