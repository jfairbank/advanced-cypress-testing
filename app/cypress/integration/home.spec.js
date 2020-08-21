import albums from '../../../server/jazz-albums-test-pristine.json'
import * as homePage from '../support/pages/home'

const _ = Cypress._
const albumsSortedByTitle = _.sortBy(albums, 'title')
const albumsSortedByArtists = _.sortBy(albums, ['artists[0]', 'title'])
const albumsSortedById = _.sortBy(albums, 'id')

describe('Home page', function () {
  beforeEach(function () {
    cy.login()
  })

  it('albums can be viewed on home page', function () {
    cy.visit('/')

    homePage.albums().should('have.length', albums.length)

    albums.forEach((album) => {
      homePage
        .album(album.title)
        .should('exist')
        .and('contain', album.artists.join(' - '))
    })
  })

  it('can display ratings', function () {
    const [likedAlbum, dislikedAlbum] = albumsSortedById

    // Prepare albums
    cy.likeAlbum(likedAlbum.id)
    cy.dislikeAlbum(dislikedAlbum.id)

    // Visit page and verify albums liked/disliked
    cy.visit('/')

    homePage.likeIcon(likedAlbum.title).should('exist')
    homePage.dislikeIcon(dislikedAlbum.title).should('exist')

    // Remove ratings
    cy.resetAlbum(likedAlbum.id)
    cy.resetAlbum(dislikedAlbum.id)

    // Reload and verify no more ratings
    cy.reload()

    homePage.likeIcon(likedAlbum.title).should('not.exist')
    homePage.dislikeIcon(dislikedAlbum.title).should('not.exist')
  })

  it('sorts albums', function () {
    cy.visit('/')

    function albumsSortedLike(albumList) {
      albumList.forEach((album, index) => {
        homePage.albums().eq(index).should('contain', album.title)
      })
    }

    homePage.sortBy().select('Title')
    albumsSortedLike(albumsSortedByTitle)

    homePage.sortBy().select('Artist')
    albumsSortedLike(albumsSortedByArtists)

    homePage.sortBy().select('Default')
    albumsSortedLike(albumsSortedById)
  })

  it('searches for artists', function () {
    cy.visit('/')

    homePage.searchArtists().type('John Coltrane')

    homePage
      .albums()
      .should('have.length', 2)
      .and('contain', 'A Love Supreme')
      .and('contain', 'Blue Train')
      .and('contain', 'John Coltrane')

    // 1 album with multiple artists
    const jazzGiantsAlbum = albums.find(
      ({ title }) => title === "The Jazz Giants '56"
    )

    function displaysOnlyJazzGiantsAlbum() {
      homePage
        .albums()
        .should('have.length', 1)
        .and('contain', jazzGiantsAlbum.title)
        .and('contain', jazzGiantsAlbum.artists.join(' - '))
    }

    homePage.searchArtists().clear().type('Lester Young')
    displaysOnlyJazzGiantsAlbum()

    homePage.searchArtists().clear().type('Jo Jones')
    displaysOnlyJazzGiantsAlbum()
  })
})
