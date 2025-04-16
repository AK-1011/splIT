/**
 * This file contains utility functions for managing the service worker
 * Note: Most PWA functionality is handled by next-pwa
 */

// Check if service workers are supported
export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

// Register the service worker
export const registerServiceWorker = async () => {
  if (!isServiceWorkerSupported()) {
    console.warn('Service workers are not supported by this browser');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker registration successful', registration);
    return true;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return false;
  }
};

// Check if the app is installed (in standalone mode)
export const isAppInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Event listeners for install prompt
let deferredPrompt: any;

export const initInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
  });
};

// Show the install prompt
export const showInstallPrompt = async () => {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return false;
  }

  // Show the prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const choiceResult = await deferredPrompt.userChoice;
  
  // Reset the deferred prompt variable
  deferredPrompt = null;
  
  return choiceResult.outcome === 'accepted';
};

// Initialize offline detection
export const initOfflineDetection = (
  onOffline: () => void = () => {},
  onOnline: () => void = () => {}
) => {
  window.addEventListener('offline', onOffline);
  window.addEventListener('online', onOnline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('offline', onOffline);
    window.removeEventListener('online', onOnline);
  };
}; 