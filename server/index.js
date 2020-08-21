const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const fs = require('fs').promises
const { makeExecutableSchema } = require('@graphql-tools/schema')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const { Strategy: LocalStrategy } = require('passport-local')
const {
  ExtractJwt: { fromAuthHeaderAsBearerToken },
  Strategy: JWTStrategy,
} = require('passport-jwt')
const path = require('path')
const R = require('ramda')

const ENV = process.env.NODE_ENV

const Rating = {
  NOT_RATED: 'NOT_RATED',
  LIKED: 'LIKED',
  DISLIKED: 'DISLIKED',
}

const isValidRating = (rating) => !!Object.values(Rating).find(R.equals(rating))

// This is only for demo purposes. Don't really persist your data with JSON or store plain-text passwords.
const usersList = require('./users.json')
const usersById = usersList.reduce(
  (acc, user) => ({ ...acc, [user.id]: user }),
  {}
)
const usersByEmail = usersList.reduce(
  (acc, user) => ({ ...acc, [user.email]: user }),
  {}
)

const albumsFile =
  ENV === 'test'
    ? path.resolve(__dirname, './jazz-albums-test.json')
    : path.resolve(__dirname, './jazz-albums.json')

let albumsList = require(albumsFile)

let albumsMap = albumsList.reduce(
  (acc, album) => ({ ...acc, [album.id]: album }),
  {}
)

function updateAlbums(newAlbumsMap) {
  albumsMap = newAlbumsMap
  albumsList = Object.values(newAlbumsMap).sort((a, b) => a.id - b.id)

  return fs.writeFile(albumsFile, JSON.stringify(albumsList, null, 2))
}

async function reviewAlbum(albumId, userId, review) {
  await updateAlbums(
    R.set(R.lensPath([albumId, 'userReviews', userId]), review, albumsMap)
  )
}

async function removeAlbumReview(albumId, userId) {
  await updateAlbums(
    R.over(R.lensPath([albumId, 'userReviews']), R.omit([userId]), albumsMap)
  )
}

async function rateAlbum(albumId, userId, rating) {
  await updateAlbums(
    R.set(R.lensPath([albumId, 'userRatings', userId]), rating, albumsMap)
  )
}

// Config
// ------

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 4000

// App
// ---

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))

// Auth
// ----

const SECRET = 'secret'

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    (email, password, done) => {
      const user = usersByEmail[email]

      // Reminder: don't do this in a production app
      if (user && user.password === password) {
        done(null, user)
      } else {
        done(null, false)
      }
    }
  )
)

passport.use(
  new JWTStrategy(
    {
      secretOrKey: SECRET,
      jwtFromRequest: fromAuthHeaderAsBearerToken(),
    },
    (token, done) => {
      done(null, token.user)
    }
  )
)

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err || !user) {
      res.status(401).send({ message: 'Unauthorized' })
    } else {
      const body = R.pick(['id', 'email', 'name'], user)
      const token = jwt.sign({ user: body }, SECRET)
      res.send({ token })
    }
  })(req, res, next)
})

const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      res.status(401).send({ message: 'Unauthorized' })
    } else {
      req.user = user
      next()
    }
  })(req, res, next)
}

// REST API
// --------

function findAlbumMiddleware(req, res, next) {
  const { id } = req.params
  const album = albumsMap[id]

  if (album) {
    req.album = album
    next()
  } else {
    res.status(404).send({ message: 'Album not found' })
  }
}

const formatAlbum = R.curry((user, album) => ({
  ...R.pick(['id', 'title', 'coverUrl', 'artists'], album),
  userReviews: Object.entries(album.userReviews).map(
    ([otherUserId, review]) => {
      const otherUser = usersById[otherUserId]

      return {
        ...(otherUser && { user: R.pick(['name', 'email'], otherUser) }),
        review,
      }
    }
  ),
  rating: album.userRatings[user.id] || Rating.NOT_RATED,
}))

app.get('/albums', authMiddleware, (req, res) => {
  res.send(albumsList.map(formatAlbum(req.user)))
})

app.get(
  '/albums/:id',
  authMiddleware,
  findAlbumMiddleware,
  async (req, res) => {
    res.send(formatAlbum(req.user, req.album))
  }
)

app.post(
  '/albums/:id/review',
  authMiddleware,
  findAlbumMiddleware,
  async (req, res) => {
    const { user } = req
    const { review } = req.body

    await reviewAlbum(req.album.id, user.id, review)

    res.send({ review, user: R.pick(['name', 'email'], user) })
  }
)

app.post(
  '/albums/:id/remove-review',
  authMiddleware,
  findAlbumMiddleware,
  async (req, res) => {
    const { user } = req

    await removeAlbumReview(req.album.id, user.id)

    res.send({ status: 'Removed review' })
  }
)

app.post(
  '/albums/:id/rate',
  authMiddleware,
  findAlbumMiddleware,
  async (req, res) => {
    const { user } = req
    const { rating } = req.body

    if (isValidRating(rating)) {
      await rateAlbum(req.album.id, user.id, rating)

      res.send({ rating })
    } else {
      res.status(422).send({
        message: `Invalid rating. Must be one of ${Object.values(Rating).join(
          ', '
        )}.`,
      })
    }
  }
)

// GraphQL API
// -----------

const typeDefs = /* GraphQL */ `
  type User {
    name: String!
    email: String!
  }

  type UserReview {
    user: User!
    review: String!
  }

  type UserRating {
    rating: Rating!
  }

  type Album {
    id: ID!
    title: String!
    coverUrl: String!
    artists: [String!]!
    userReviews: [UserReview!]!
    rating: Rating!
  }

  type Query {
    allAlbums: [Album!]!
    album(id: ID!): Album!
  }

  enum Rating {
    NOT_RATED
    LIKED
    DISLIKED
  }

  type Status {
    status: String!
  }

  type Mutation {
    reviewAlbum(id: ID!, review: String!): UserReview!
    removeAlbumReview(id: ID!): Status!
    rateAlbum(id: ID!, rating: Rating!): UserRating!
  }
`

const graphQLAuthenticator = (req, res) => (cb) => (...args) =>
  new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        reject(err)
      }

      if (!user) {
        reject(new Error('Unauthorized'))
      } else {
        req.user = user
        resolve(cb(...args))
      }
    })(req, res)
  })

const resolvers = (authenticated) => ({
  UserReview: {
    user({ user: user_ }) {
      return user_ || new Error('User not found')
    },
  },

  Query: {
    allAlbums: authenticated((_, __, req) => {
      return albumsList.map(formatAlbum(req.user))
    }),

    album: authenticated((_, { id }, req) => {
      return R.pipe(
        R.over(R.lensProp(id), formatAlbum(req.user)),
        R.propOr(new Error('Album not found'), id)
      )(albumsMap)
    }),
  },

  Mutation: {
    reviewAlbum: authenticated(async (_, { id, review }, req) => {
      await reviewAlbum(id, req.user.id, review)

      return { review, user: R.pick(['name', 'email'], req.user) }
    }),

    removeAlbumReview: authenticated(async (_, { id }, req) => {
      await removeAlbumReview(id, req.user.id)

      return { status: 'Removed review' }
    }),

    rateAlbum: authenticated(async (_, { id, rating }, req) => {
      await rateAlbum(id, req.user.id, rating)

      return { rating }
    }),
  },
})

app.use(
  '/graphql',
  graphqlHTTP((req, res) => ({
    schema: makeExecutableSchema({
      typeDefs,
      resolvers: resolvers(graphQLAuthenticator(req, res)),
    }),
  }))
)

// Start App
// ---------

app.listen(PORT, HOST, () => {
  console.log(`App listening at http://${HOST}:${PORT}`)
})
