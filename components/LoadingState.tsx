import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-xxl py-32">
      <div className="w-8 h-8 border-3 border-hairline border-t-primary rounded-full animate-spin"></div>
    </div>
  );
};

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-md animate-pulse">
      <div className="h-6 bg-hairline rounded-sm w-1/3"></div>
      <div className="h-10 bg-hairline rounded-md w-full"></div>
      <div className="h-10 bg-hairline rounded-md w-full"></div>
    </div>
  );
};
