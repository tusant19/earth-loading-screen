import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import loadingPage from './pages/LoadingPage.jsx'
import { browswerRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <loadingPage />
    </BrowserRouter>
  </StrictMode>,
)
