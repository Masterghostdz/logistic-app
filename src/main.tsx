
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure proper RTL support
document.documentElement.dir = 'ltr';

createRoot(document.getElementById("root")!).render(<App />);
