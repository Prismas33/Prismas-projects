"use client";
import { useEffect, useState } from "react";

export default function ServiceWorkerRegister() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then((registration) => {
          console.log('[SW] Registered successfully');
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            console.log('[SW] Update found');
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('[SW] New version available');
                setWaitingWorker(newWorker);
                setShowUpdatePrompt(true);
              }
            });
          });
        })
        .catch((error) => {
          console.log('[SW] Registration failed:', error);
        });

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Controller changed, reloading...');
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white rounded-lg shadow-lg border p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-[#7B4BFF] rounded-full flex items-center justify-center">
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Nova versão disponível!</h3>
          <p className="text-sm text-gray-600 mt-1">
            Uma nova versão do LinkMind está disponível. Quer atualizar agora?
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-[#7B4BFF] text-white text-sm rounded-lg hover:bg-[#6B3BEF] transition-colors"
            >
              Atualizar
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              Mais tarde
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
