export const NotRated = 'NOT_RATED'
export const Liked = 'LIKED'
export const Disliked = 'DISLIKED'

const isRating = (rating) => (value) => value === rating

export const isNotRated = isRating(NotRated)
export const isLiked = isRating(Liked)
export const isDisliked = isRating(Disliked)
