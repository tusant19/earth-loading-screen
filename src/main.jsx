import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import LoadingPage from './pages/LoadingPage.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<LoadingPage />} />
      <Route path='/loading' element={<LoadingPage />} />
    </Routes>
  </BrowserRouter>
)
