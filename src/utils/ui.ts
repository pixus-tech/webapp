import React from 'react'

export function preventClickThrough(
  event: React.MouseEvent<HTMLElement, MouseEvent>,
) {
  event.preventDefault()
  event.stopPropagation()
}
