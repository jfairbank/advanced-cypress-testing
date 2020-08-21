export function setToken(value) {
  window.localStorage.setItem('jwt', value)
}

export const get = () => {
  const token = window.localStorage.getItem('jwt')

  return token ? parse(token) : null
}

export const parse = (token) => ({ token, user: getUser(token) })

function getUser(jwt) {
  try {
    return JSON.parse(atob(jwt.split('.')[1])).user
  } catch (e) {
    return null
  }
}
