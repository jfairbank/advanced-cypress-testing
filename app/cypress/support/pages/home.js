export const albums = () => cy.getByDataTest('album-list-item')

export const album = (title) => cy.containsByDataTest('album-list-item', title)

export const sortBy = () => cy.getByDataTest('sort-by')

export const searchArtists = () => cy.getByDataTest('search-artists')

export const likeIcon = (title) => album(title).findByDataTest('rating-like')

export const dislikeIcon = (title) =>
  album(title).findByDataTest('rating-dislike')
