'use client';

import { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';

interface HomeWithSplashProps {
  children: React.ReactNode;
}

export default function HomeWithSplash({ children }: HomeWithSplashProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if splash was already shown in this session
    const splashShown = sessionStorage.getItem('splash-shown');
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Remember that splash was shown in this session
    sessionStorage.setItem('splash-shown', 'true');
  };

  // Don't render splash on server or if already shown
  if (!mounted) {
    return <div>{children}</div>;
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className={showSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'}>
        {children}
      </div>
    </>
  );
}