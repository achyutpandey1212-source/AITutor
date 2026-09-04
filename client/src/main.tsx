import React from 'react';
import ReactDOM from 'react-dom/client';

// Global CSS — must be imported before the app
import './styles/tokens.css';
import './styles/global.css';
import './styles/theater-tokens.css';

import App from './App';
import { ThemeProvider } from './theme/ThemeContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
