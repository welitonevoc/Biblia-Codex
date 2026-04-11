if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration.scope);
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            if (confirm('Nova versão disponível. Atualizar?')) {
              newWorker.postMessage('skipWaiting');
            }
          }
        });
      });
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });
}

if ('standalone' in window.navigator) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    
    const installBanner = document.getElementById('install-banner');
    if (installBanner) installBanner.style.display = 'flex';
  });
}

window.addEventListener('appinstalled', () => {
  window.deferredPrompt = null;
  const installBanner = document.getElementById('install-banner');
  if (installBanner) installBanner.style.display = 'none';
});