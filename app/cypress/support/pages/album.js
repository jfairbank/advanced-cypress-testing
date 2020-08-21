export const title = () => cy.getByDataTest('title')

export const artists = () => cy.getByDataTest('artists')

export const likeIcon = () => cy.getByDataTest('rating-like')

export const dislikeIcon = () => cy.getByDataTest('rating-dislike')

export const reviews = () => cy.getByDataTest('reviews')

export const review = (content) =>
  cy.getByDataTest('review').contains('[data-test="review"]', content)

export const newReview = () => cy.getByDataTest('new-review')

export const saveReview = () => cy.getByDataTest('save-review')

export const removeReview = (content) =>
  review(content).findByDataTest('remove-review')
