'use client';

import { GameProvider } from './game-context';
import React from 'react';

export default function ScoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GameProvider>
      {children}
    </GameProvider>
  );
}