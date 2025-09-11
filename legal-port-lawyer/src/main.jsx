import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('Agora App ID:', import.meta.env.VITE_AGORA_APP_ID); // <--- Add this
ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <App />
  </>,
)
