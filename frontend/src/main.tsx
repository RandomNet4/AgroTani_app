// =====================================================
// MAIN.TSX - ENTRY POINT DENGAN BROWSERROUTER
// =====================================================

// Intercept global fetch to trigger network status
const originalFetch = window.fetch;
let activeRequests = 0;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const method = init?.method?.toUpperCase() || 'GET';
  const isWrite = ['POST', 'PUT', 'DELETE'].includes(method);

  if (isWrite) {
    activeRequests++;
    if (activeRequests === 1) {
      window.dispatchEvent(new CustomEvent('app-loading', { detail: true }));
    }
  }
  try {
    return await originalFetch(input, init);
  } finally {
    if (isWrite) {
      activeRequests--;
      if (activeRequests === 0) {
        window.dispatchEvent(new CustomEvent('app-loading', { detail: false }));
      }
    }
  }
};


import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { DataProvider } from './context/DataContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </BrowserRouter>
  </StrictMode>,
);
