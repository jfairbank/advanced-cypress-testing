import React, { useState } from 'react'
import * as selectors from '../selectors'
import * as Filter from '../filter'
import * as Sorter from '../sorter'
import AlbumList from './AlbumList'
import * as styles from './Albums.module.css'

const FilterSection = ({ label, children }) => (
  <div className={styles.filterSection}>
    <div className={styles.label}>
      <label>{label}:</label>
    </div>

    {children}
  </div>
)

function Albums({ albums, onSelectAlbum }) {
  const [artistQuery, setArtistQuery] = useState('')
  const [filter, setFilter] = useState(Filter.All)
  const [sorter, setSorter] = useState(Sorter.Id)

  const filteredAlbums = selectors.filteredAndSortedAlbums({
    artistQuery,
    filter,
    sorter,
    albums,
  })

  return (
    <div className={styles.albums}>
      <div className={styles.filterSections}>
        <FilterSection label="Search Artists">
          <input
            type="text"
            value={artistQuery}
            onChange={(e) => setArtistQuery(e.target.value)}
            data-test="search-artists"
          />
        </FilterSection>

        <FilterSection label="Filter">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            data-test="filter-by"
          >
            <option value={Filter.All}>All Albums</option>
            <option value={Filter.Liked}>Liked Albums</option>
            <option value={Filter.Disliked}>Disliked Albums</option>
          </select>
        </FilterSection>

        <FilterSection label="Sort By">
          <select
            value={sorter}
            onChange={(e) => setSorter(e.target.value)}
            data-test="sort-by"
          >
            <option value={Sorter.Id}>Default</option>
            <option value={Sorter.Title}>Title</option>
            <option value={Sorter.Artist}>Artist</option>
          </select>
        </FilterSection>
      </div>

      <AlbumList albums={filteredAlbums} onSelectAlbum={onSelectAlbum} />
    </div>
  )
}

export default Albums
