// Service Worker temporariamente desativado para debug
// Ative novamente após resolver os erros

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