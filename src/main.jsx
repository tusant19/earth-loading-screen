import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import LoadingPage from './pages/LoadingPage.jsx'
import './index.html'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<LoadingPage />} />
      <Route path='/loading' element={<LoadingPage />} />
    </Routes>
  </BrowserRouter>
)
