'use client';

import { useState, useEffect } from 'react';
import SplashScreen from '../home/SplashScreen';

interface AppWithSplashProps {
  children: React.ReactNode;
}

export default function AppWithSplash({ children }: AppWithSplashProps) {
  const [showSplash, setShowSplash] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check splash status only after mounting (client-side only)
    const splashShown = sessionStorage.getItem('splash-shown');
    
    if (splashShown) {
      // Already shown, skip splash
      setShowSplash(false);
      setIsLoading(false);
    } else {
      // Show splash
      setShowSplash(true);
      setIsLoading(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('splash-shown', 'true');
    setShowSplash(false);
  };

  // Show loading during hydration
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--gold-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show splash screen if needed
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show main app
  return <>{children}</>;
}