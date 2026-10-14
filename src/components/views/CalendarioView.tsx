import React from 'react';
import PresenceList from '../PresenceList';

interface CalendarioViewProps {
  onBack?: () => void;
}

export default function CalendarioView({ onBack }: CalendarioViewProps) {
  return <PresenceList onBack={onBack} />;
}
