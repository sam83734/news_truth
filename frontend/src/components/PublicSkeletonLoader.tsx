import React from 'react';

export const PublicSkeletonLoader: React.FC = () => {
  return (
    <div className="w-full animate-pulse space-y-10 py-4">
      {/* 1. Category Filter Pills Skeleton */}
      <div className="w-full px-4 sm:px-6 lg:px-8 border-b border-gray-100 py-3 bg-white">
        <div className="flex items-center gap-2.5 overflow-x-hidden">
          <div className="w-24 h-6 bg-gray-200 rounded-full shrink-0"></div>
          {[72, 96, 110, 84, 120, 90, 105].map((width, i) => (
            <div
              key={i}
              className="h-7 bg-gray-200 rounded-full shrink-0"
              style={{ width: `${width}px` }}
            ></div>
          ))}
        </div>
      </div>

      {/* 2. Hero Section Skeleton (Big Banner + 4 Stacked Cards) */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Big Featured Banner */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="h-[480px] sm:h-[540px] bg-neutral-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="w-24 h-6 bg-neutral-700 rounded-full"></div>
                <div className="w-28 h-6 bg-neutral-700 rounded-full"></div>
                <div className="w-28 h-6 bg-neutral-700 rounded-full"></div>
              </div>
              <div className="space-y-3">
                <div className="w-32 h-4 bg-neutral-700 rounded"></div>
                <div className="w-4/5 h-8 bg-neutral-700 rounded-lg"></div>
                <div className="w-3/5 h-8 bg-neutral-700 rounded-lg"></div>
                <div className="w-2/3 h-4 bg-neutral-700 rounded"></div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-28 h-9 bg-neutral-700 rounded-full"></div>
                  <div className="w-28 h-9 bg-neutral-700 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Stacked Side Cards */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-2xs"
              >
                <div className="w-24 sm:w-28 h-24 rounded-xl bg-gray-200 shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-28 h-3 bg-gray-200 rounded"></div>
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Weekly Top News Skeleton (6 Cards: 2 rows of 3 columns) */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
          <div className="space-y-1.5">
            <div className="w-32 h-4 bg-amber-100 rounded-full"></div>
            <div className="w-56 h-7 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="w-32 h-6 bg-gray-200 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 p-5 space-y-4 shadow-xs"
            >
              <div className="h-52 bg-gray-200 rounded-2xl"></div>
              <div className="space-y-2">
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
                <div className="w-full h-5 bg-gray-200 rounded"></div>
                <div className="w-4/5 h-5 bg-gray-200 rounded"></div>
                <div className="w-full h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Tech & Media News Skeleton */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-[420px] bg-neutral-800 rounded-3xl p-8 flex flex-col justify-end space-y-3">
            <div className="w-24 h-5 bg-neutral-700 rounded-full"></div>
            <div className="w-4/5 h-8 bg-neutral-700 rounded"></div>
            <div className="w-3/5 h-4 bg-neutral-700 rounded"></div>
          </div>
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="flex gap-4 p-5 rounded-3xl bg-white border border-gray-100 flex-1">
                <div className="w-32 h-32 rounded-2xl bg-gray-200 shrink-0"></div>
                <div className="flex-1 space-y-2 py-2">
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

