import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { applyAppearanceSettings, getAppearanceSettings } from './lib/appearance';
import './index.css';
import { LanguageProvider } from './i18n'

applyAppearanceSettings(getAppearanceSettings());

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