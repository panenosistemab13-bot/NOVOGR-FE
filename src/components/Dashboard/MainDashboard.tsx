import React from 'react';
import ObservatorioDashboard from './ObservatorioDashboard';

interface MainDashboardProps {
  onNavigate?: (tabId: string) => void;
}

export default function MainDashboard({ onNavigate }: MainDashboardProps) {
  return <ObservatorioDashboard />;
}
