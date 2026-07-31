"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CompetitionStandingsType, matchesType } from "@/types";
import StandingsTable from "./StandingsTable";
import Matches from "./Matches";
import Competition from "./Competition";
import TeamDrawer from "./TeamDrawer";
import ScorersTable from "./ScorersTable";

interface LeagueDashboardProps {
  standings: CompetitionStandingsType | null;
  matches: matchesType[];
  leagueInfo: { code: string; name: string; emblem: string };
  slug: string;
  initialTab: string;
}

const LeagueDashboard = ({
  standings,
  matches,
  leagueInfo,
  slug,
  initialTab
}: LeagueDashboardProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const currentMatchday = standings?.season?.currentMatchday;

  const tabClass = (tabName: string) => {
    const base = "px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-150 cursor-pointer text-center flex-1";
    return activeTab === tabName
      ? `${base} bg-teal-400 text-slate-900 shadow-md shadow-teal-500/10`
      : `${base} bg-slate-700 text-slate-300 hover:bg-slate-650 hover:text-white`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Panel */}
      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-[rgb(40,46,58)] to-[rgb(48,55,68)] rounded-2xl border border-slate-700/40 shadow-lg">
        <div className="relative w-16 h-16 bg-slate-800/80 p-2 rounded-xl flex items-center justify-center border border-slate-750 flex-shrink-0">
          <Image
            src={leagueInfo.emblem}
            alt={leagueInfo.name}
            fill
            sizes="64px"
            className="object-contain p-1.5"
            priority
            unoptimized
          />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{leagueInfo.name}</h1>
          {standings?.season ? (
            <p className="text-xs text-slate-400 mt-0.5">
              Season: {new Date(standings.season.startDate).getFullYear()} -{" "}
              {new Date(standings.season.endDate).getFullYear()}
              {currentMatchday && ` • Matchday ${currentMatchday}`}
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-0.5">Competition dashboard</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 p-1 bg-slate-800/30 border border-slate-700/25 rounded-xl max-w-sm md:max-w-md w-full">
        <button onClick={() => setActiveTab("standings")} className={tabClass("standings")}>
          Standings
        </button>
        <button onClick={() => setActiveTab("matches")} className={tabClass("matches")}>
          Matches
        </button>
        <button onClick={() => setActiveTab("scorers")} className={tabClass("scorers")}>
          Top Scorers
        </button>
      </div>

      {/* Tab Contents */}
      <div className="w-full transition-all duration-200">
        {activeTab === "standings" ? (
          standings?.standings?.[0]?.table ? (
            <StandingsTable
              table={standings.standings[0].table}
              competitionCode={leagueInfo.code}
              onTeamClick={(id) => setSelectedTeamId(id)}
            />
          ) : (
            <div className="p-8 text-center bg-[rgb(40,46,58)] rounded-xl border border-slate-750 shadow-md">
              <p className="text-slate-400 font-medium">Unable to load standings table.</p>
              <p className="text-xs text-slate-500 mt-2">
                This could be due to API rate limits or competition data constraints.
              </p>
            </div>
          )
        ) : activeTab === "matches" ? (
          <div className="space-y-3">
            {matches.length > 0 ? (
              matches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => router.push(`/matches/${match.id}`)}
                  className="py-3 px-3 rounded-xl flex flex-col bg-[rgb(40,46,58)] border border-slate-700/30 hover:border-slate-700/70 hover:bg-[rgb(48,55,68)] transition-all duration-150 mb-2 shadow-sm cursor-pointer"
                >
                  <Competition data={match} />
                  <Matches data={match} />
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-[rgb(40,46,58)] rounded-xl border border-slate-750 shadow-md">
                <p className="text-slate-400 font-medium">No matches scheduled for Matchday {currentMatchday || ""}.</p>
                <p className="text-xs text-slate-500 mt-1">Check back later for updates or next fixtures.</p>
              </div>
            )}
          </div>
        ) : (
          <ScorersTable competitionCode={leagueInfo.code} />
        )}
      </div>

      {/* Roster sliding panel drawer */}
      <TeamDrawer teamId={selectedTeamId} onClose={() => setSelectedTeamId(null)} />
    </div>
  );
};

export default LeagueDashboard;

