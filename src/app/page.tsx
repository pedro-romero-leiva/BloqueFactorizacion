"use client";

import { useState } from 'react';
import PowerUpBlocks from '@/components/power-up-blocks/power-up-blocks';
import Particles from '@/components/power-up-blocks/particles';
import WelcomeScreen from '@/components/power-up-blocks/welcome-screen';
import { cn } from '@/lib/utils';

export default function Home() {
  const [appVisible, setAppVisible] = useState(false);
  const [startTutorial, setStartTutorial] = useState(false);

  const handleStart = (tutorial: boolean) => {
    setStartTutorial(tutorial);
    setAppVisible(true);
  };

  return (
    <main className="bg-background min-h-screen text-foreground overflow-hidden relative">
      <div className={cn(
        "absolute inset-0 transition-opacity duration-1000",
        appVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <Particles />
        <PowerUpBlocks startInTutorialMode={startTutorial} />
      </div>
      {!appVisible && <WelcomeScreen onStart={handleStart} />}
    </main>
  );
}
