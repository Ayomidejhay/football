import React from "react";

const Loading = () => {
  return (
    <div className="w-full md:w-[600px] animate-pulse space-y-6">
      {/* League Header Skeleton */}
      <div className="flex items-center space-x-4 p-4 bg-[rgb(40,46,58)]/60 rounded-xl border border-slate-700/30">
        <div className="w-16 h-16 bg-slate-700 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-700 rounded-md"></div>
          <div className="h-4 w-24 bg-slate-700/70 rounded-md"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-3 p-1 bg-slate-800/40 rounded-xl max-w-xs border border-slate-700/20">
        <div className="h-9 w-28 bg-slate-700 rounded-lg"></div>
        <div className="h-9 w-28 bg-slate-700/50 rounded-lg"></div>
      </div>

      {/* Standings Table Skeleton */}
      <div className="w-full bg-[rgb(40,46,58)] rounded-xl border border-slate-700/50 overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between py-3 px-4 bg-slate-800/50 border-b border-slate-700">
          <div className="h-4 w-8 bg-slate-700 rounded"></div>
          <div className="h-4 w-32 bg-slate-700 rounded"></div>
          <div className="h-4 w-8 bg-slate-700 rounded"></div>
          <div className="h-4 w-8 bg-slate-700 rounded"></div>
          <div className="h-4 w-8 bg-slate-700 rounded"></div>
        </div>

        {/* Table Rows */}
        {[...Array(8)].map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-4 px-4 border-b border-slate-800 last:border-0"
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="h-4 w-4 bg-slate-700/75 rounded text-center"></div>
              <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
              <div className="h-4 w-28 bg-slate-700/80 rounded"></div>
            </div>
            <div className="flex space-x-6 items-center">
              <div className="h-4 w-6 bg-slate-700/60 rounded"></div>
              <div className="h-4 w-6 bg-slate-700/60 rounded"></div>
              <div className="h-4 w-6 bg-slate-700/80 rounded font-bold"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
