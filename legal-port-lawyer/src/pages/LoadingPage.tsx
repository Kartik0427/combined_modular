// SkeletonDashboard.tsx
import React from 'react';

const LoginPage = () => {
  return (
    <div className="animate-pulse space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="h-16 bg-gray-300 rounded-xl w-full"></div>

      {/* Top Card Skeletons */}
      <div className="flex flex-wrap gap-4">
        <div className="h-20 w-full md:w-1/2 bg-gray-300 rounded-xl"></div>
        <div className="h-20 w-full md:w-1/2 bg-gray-300 rounded-xl"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="flex flex-wrap gap-4">
        <div className="h-24 w-full md:w-1/2 bg-gray-300 rounded-xl"></div>
        <div className="h-24 w-full md:w-1/2 bg-gray-300 rounded-xl"></div>
      </div>

      {/* Menu/Grid Options */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-28 bg-gray-300 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
};

export default LoginPage;
