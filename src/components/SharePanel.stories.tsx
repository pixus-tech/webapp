import React from 'react'
import SharePanel from './SharePanel'

export default { title: 'Share Panel' }

export const standard = () => (
  <div style={{ height: 256, width: 256 }}>
    <SharePanel
      people={[
        {
          username: 'test1.id.blockstack',
          initials: 'TK',
        },
        {
          username: 'test2.id.blockstack',
          imageURL: 'https://via.placeholder.com/64x64.jpg?text=TK',
        },
        {
          username: 'test3.id.blockstack',
        },
      ]}
    />
  </div>
)
