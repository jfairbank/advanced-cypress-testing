import React from 'react'
import ReactDOM from 'react-dom'
import DefaultApp from './App'
import * as Jwt from './jwt'
import './index.css'

function render(App) {
  ReactDOM.render(<App jwt={Jwt.get()} />, document.getElementById('root'))
}

if (module.hot) {
  module.hot.accept('./App', () => {
    // eslint-disable-next-line
    render(require('./App').default)
  })
}

render(DefaultApp)
