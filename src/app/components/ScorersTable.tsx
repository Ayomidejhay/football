"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Player {
  id: number;
  name: string;
  nationality: string;
  position: string | null;
}

interface Team {
  id: number;
  name: string;
  shortName: string;
  crest: string;
}

interface Scorer {
  player: Player;
  team: Team;
  playedMatches: number;
  goals: number;
  assists: number | null;
}

interface ScorersTableProps {
  competitionCode: string;
}

const ScorersTable = ({ competitionCode }: ScorersTableProps) => {
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScorers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/competitions/${competitionCode}/scorers`);
        
        if (!res.ok) {
          if (res.status === 429) {
            setError("Rate limit exceeded (10 calls/min). Please wait 15 seconds and try again.");
          } else {
            setError("Unable to load league statistics at this time.");
          }
          return;
        }

        const data = await res.json();
        setScorers(data.scorers || []);
      } catch (err) {
        setError("Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchScorers();
  }, [competitionCode]);

  if (loading) {
    return (
      <div className="animate-pulse w-full bg-[rgb(40,46,58)] rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="flex items-center justify-between py-3 px-4 bg-slate-800/50 border-b border-slate-700">
          <div className="h-4 w-6 bg-slate-700 rounded"></div>
          <div className="h-4 w-32 bg-slate-700 rounded"></div>
          <div className="h-4 w-12 bg-slate-700 rounded"></div>
          <div className="h-4 w-6 bg-slate-700 rounded"></div>
          <div className="h-4 w-6 bg-slate-700 rounded"></div>
        </div>
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="flex items-center justify-between py-4 px-4 border-b border-slate-850 last:border-0">
            <div className="flex items-center space-x-4 flex-1">
              <div className="h-4 w-4 bg-slate-700/75 rounded"></div>
              <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
              <div className="h-4 w-28 bg-slate-700/80 rounded"></div>
            </div>
            <div className="flex space-x-8 items-center">
              <div className="h-4 w-6 bg-slate-700/60 rounded"></div>
              <div className="h-4 w-6 bg-slate-700/80 rounded font-bold"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-[rgb(40,46,58)] rounded-xl border border-rose-500/25 shadow-md space-y-2">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-slate-300 text-sm font-semibold">Stats unavailable</p>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">{error}</p>
      </div>
    );
  }

  if (scorers.length === 0) {
    return (
      <div className="p-8 text-center bg-[rgb(40,46,58)] rounded-xl border border-slate-750 shadow-md">
        <p className="text-slate-400 font-medium">No scorer statistics recorded yet.</p>
        <p className="text-xs text-slate-500 mt-1">Goalscorer leaderboard will populate once match play begins.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl bg-[rgb(40,46,58)] shadow-xl border border-slate-700/50 backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800/50 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
            <th className="py-3 px-3 w-10 text-center">Rank</th>
            <th className="py-3 px-4">Player</th>
            <th className="py-3 px-4">Club</th>
            <th className="py-3 px-3 text-center">MP</th>
            <th className="py-3 px-3 text-center text-teal-400">Goals</th>
            <th className="py-3 px-3 text-center hidden sm:table-cell">Assists</th>
          </tr>
        </thead>
        <tbody className="text-xs md:text-sm divide-y divide-slate-800 text-textPrimary">
          {scorers.map((scorer, index) => (
            <tr
              key={`${scorer.player.id}-${index}`}
              className="border-l-4 border-transparent hover:bg-slate-700/30 transition-colors duration-150"
            >
              <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                {index + 1}
              </td>
              <td className="py-3.5 px-4 font-bold text-white">
                <div>
                  <span className="block">{scorer.player.name}</span>
                  <span className="block text-[10px] text-slate-400 font-medium">
                    {scorer.player.nationality}
                  </span>
                </div>
              </td>
              <td className="py-3.5 px-4 font-semibold text-slate-300">
                <div className="flex items-center space-x-2">
                  {scorer.team.crest && (
                    <div className="relative w-5 h-5 flex-shrink-0">
                      <Image
                        src={scorer.team.crest}
                        alt={scorer.team.name}
                        fill
                        sizes="20px"
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {scorer.team.shortName || scorer.team.name}
                  </span>
                </div>
              </td>
              <td className="py-3.5 px-3 text-center font-medium text-slate-400">
                {scorer.playedMatches}
              </td>
              <td className="py-3.5 px-3 text-center font-bold text-teal-400 text-sm md:text-base">
                {scorer.goals}
              </td>
              <td className="py-3.5 px-3 text-center font-semibold text-slate-400 hidden sm:table-cell">
                {scorer.assists ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScorersTable;
