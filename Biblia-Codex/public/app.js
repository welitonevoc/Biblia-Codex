// Service Worker DESATIVADO
// Para reativar, descomente o código abaixo

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', async () => {
//     try {
//       const registration = await navigator.serviceWorker.register('/sw.js');
//       console.log('SW registered:', registration.scope);
//     } catch (error) {
//       console.error('SW registration failed:', error);
//     }
//   });
// }

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