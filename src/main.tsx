import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { applyAppearanceSettings, getAppearanceSettings, saveAppearanceSettings } from './lib/appearance';
import './index.css';
import { LanguageProvider } from './i18n'

applyAppearanceSettings(getAppearanceSettings());

// Enable fully adaptive two-finger pinch-to-zoom across every browser/device
let initialDistance = 0;
let initialZoom = 100;

document.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    initialDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const settings = getAppearanceSettings();
    const pct = parseInt((settings.uiZoom || '100%').replace('%', ''), 10);
    initialZoom = isNaN(pct) ? 100 : pct;
  }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2 && initialDistance > 0) {
    // Intercept default browser view scaling to let our adaptive CSS zoom take over
    if (e.cancelable) {
      e.preventDefault();
    }

    const currentDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    
    const factor = currentDistance / initialDistance;
    let nextZoom = Math.round((initialZoom * factor) / 10) * 10; // Round to nearest 10%
    
    // Clamp to valid options
    if (nextZoom < 80) nextZoom = 80;
    if (nextZoom > 150) nextZoom = 150;
    
    const settings = getAppearanceSettings();
    const nextZoomStr = `${nextZoom}%` as any;
    
    if (settings.uiZoom !== nextZoomStr) {
      saveAppearanceSettings({ ...settings, uiZoom: nextZoomStr });
    }
  }
}, { passive: false });

document.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    initialDistance = 0;
  }
}, { passive: true });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
         <ErrorBoundary>
  <App />
</ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </LanguageProvider>
  </React.StrictMode>
);