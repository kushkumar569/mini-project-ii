import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RecoilRoot } from 'recoil'; // ✅ Import RecoilRoot
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
            <App />
);
