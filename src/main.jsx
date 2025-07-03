import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/ui/custom/Header.jsx';
import { Toaster } from 'sonner';
import { GoogleOAuthProvider } from '@react-oauth/google';
import CreateTrip from './create-trip';
import ViewTrip from './view-trip/[tripid]';
import Mytrips from './mytrips';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_ID}>
      <BrowserRouter>
        <Header />
        <Toaster />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/create-trip" element={<CreateTrip />} />
          <Route path="/view-trip/:tripid" element={<ViewTrip />} />
          <Route path='/mytrips' element={<Mytrips />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

