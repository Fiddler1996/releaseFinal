import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Отключаем и удаляем любой существующий Service Worker, чтобы избежать устаревшего кэша
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.getRegistrations().then(registrations => {
		registrations.forEach(reg => reg.unregister());
	});
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);