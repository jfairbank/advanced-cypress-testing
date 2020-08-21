import React, { useCallback, useState } from 'react'
import { Redirect } from 'react-router-dom'
import * as api from '../api'
import * as styles from './Login.module.css'

function Login({ jwt, onAuthenticate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loggingIn, setLoggingIn] = useState(false)

  const canLogIn = email && password && !loggingIn

  const login = useCallback(
    async (e) => {
      e.preventDefault()

      setError(null)
      setLoggingIn(true)

      await api
        .login(email, password)
        .then(({ token }) => onAuthenticate(token))
        .catch(({ body }) => {
          setError(body.message)
          setLoggingIn(false)
        })
    },
    [email, password, onAuthenticate]
  )

  return jwt ? (
    <Redirect to="/" />
  ) : (
    <div className={styles.content}>
      {error && (
        <div className={styles.error} data-test="error">
          {error}
        </div>
      )}
      <form className={styles.form} onSubmit={login}>
        <div className={styles.row}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="text"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            data-test="email"
          />
        </div>
        <div className={styles.row}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            data-test="password"
          />
        </div>
        <div className={styles.actions}>
          <button
            className={styles.logIn}
            disabled={!canLogIn}
            data-test="log-in"
          >
            Log In
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login
