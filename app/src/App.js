import React, { useCallback, useEffect, useState } from 'react'
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom'
import Album from './pages/Album'
import Home from './pages/Home'
import Login from './pages/Login'
import * as Jwt from './jwt'

function App({ jwt: initialJwt }) {
  const [jwt, setJwt] = useState(initialJwt)

  const onAuthenticate = useCallback(
    (token) => {
      Jwt.setToken(token)
      setJwt(Jwt.parse(token))
    },
    [setJwt]
  )

  useEffect(() => {
    if (!jwt) {
      setJwt(Jwt.get())
    }
  }, [jwt])

  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login jwt={jwt} onAuthenticate={onAuthenticate} />
        </Route>
        <AuthenticatedRoute jwt={jwt} path="/albums/:id">
          <Album jwt={jwt} />
        </AuthenticatedRoute>
        <AuthenticatedRoute jwt={jwt} path="/">
          <Home jwt={jwt} />
        </AuthenticatedRoute>
      </Switch>
    </Router>
  )
}

function AuthenticatedRoute({ jwt, children, ...rest }) {
  return (
    <Route
      {...rest}
      render={() => (jwt ? children : <Redirect to="/login" />)}
    ></Route>
  )
}

export default App
