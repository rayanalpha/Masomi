'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [stage, setStage] = useState<'enter' | 'logo' | 'text' | 'exit'>('enter');

  useEffect(() => {
    const sequence = async () => {
      // Stage 1: Enter animation (1s)
      await new Promise(resolve => setTimeout(resolve, 800));
      setStage('logo');
      
      // Stage 2: Logo reveal (1.5s)
      await new Promise(resolve => setTimeout(resolve, 1200));
      setStage('text');
      
      // Stage 3: Text reveal (1s)
      await new Promise(resolve => setTimeout(resolve, 800));
      setStage('exit');
      
      // Stage 4: Exit animation (0.8s)
      await new Promise(resolve => setTimeout(resolve, 600));
      setIsVisible(false);
      
      // Complete callback
      if (onComplete) {
        setTimeout(onComplete, 200);
      }
    };

    sequence();
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Luxury geometric patterns */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ 
              opacity: [0, 0.1, 0.2, 0.1],
              scale: [0.5, 1.2, 1, 1.1],
              rotate: [-45, 0, 15, 0]
            }}
            transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 border border-[var(--gold-500)]/20 rounded-full"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 45 }}
            animate={{ 
              opacity: [0, 0.15, 0.1, 0.2],
              scale: [0.8, 1, 1.3, 1],
              rotate: [45, 0, -15, 0]
            }}
            transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-1/4 right-1/4 w-72 h-72 border border-[var(--gold-400)]/25 rounded-full"
          />

          {/* Glowing orbs */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.6, 0.3, 0.8],
              scale: [0, 1, 1.2, 1]
            }}
            transition={{ duration: 3, ease: 'easeOut', repeat: Infinity, repeatType: 'reverse' }}
            className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-[var(--gold-500)]/30 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0.7, 0.5],
              scale: [0, 1.2, 1, 1.1]
            }}
            transition={{ duration: 3.5, ease: 'easeOut', repeat: Infinity, repeatType: 'reverse', delay: 1 }}
            className="absolute -right-20 bottom-1/3 h-80 w-80 rounded-full bg-[var(--gold-400)]/25 blur-3xl"
          />

          {/* Floating particles */}
          {Array.from({ length: 50 }).map((_, i) => {
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 100;
            return (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0,
                  x: `${randomX}vw`,
                  y: `${randomY}vh`
                }}
                animate={{
                  opacity: [0, 1, 0.8, 0],
                  y: [`${randomY}vh`, `${randomY - 20}vh`],
                  x: [`${randomX}vw`, `${randomX + (Math.random() - 0.5) * 10}vw`]
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
                className="absolute h-1 w-1 rounded-full bg-[var(--gold-500)]/80 blur-[0.5px]"
                style={{
                  boxShadow: '0 0 6px var(--gold-400), 0 0 12px var(--gold-500)/50'
                }}
              />
            );
          })}

          {/* Luxury diamond pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center">
          {/* Logo Container */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={stage === 'enter' ? { scale: 0, rotate: -180 } : { scale: 1, rotate: 0 }}
            transition={{ 
              duration: 1.2, 
              ease: [0.25, 0.46, 0.45, 0.94],
              type: 'spring',
              stiffness: 100,
              damping: 15
            }}
            className="mb-8"
          >
            {/* Brand Logo */}
            <div className="relative inline-block">
              {/* Outer glow ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={stage !== 'enter' ? { 
                  opacity: [0.3, 0.6, 0.4],
                  scale: [0.8, 1.1, 1],
                  rotate: [0, 360]
                } : {}}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="absolute inset-0 w-40 h-40 border-2 border-[var(--gold-500)]/30 rounded-full blur-sm"
              />
              
              {/* Logo background circle */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={stage !== 'enter' ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                className="relative w-40 h-40 bg-gradient-to-br from-black via-gray-900 to-black rounded-full flex items-center justify-center shadow-2xl border border-[var(--gold-500)]/20"
                style={{
                  boxShadow: `
                    0 0 30px var(--gold-500)/40,
                    0 0 60px var(--gold-400)/20,
                    0 0 100px var(--gold-500)/10,
                    inset 0 2px 20px rgba(212, 175, 55, 0.1)
                  `
                }}
              >
                {/* Brand Logo Image */}
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: -180 }}
                  animate={stage !== 'enter' ? { 
                    scale: 1, 
                    opacity: 1,
                    rotate: 0
                  } : {}}
                  transition={{ 
                    duration: 1.2,
                    delay: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="relative"
                >
                  <Image
                    src="/images/logo-splash.png"
                    alt="گالری معصومی"
                    width={120}
                    height={120}
                    priority
                    className="object-contain drop-shadow-lg filter"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(212, 175, 55, 0.3))'
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Inner sparkles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={stage !== 'enter' ? {
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    rotate: [0, 180]
                  } : {}}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.25 + 1.2
                  }}
                  className="absolute w-2 h-2 bg-[var(--gold-400)] rounded-full blur-sm"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-80px) translateX(-4px)`,
                    boxShadow: '0 0 8px var(--gold-400), 0 0 16px var(--gold-500)/50'
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={stage === 'text' || stage === 'exit' ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--gold-300) 0%, var(--gold-500) 30%, var(--gold-200) 60%, var(--gold-600) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.2))'
              }}
            >
              گالری معصومی
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={stage === 'text' || stage === 'exit' ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[var(--gold-400)] text-xl md:text-2xl font-medium tracking-wide"
            >
              جواهرات و طلای لوکس
            </motion.p>
          </motion.div>

          {/* Loading Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={stage === 'exit' ? { opacity: 1 } : {}}
            transition={{ duration: 0.4 }}
            className="mt-12"
          >
            <div className="flex justify-center space-x-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-3 h-3 bg-[var(--gold-500)] rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40" />
      </motion.div>
    </AnimatePresence>
  );
}