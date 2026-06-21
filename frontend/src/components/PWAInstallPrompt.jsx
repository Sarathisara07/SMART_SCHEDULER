import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Smartphone, Wifi, WifiOff, Check } from 'lucide-react';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showOfflineBanner, setShowOfflineBanner] = useState(false);
    const [showOnlineBanner, setShowOnlineBanner] = useState(false);
    const wasOffline = useRef(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            
            // Show prompt after a short delay (don't interrupt user immediately)
            const dismissed = localStorage.getItem('pwa-prompt-dismissed');
            const dismissedAt = dismissed ? parseInt(dismissed) : 0;
            const daysSinceDismissed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
            
            if (!dismissed || daysSinceDismissed > 7) {
                setTimeout(() => setShowPrompt(true), 3000);
            }
        };

        // Listen for successful install
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setInstallPrompt(null);
        };

        // Online/Offline status
        const handleOnline = () => {
            setShowOfflineBanner(false);
            // Only show "Back online" if we were actually offline before
            if (wasOffline.current) {
                setShowOnlineBanner(true);
                wasOffline.current = false;
                // Auto-hide after 3 seconds
                setTimeout(() => setShowOnlineBanner(false), 3000);
            }
        };

        const handleOffline = () => {
            wasOffline.current = true;
            setShowOfflineBanner(true);
            setShowOnlineBanner(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) return;
        
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setIsInstalled(true);
        }
        
        setInstallPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    };

    return (
        <>
            {/* Install Prompt Banner */}
            {showPrompt && !isInstalled && (
                <div className="pwa-install-prompt">
                    <div className="pwa-install-content">
                        <div className="pwa-install-icon">
                            <Smartphone size={28} />
                        </div>
                        <div className="pwa-install-text">
                            <h3>Install SmartSched</h3>
                            <p>Add to your home screen for quick access & offline use</p>
                        </div>
                        <div className="pwa-install-actions">
                            <button className="pwa-install-btn" onClick={handleInstall}>
                                <Download size={16} />
                                <span>Install</span>
                            </button>
                            <button className="pwa-dismiss-btn" onClick={handleDismiss}>
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="pwa-install-features">
                        <span className="pwa-feature">
                            <Check size={14} />
                            Offline Access
                        </span>
                        <span className="pwa-feature">
                            <Check size={14} />
                            Push Notifications
                        </span>
                        <span className="pwa-feature">
                            <Check size={14} />
                            Fast & Native-like
                        </span>
                    </div>
                </div>
            )}

            {/* Offline Banner */}
            {showOfflineBanner && (
                <div className="pwa-offline-banner">
                    <WifiOff size={16} />
                    <span>You're offline. Some features may be limited.</span>
                    <button className="pwa-offline-dismiss" onClick={() => setShowOfflineBanner(false)}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Online Restored Banner - only shows briefly after coming back from offline */}
            {showOnlineBanner && (
                <div className="pwa-online-banner">
                    <Wifi size={16} />
                    <span>Back online!</span>
                </div>
            )}
        </>
    );
};

export default PWAInstallPrompt;

