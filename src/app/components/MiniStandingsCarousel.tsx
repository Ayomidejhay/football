"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface StandingsRow {
  position: number;
  team: { id: number; name: string; shortName: string; crest: string };
  playedGames: number;
  points: number;
}

const LeaguesConfig = [
  { code: "PL", name: "Premier League", emblem: "/img/leagues/premier_league.webp" },
  { code: "PD", name: "La Liga", emblem: "/img/leagues/laliga.svg" },
  { code: "SA", name: "Serie A", emblem: "/img/leagues/serie_a.webp" }
];

const MiniStandingsCarousel = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [standings, setStandings] = useState<{ [code: string]: StandingsRow[] }>({});
  const [loading, setLoading] = useState<{ [code: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  const activeLeague = LeaguesConfig[activeIdx];

  useEffect(() => {
    const code = activeLeague.code;
    
    // Skip if already fetched
    if (standings[code] || loading[code]) return;

    async function fetchStandings() {
      setLoading((prev) => ({ ...prev, [code]: true }));
      setError(null);
      try {
        const res = await fetch(`/api/competitions/${code}/standings`);
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const data = await res.json();
        const table = data?.standings?.[0]?.table || [];
        setStandings((prev) => ({ ...prev, [code]: table.slice(0, 5) }));
      } catch (err: any) {
        console.warn("Failed fetching mini standings:", err);
        setError("Rate limit: wait a moment & reload");
      } finally {
        setLoading((prev) => ({ ...prev, [code]: false }));
      }
    }

    fetchStandings();
  }, [activeIdx, standings, loading, activeLeague.code]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? LeaguesConfig.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === LeaguesConfig.length - 1 ? 0 : prev + 1));
  };

  const currentRows = standings[activeLeague.code] || [];
  const isCurrentLoading = loading[activeLeague.code];

  return (
    <div className="w-full bg-slate-800/20 rounded-xl p-3 border border-slate-700/20 shadow-sm space-y-3">
      {/* Slider Header */}
      <div className="flex justify-between items-center border-b border-slate-700/40 pb-2">
        <button
          onClick={handlePrev}
          className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-650 text-slate-350 flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center space-x-2">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Image
              src={activeLeague.emblem}
              alt={activeLeague.name}
              width={20}
              height={20}
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-white">
            {activeLeague.name.replace(" Premier", "")}
          </span>
        </div>

        <button
          onClick={handleNext}
          className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-650 text-slate-355 flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Standings Table Content */}
      {isCurrentLoading ? (
        <div className="py-8 text-center animate-pulse">
          <div className="h-2 bg-slate-700 rounded w-2/3 mx-auto mb-2" />
          <div className="h-2 bg-slate-700 rounded w-1/2 mx-auto" />
        </div>
      ) : error && currentRows.length === 0 ? (
        <div className="text-center py-4 text-[9px] font-semibold text-amber-400">
          {error}
        </div>
      ) : (
        <div className="text-[10px] space-y-1.5 animate-fade-in">
          {/* Header titles */}
          <div className="grid grid-cols-6 text-slate-450 font-bold uppercase text-[8px] pb-1 px-1">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-3 text-left">Team</span>
            <span className="col-span-1 text-center">P</span>
            <span className="col-span-1 text-center">PTS</span>
          </div>
          {/* Roster entries */}
          {currentRows.map((row) => (
            <div
              key={row.team.id}
              className="grid grid-cols-6 items-center py-1 px-1 rounded hover:bg-slate-700/20 border border-transparent hover:border-slate-700/30 transition-all"
            >
              <span className="col-span-1 text-center font-bold text-slate-400">
                {row.position}
              </span>
              <div className="col-span-3 flex items-center space-x-1.5 truncate pr-1">
                {row.team.crest && (
                  <div className="relative w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={row.team.crest}
                      alt={row.team.name}
                      width={14}
                      height={14}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <span className="font-semibold text-slate-200 truncate">
                  {row.team.shortName || row.team.name.replace(" FC", "")}
                </span>
              </div>
              <span className="col-span-1 text-center text-slate-350">{row.playedGames}</span>
              <span className="col-span-1 text-center font-bold text-teal-400">{row.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MiniStandingsCarousel;
