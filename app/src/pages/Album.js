import React, { useCallback, useEffect, useState } from 'react'
import * as R from 'ramda'
import { Link, useParams } from 'react-router-dom'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import * as api from '../api'
import { Like, Dislike } from '../components/RatingIcon'
import * as styles from './Album.module.css'

function Album({ jwt }) {
  const { id } = useParams()

  const [album, setAlbum] = useState(null)
  const [newReview, setNewReview] = useState('')
  const [savingReview, setSavingReview] = useState(false)
  const [removingReview, setRemovingReview] = useState(false)

  const reviewBelongsToUser = useCallback(
    ({ user }) => user.email === jwt.user.email,
    [jwt]
  )
  const userReviews = R.propOr([], 'userReviews', album)
  const userReview = userReviews.find(reviewBelongsToUser)

  const saveReview = useCallback(async () => {
    if (savingReview) {
      return
    }

    setSavingReview(true)

    const review = await api.reviewAlbum(jwt, id, newReview)

    setAlbum((album_) => ({
      ...album_,
      userReviews: [review, ...userReviews],
    }))

    setNewReview('')
    setSavingReview(false)
  }, [jwt, id, newReview, savingReview, userReviews])

  const removeReview = useCallback(async () => {
    if (removingReview) {
      return
    }

    setRemovingReview(true)

    await api.removeReview(jwt, id)

    setAlbum((album_) => ({
      ...album_,
      userReviews: R.reject(reviewBelongsToUser, userReviews),
    }))

    setRemovingReview(false)
  }, [jwt, id, removingReview, userReviews, reviewBelongsToUser])

  const rate = useCallback(
    async (rating) => {
      await api.rateAlbum(jwt, id, rating)

      setAlbum((album_) => ({ ...album_, rating }))
    },
    [jwt, id, setAlbum]
  )

  useEffect(() => {
    // TODO: handle errors
    api.fetchAlbum(jwt, id).then(setAlbum)
  }, [jwt, id])

  return album ? (
    <div className={styles.album} data-test="album">
      <Link to="/" className={styles.goBack} data-test="go-back">
        Go Back
      </Link>

      <div className={styles.content}>
        <h1 className={styles.title} data-test="title">
          {album.title}
        </h1>

        <h2 className={styles.artists} data-test="artists">
          {album.artists.join(' - ')}
        </h2>

        <div className={styles.info}>
          <div>
            <img src={album.coverUrl} alt="" />
          </div>

          <div className={styles.ratings}>
            <Like size="4x" albumRating={album.rating} onRate={rate} />
            <Dislike size="4x" albumRating={album.rating} onRate={rate} />
          </div>
        </div>

        <div className={styles.reviews} data-test="reviews">
          <div className={styles.reviewList}>
            <h4>Reviews:</h4>

            <ul>
              {userReviews.map((userReview_, i) => (
                <li
                  className={styles.review}
                  key={userReview_.user.email}
                  data-test="review"
                >
                  <span>{userReview_.review}</span>

                  <button
                    className={styles.removeReview}
                    data-test="remove-review"
                    onClick={removeReview}
                  >
                    <Icon icon={faTrashAlt} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {!userReview && (
            <div className={styles.newReview}>
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                data-test="new-review"
              />

              <button
                disabled={newReview.trim() === '' || savingReview}
                onClick={saveReview}
                data-test="save-review"
              >
                Save Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className={styles.loading}>Loading...</div>
  )
}

export default Album
