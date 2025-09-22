
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary';
import { mobileService } from './services/mobileService';
import './index.css'

// Ensure proper RTL support
document.documentElement.dir = 'ltr';

// Add a class to the document root when running as a native Capacitor app
mobileService.getDeviceInfo().then(info => {
	if (info.isNative) {
		document.documentElement.classList.add('native-app');
	}
}).catch(() => {
	// ignore
});

createRoot(document.getElementById("root")!).render(
		<ErrorBoundary>
				<App />
		</ErrorBoundary>
);
