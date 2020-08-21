import React, { useEffect, useState } from 'react'
import * as R from 'ramda'
import Albums from '../components/Albums'
import * as api from '../api'
import * as RemoteData from '../remoteData'
import * as styles from './Home.module.css'

function Home({ jwt }) {
  const [albums, setAlbums] = useState(RemoteData.ready())

  useEffect(() => {
    setAlbums(RemoteData.loading())

    api.allAlbums(jwt).then(R.pipe(RemoteData.success, setAlbums))
  }, [jwt])

  switch (RemoteData.status(albums)) {
    case RemoteData.Ready:
    case RemoteData.Loading:
      return <div className={styles.loading}>Loading...</div>

    case RemoteData.Success:
      return <Albums albums={RemoteData.payload(albums)} />

    case RemoteData.Fail:
      return <div>Got an error: {RemoteData.error(albums).message}</div>

    default:
      return null
  }
}

export default Home
