import React from 'react'
import ImagePreviewGradient from './ImagePreviewGradient'

export default { title: 'Image Preview Gradient' }

export const redGreenAndBlue = () => (
  <div style={{ height: 256, width: 256 }}>
    <ImagePreviewGradient
      colors={{
        tl: [255, 0, 0],
        tr: [0, 255, 0],
        bl: [0, 255, 0],
        br: [255, 0, 0],
        c: [0, 0, 255],
      }}
    />
  </div>
)
