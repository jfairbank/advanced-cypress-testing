import albums from '../../../server/jazz-albums-test-pristine.json'
import { buildApiUrl } from '../support/api'
import * as homePage from '../support/pages/home'
import * as albumPage from '../support/pages/album'

describe('Album page', function () {
  beforeEach(function () {
    cy.server()
    cy.route(buildApiUrl('/albums/*')).as('getAlbum')

    this.album = albums[0]

    cy.login()
    cy.visit('/')

    homePage.album(this.album.title).click()
  })

  afterEach(function () {
    cy.resetAlbum(this.album.id)
  })

  it('can be viewed', function () {
    cy.wait('@getAlbum')

    albumPage.title().should('contain', this.album.title)
    albumPage.artists().should('contain', this.album.artists)
  })

  it('can be rated', function () {
    // Like
    albumPage
      .likeIcon()
      .should('have.attr', 'data-test-selected', 'false')
      .click()
      .should('have.attr', 'data-test-selected', 'true')

    // Check that like persists and then remove rating
    cy.reload()

    albumPage
      .likeIcon()
      .should('have.attr', 'data-test-selected', 'true')
      .click()
      .should('have.attr', 'data-test-selected', 'false')

    // Check that no rating persists
    cy.reload()

    albumPage.likeIcon().should('have.attr', 'data-test-selected', 'false')

    // Dislike and remove rating
    albumPage
      .dislikeIcon()
      .should('have.attr', 'data-test-selected', 'false')
      .click()
      .should('have.attr', 'data-test-selected', 'true')
      .click()
      .should('have.attr', 'data-test-selected', 'false')
  })

  it('can be reviewed', function () {
    const review = 'Great album!'

    // Add review
    albumPage.reviews().should('not.contain', review)

    albumPage.newReview().type(review)
    albumPage.saveReview().click()

    albumPage.reviews().should('contain', review)
    albumPage.newReview().should('not.exist')

    // Check that review persists
    cy.reload()
    albumPage.reviews().should('contain', review)
    albumPage.newReview().should('not.exist')

    // Remove review
    albumPage.removeReview(review).click()

    albumPage.reviews().should('not.contain', review)

    albumPage.newReview().should('exist')
  })
})
