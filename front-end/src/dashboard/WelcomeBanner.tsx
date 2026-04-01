import React from 'react';
import { Award } from 'lucide-react';

interface WelcomeBannerProps {
  studentName: string;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ studentName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-8 text-white mb-8">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-emerald-100 text-sm font-medium flex items-center gap-2">
            <Award size={16} />
            {getGreeting()}
          </p>
          <h2 className="text-3xl font-bold mt-2">Welcome, {studentName}! 👋</h2>
          <p className="text-emerald-100 mt-3">
            Here&apos;s an overview of your OBE learning progress and assessment activities.
          </p>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-right hidden sm:block">
          <p className="text-emerald-100 text-sm">Total CLOs</p>
          <p className="text-3xl font-bold mt-1">8/12</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
