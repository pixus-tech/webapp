import React from 'react'
import Toast from './Toast'

export default { title: 'Toast' }

export const success = () => (
  <Toast message="This is a success message" variant="success" />
)

export const warning = () => (
  <Toast message="This is a warning message" variant="warning" />
)

export const error = () => (
  <Toast message="This is a error message" variant="error" />
)

export const info = () => (
  <Toast message="This is a info message" variant="info" />
)

export const longMessage = () => (
  <Toast
    message="This is a info message with very long textual content. This example shows that the text breaks properly"
    variant="info"
  />
)
