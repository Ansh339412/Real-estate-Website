import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { FilterProvider } from './context/FilterContext';
import { PropertiesProvider } from './context/PropertiesContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { installGlobalErrorHandlers } from './lib/logger';
import './index.css';

installGlobalErrorHandlers();

// Provider order matters: favorites need the signed-in user, everything else is independent.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <HashRouter>
      <ErrorBoundary>
        <AuthProvider>
          <PropertiesProvider>
            <FavoritesProvider>
              <FilterProvider>
                <App />
              </FilterProvider>
            </FavoritesProvider>
          </PropertiesProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HashRouter>
  </StrictMode>,
);
