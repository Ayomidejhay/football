"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Player {
  id: number;
  name: string;
  position: string;
  dateOfBirth: string;
  nationality: string;
}

interface TeamData {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  founded: number;
  clubColors: string;
  venue: string;
  website: string;
  squad: Player[];
  coach?: {
    name: string;
    nationality: string;
  };
}

interface TeamDrawerProps {
  teamId: number | null;
  onClose: () => void;
}

const TeamDrawer = ({ teamId, onClose }: TeamDrawerProps) => {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (teamId === null) {
      setIsOpen(false);
      // Wait for exit transition
      const timer = setTimeout(() => {
        setTeam(null);
        setError(null);
      }, 300);
      return () => clearTimeout(timer);
    }

    setIsOpen(true);
    setLoading(true);
    setError(null);

    const fetchTeam = async () => {
      try {
        const res = await fetch(`/api/teams/${teamId}`);
        if (!res.ok) {
          if (res.status === 429) {
            setError("Rate limit exceeded (10 calls/min). Please wait 15 seconds and try again.");
          } else if (res.status === 403) {
            setError("Access restricted. Roster details are not available for this team under the free plan.");
          } else {
            setError("Unable to load team information.");
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setTeam(data);
      } catch (err) {
        setError("Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  const groupPlayers = (squad: Player[] = []) => {
    const groups: { [key: string]: Player[] } = {
      Goalkeeper: [],
      Defence: [],
      Midfield: [],
      Offence: []
    };

    squad.forEach((player) => {
      let pos = player.position || "Other";
      // Normalize position naming
      if (pos.toLowerCase().includes("goalkeeper")) groups.Goalkeeper.push(player);
      else if (pos.toLowerCase().includes("def")) groups.Defence.push(player);
      else if (pos.toLowerCase().includes("mid")) groups.Midfield.push(player);
      else if (pos.toLowerCase().includes("off") || pos.toLowerCase().includes("att") || pos.toLowerCase().includes("forw")) {
        groups.Offence.push(player);
      } else {
        if (!groups[pos]) groups[pos] = [];
        groups[pos].push(player);
      }
    });

    return groups;
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[rgb(32,38,48)] border-l border-slate-700/50 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header Toolbar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700/60 flex-shrink-0 bg-[rgb(40,46,58)]/40">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400">Team Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
          {loading ? (
            /* Shimmer loading */
            <div className="animate-pulse space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-slate-700 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-6 w-40 bg-slate-700 rounded"></div>
                  <div className="h-4 w-20 bg-slate-700 rounded"></div>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <div className="h-4 w-full bg-slate-750 rounded"></div>
                <div className="h-4 w-5/6 bg-slate-750 rounded"></div>
                <div className="h-4 w-4/5 bg-slate-750 rounded"></div>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="h-5 w-24 bg-slate-700 rounded"></div>
                <div className="h-10 w-full bg-slate-750 rounded"></div>
                <div className="h-10 w-full bg-slate-750 rounded"></div>
              </div>
            </div>
          ) : error ? (
            /* Error display */
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-slate-200 font-bold text-sm">Failed to Load</h3>
              <p className="text-slate-400 text-xs px-6 leading-relaxed">{error}</p>
            </div>
          ) : team ? (
            /* Team information */
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="flex items-center space-x-4">
                {team.crest && (
                  <div className="relative w-20 h-20 bg-slate-900/60 p-3.5 rounded-2xl flex items-center justify-center border border-slate-700/50 flex-shrink-0">
                    <Image
                      src={team.crest}
                      alt={team.name}
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white leading-tight">{team.name}</h3>
                  <p className="text-xs text-teal-400 font-medium tracking-wide">
                    {team.tla} • Founded: {team.founded || "N/A"}
                  </p>
                </div>
              </div>

              {/* General Metadata Info Table */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/30 text-xs md:text-sm space-y-2.5">
                {team.venue && (
                  <div className="flex justify-between py-1 border-b border-slate-700/30 last:border-0">
                    <span className="text-slate-400">Stadium</span>
                    <span className="font-semibold text-slate-200">{team.venue}</span>
                  </div>
                )}
                {team.clubColors && (
                  <div className="flex justify-between py-1 border-b border-slate-700/30 last:border-0">
                    <span className="text-slate-400">Club Colors</span>
                    <span className="font-semibold text-slate-200">{team.clubColors}</span>
                  </div>
                )}
                {team.website && (
                  <div className="flex justify-between py-1 border-b border-slate-700/30 last:border-0">
                    <span className="text-slate-400">Website</span>
                    <a
                      href={team.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-teal-400 hover:underline"
                    >
                      {team.website.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  </div>
                )}
              </div>

              {/* Coach details */}
              {team.coach && team.coach.name && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Coach</h4>
                  <div className="bg-slate-800/20 px-4 py-3 rounded-xl border border-slate-700/30 flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-bold text-white">{team.coach.name}</span>
                    <span className="text-slate-400 text-xs font-medium">{team.coach.nationality}</span>
                  </div>
                </div>
              )}

              {/* Squad List Positional Grids */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                  Squad List
                </h4>

                {team.squad && team.squad.length > 0 ? (
                  (() => {
                    const grouped = groupPlayers(team.squad);
                    return Object.keys(grouped).map((position) => {
                      const list = grouped[position];
                      if (list.length === 0) return null;
                      return (
                        <div key={position} className="space-y-1.5">
                          <h5 className="text-[10px] font-bold uppercase tracking-widest text-teal-400 px-1">
                            {position}s
                          </h5>
                          <div className="divide-y divide-slate-850 bg-slate-900/30 rounded-xl border border-slate-800/60 overflow-hidden">
                            {list.map((player) => (
                              <div
                                key={player.id}
                                className="flex justify-between items-center px-4 py-2.5 hover:bg-slate-800/20 transition-colors duration-100"
                              >
                                <span className="font-semibold text-white text-xs sm:text-sm">
                                  {player.name}
                                </span>
                                <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                                  {player.nationality}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div className="py-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    <p className="text-xs">Roster list currently not available.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default TeamDrawer;
