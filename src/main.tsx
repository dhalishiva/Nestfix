import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyTheme, savedTheme } from './state';
import './styles.css';

applyTheme(savedTheme());
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
