import React from 'react'

const styles = {
  display: 'flex',
  justifyContent: 'center',
  textAlign: 'center',
}

const CenterDecorator = storyFn => <div style={styles}>{storyFn()}</div>
export default CenterDecorator
