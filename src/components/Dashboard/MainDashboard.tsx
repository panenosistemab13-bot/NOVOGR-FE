import React from 'react';
import OperationalMenu from './OperationalMenu';
import CinematicLogisticPanel from './CinematicLogisticPanel';

export default function MainDashboard() {
  return (
    <div className="flex w-full h-screen overflow-hidden">
        {/* Left: 56% */}
        <div className="w-[56%] h-full">
            <OperationalMenu />
        </div>
        {/* Right: 44% */}
        <div className="w-[44%] h-full">
            <CinematicLogisticPanel />
        </div>
    </div>
  );
}
