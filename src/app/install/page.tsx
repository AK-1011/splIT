'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isServiceWorkerSupported, isAppInstalled, showInstallPrompt } from '@/lib/serviceWorker';

export default function InstallPage() {
  const [installed, setInstalled] = useState(false);
  const [installable, setInstallable] = useState(false);
  const [browser, setBrowser] = useState('');
  
  useEffect(() => {
    // Check if already installed
    setInstalled(isAppInstalled());
    
    // Check if installable
    setInstallable(isServiceWorkerSupported());
    
    // Detect browser
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') || ua.includes('Chromium')) {
      setBrowser('chrome');
    } else if (ua.includes('Firefox')) {
      setBrowser('firefox');
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      setBrowser('safari');
    } else if (ua.includes('Edge')) {
      setBrowser('edge');
    } else {
      setBrowser('other');
    }
  }, []);
  
  const handleInstallClick = async () => {
    try {
      const installed = await showInstallPrompt();
      if (installed) {
        setInstalled(true);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-primary flex items-center">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold mt-2">Install splIT</h1>
        </div>

        <div className="card mb-6">
          {installed ? (
            <div className="text-center py-6">
              <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">App Installed!</h2>
              <p className="text-text-secondary mb-4">
                You're already using splIT as an installed app.
              </p>
              <Link href="/" className="btn btn-primary">
                Continue to App
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Install as App</h2>
              <p className="text-text-secondary mb-6">
                Installing splIT on your device lets you use it offline and gives you a better experience.
              </p>
              
              {installable && (
                <button
                  onClick={handleInstallClick}
                  className="btn btn-primary w-full mb-6"
                >
                  Install splIT
                </button>
              )}
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Manual Installation</h3>
                
                {browser === 'chrome' && (
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Click the menu button (three dots) in the top right</li>
                    <li>Select 'Install splIT...' or 'Install app'</li>
                    <li>Follow the prompts to install</li>
                  </ol>
                )}
                
                {browser === 'safari' && (
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Tap the share button at the bottom of the screen</li>
                    <li>Scroll down and tap 'Add to Home Screen'</li>
                    <li>Tap 'Add' in the top right corner</li>
                  </ol>
                )}
                
                {browser === 'firefox' && (
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Tap the menu button (three dots) in the bottom right</li>
                    <li>Tap 'Add to Home Screen'</li>
                    <li>Follow the prompts to install</li>
                  </ol>
                )}
                
                {browser === 'edge' && (
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Click the menu button (three dots) in the top right</li>
                    <li>Select 'Apps' then 'Install this site as an app'</li>
                    <li>Follow the prompts to install</li>
                  </ol>
                )}
                
                {browser === 'other' && (
                  <p className="text-sm text-text-secondary">
                    Your browser may not support installing this app. Try using Chrome or Safari for the best experience.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 