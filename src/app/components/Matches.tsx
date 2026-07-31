import { matchesType } from "@/types";
import Image from "next/image";
import React from "react";

const Matches = ({ data }: { data: matchesType }) => {
  const getDate = new Date(data?.utcDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const isLive = data?.status === "IN_PLAY" || data?.status === "PAUSED";
  const isFinished = data?.status === "FINISHED";

  return (
    <div className="grid grid-cols-3 items-center py-1">
      {/* Home Team */}
      <div className="w-full flex items-center space-x-2">
        <div className="w-6 h-6 relative flex-shrink-0 flex items-center justify-center">
          <Image
            src={data?.homeTeam?.crest || "/football-info.png"}
            alt={data?.homeTeam?.name || "Home Team"}
            fill
            sizes="24px"
            className="object-contain"
            unoptimized
          />
        </div>
        <p className="text-xs md:text-sm font-semibold text-white truncate max-w-[120px] md:max-w-none">
          {data?.homeTeam?.shortName || data?.homeTeam?.name}
        </p>
      </div>

      {/* Match Status & Score / Time */}
      <div className="flex flex-col items-center justify-center space-y-1">
        <div
          className={`px-3 py-1 rounded-lg flex items-center justify-center font-semibold text-center min-w-[70px] shadow-sm transition-colors duration-150 ${
            isLive
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs md:text-sm font-bold"
              : isFinished
              ? "bg-slate-700/60 text-slate-300 text-xs md:text-sm"
              : "bg-slate-800 text-teal-400 text-xs"
          }`}
        >
          {isLive || isFinished ? (
            <p className="tracking-widest">
              {data?.score?.fullTime?.home ?? 0} : {data?.score?.fullTime?.away ?? 0}
            </p>
          ) : (
            <p>{getDate}</p>
          )}
        </div>

        {/* Live indicator badge */}
        {isLive && (
          <div className="flex items-center space-x-1 animate-pulse">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </span>
            <span className="text-[9px] uppercase tracking-wider text-red-500 font-bold">
              {data.status === "PAUSED" ? "HT" : "Live"}
            </span>
          </div>
        )}

        {/* Full Time indicator */}
        {isFinished && (
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
            FT
          </span>
        )}
      </div>

      {/* Away Team */}
      <div className="w-full flex items-center justify-end space-x-2">
        <p className="text-xs md:text-sm font-semibold text-white text-right truncate max-w-[120px] md:max-w-none">
          {data?.awayTeam?.shortName || data?.awayTeam?.name}
        </p>
        <div className="w-6 h-6 relative flex-shrink-0 flex items-center justify-center">
          <Image
            src={data?.awayTeam?.crest || "/football-info.png"}
            alt={data?.awayTeam?.name || "Away Team"}
            fill
            sizes="24px"
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
};

export default Matches;