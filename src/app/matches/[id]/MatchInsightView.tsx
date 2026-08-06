"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface H2HTeamStats {
  id: number;
  name: string;
  wins: number;
  draws: number;
  losses: number;
}

interface H2HData {
  aggregates: {
    numberOfMatches: number;
    homeTeam: H2HTeamStats;
    awayTeam: H2HTeamStats;
  };
  matches: Array<{
    id: number;
    utcDate: string;
    status: string;
    homeTeam: { id: number; name: string; crest: string; shortName?: string };
    awayTeam: { id: number; name: string; crest: string; shortName?: string };
    score: {
      fullTime: { home: number | null; away: number | null };
    };
  }>;
}

interface MatchInsightViewProps {
  matchDetails: any;
  h2hData: H2HData | null;
  externalData: any;
}

interface PredictorCardProps {
  matchId: number;
  homeTeamName: string;
  awayTeamName: string;
}

const PredictorCard = ({ matchId, homeTeamName, awayTeamName }: PredictorCardProps) => {
  const [userVote, setUserVote] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(`match-prediction-${matchId}`);
    if (saved) {
      setUserVote(saved);
    }
  }, [matchId]);

  const handleVote = (vote: string) => {
    localStorage.setItem(`match-prediction-${matchId}`, vote);
    setUserVote(vote);
  };

  if (!mounted) {
    return (
      <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/20 animate-pulse h-28 animate-fade-in" />
    );
  }

  // If user has voted, show their prediction choice
  if (userVote) {
    const isHome = userVote === "HOME";
    const isDraw = userVote === "DRAW";
    const isAway = userVote === "AWAY";

    return (
      <div className="bg-gradient-to-r from-slate-800/40 to-slate-800/20 p-5 rounded-2xl border border-slate-700/30 shadow-md space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Prediction Hub</h3>
          <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-0.5 rounded font-bold">
            Prediction Saved
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Your Pick</p>
            <p className="text-sm font-extrabold text-white mt-1">
              {isHome ? `${homeTeamName} Win` : isDraw ? "Draw Match" : `${awayTeamName} Win`}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem(`match-prediction-${matchId}`);
              setUserVote(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-750 border border-slate-700/50 hover:border-slate-500 text-[10px] text-slate-350 font-bold hover:text-white transition-all cursor-pointer"
          >
            Change prediction
          </button>
        </div>
      </div>
    );
  }

  // If user hasn't voted yet, render action buttons
  return (
    <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30 shadow-md space-y-4 text-center animate-fade-in">
      <div className="text-left">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Prediction Hub</h3>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Cast your vote on who will win this encounter!</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <button
          onClick={() => handleVote("HOME")}
          className="py-2.5 px-2 rounded-xl bg-slate-750 border border-slate-700/50 hover:border-teal-500/50 hover:bg-slate-700 text-xs text-slate-200 font-semibold transition-all cursor-pointer truncate"
        >
          {homeTeamName}
        </button>
        <button
          onClick={() => handleVote("DRAW")}
          className="py-2.5 px-2 rounded-xl bg-slate-750 border border-slate-700/50 hover:border-teal-500/50 hover:bg-slate-700 text-xs text-slate-200 font-semibold transition-all cursor-pointer"
        >
          Draw
        </button>
        <button
          onClick={() => handleVote("AWAY")}
          className="py-2.5 px-2 rounded-xl bg-slate-750 border border-slate-700/50 hover:border-teal-500/50 hover:bg-slate-700 text-xs text-slate-200 font-semibold transition-all cursor-pointer truncate"
        >
          {awayTeamName}
        </button>
      </div>
    </div>
  );
};

const MatchInsightView = ({ matchDetails, h2hData, externalData }: MatchInsightViewProps) => {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<"h2h" | "details" | "lineups" | "stats" | "events">("h2h");

  if (!matchDetails) {
    return (
      <div className="py-12 text-center text-slate-400">
        <p className="text-lg font-semibold">Match details could not be loaded.</p>
        <Link href="/" className="text-teal-400 font-bold hover:underline mt-4 inline-block">
          Go Back Home
        </Link>
      </div>
    );
  }

  // Calculate H2H record from list
  const calculatedAggregates = React.useMemo(() => {
    if (!h2hData || !h2hData.matches || h2hData.matches.length === 0) {
      return { homeWins: 0, awayWins: 0, draws: 0, total: 0 };
    }

    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;

    h2hData.matches.forEach((m) => {
      const homeScore = m.score.fullTime.home;
      const awayScore = m.score.fullTime.away;

      if (homeScore !== null && awayScore !== null) {
        const isCurrentHome = m.homeTeam.id === h2hData.aggregates.homeTeam.id;

        if (homeScore > awayScore) {
          if (isCurrentHome) homeWins++;
          else awayWins++;
        } else if (awayScore > homeScore) {
          if (isCurrentHome) awayWins++;
          else homeWins++;
        } else {
          draws++;
        }
      }
    });

    const total = homeWins + awayWins + draws;
    return { homeWins, awayWins, draws, total };
  }, [h2hData]);

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getExternalStat = (teamIdx: number, typeName: string): { raw: number | string; percentage: number } => {
    if (!externalData || !externalData.statistics || !externalData.statistics[teamIdx]) {
      return { raw: 0, percentage: 50 };
    }

    const statsArray = externalData.statistics[teamIdx].statistics;
    const statItem = statsArray.find((s: any) => s.type === typeName);
    const value = statItem?.value;

    if (value === null || value === undefined) {
      return { raw: 0, percentage: 50 };
    }

    if (typeof value === "string" && value.endsWith("%")) {
      const num = parseInt(value.slice(0, -1), 10) || 0;
      return { raw: value, percentage: num };
    }

    const numValue = parseInt(value, 10) || 0;
    const oppStatsArray = externalData.statistics[1 - teamIdx]?.statistics || [];
    const oppItem = oppStatsArray.find((s: any) => s.type === typeName);
    const oppVal = parseInt(oppItem?.value, 10) || 0;
    const total = numValue + oppVal;

    const pct = total === 0 ? 50 : Math.round((numValue / total) * 100);
    return { raw: numValue, percentage: pct };
  };

  const homeScore = matchDetails.score?.fullTime?.home;
  const awayScore = matchDetails.score?.fullTime?.away;
  const status = matchDetails.status;
  const isScheduled = status !== "FINISHED" && status !== "IN_PLAY" && status !== "PAUSED";
  const dateStr = new Date(matchDetails.utcDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const sortedEvents = React.useMemo(() => {
    if (!externalData || !externalData.events || externalData.events.length === 0) {
      return [];
    }
    return [...externalData.events].sort((a, b) => a.time.elapsed - b.time.elapsed);
  }, [externalData]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-3 py-2 md:px-0">
      {/* Back navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-xs md:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800/40 border border-slate-700/30 rounded-xl px-3 py-1.5 w-fit"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        <span>Back to Matches</span>
      </button>

      {/* Main Scoreboard Banner */}
      <div className="bg-gradient-to-br from-[rgb(40,46,58)] to-[rgb(30,36,46)] border border-slate-700/40 rounded-3xl p-6 md:p-8 shadow-xl text-center space-y-6 relative overflow-hidden">
        {/* Glow accents */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
            {matchDetails.competition?.name}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">{dateStr}</span>
        </div>

        {/* Scoreboard layout */}
        <div className="grid grid-cols-7 items-center max-w-2xl mx-auto">
          {/* Home Crest & Name */}
          <div className="col-span-3 flex flex-col items-center space-y-3">
            {matchDetails.homeTeam.crest && (
              <div className="relative w-16 h-16 md:w-20 md:h-20 bg-slate-800/20 p-2.5 rounded-2xl border border-slate-700/35 flex items-center justify-center">
                <Image
                  src={matchDetails.homeTeam.crest}
                  alt={matchDetails.homeTeam.name}
                  width={64}
                  height={64}
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            <span className="text-sm md:text-lg font-bold text-white leading-tight">
              {matchDetails.homeTeam.name}
            </span>
          </div>

          {/* Score */}
          <div className="col-span-1 flex flex-col items-center justify-center space-y-1">
            <span className="text-3xl md:text-5xl font-extrabold tracking-tight text-white px-2">
              {isScheduled ? "" : (homeScore ?? 0)}
            </span>
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest">vs</span>
            <span className="text-3xl md:text-5xl font-extrabold tracking-tight text-white px-2">
              {isScheduled ? "" : (awayScore ?? 0)}
            </span>
          </div>

          {/* Away Crest & Name */}
          <div className="col-span-3 flex flex-col items-center space-y-3">
            {matchDetails.awayTeam.crest && (
              <div className="relative w-16 h-16 md:w-20 md:h-20 bg-slate-800/20 p-2.5 rounded-2xl border border-slate-700/35 flex items-center justify-center">
                <Image
                  src={matchDetails.awayTeam.crest}
                  alt={matchDetails.awayTeam.name}
                  width={64}
                  height={64}
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            <span className="text-sm md:text-lg font-bold text-white leading-tight">
              {matchDetails.awayTeam.name}
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <span className={`text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            status === "FINISHED" ? "bg-slate-750 text-slate-400 border border-slate-700/50" : "bg-emerald-500/15 text-emerald-450 border border-emerald-500/20 animate-pulse font-extrabold"
          }`}>
            {status?.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Dynamic Fan Predictor Hub */}
      <PredictorCard
        matchId={matchDetails.id}
        homeTeamName={matchDetails.homeTeam.name}
        awayTeamName={matchDetails.awayTeam.name}
      />

      {/* Tabs list */}
      <div className="flex p-1 bg-slate-800/20 border border-slate-700/30 rounded-xl space-x-1 overflow-x-auto no-scrollbar w-full">
        {h2hData && (
          <>
            <button
              onClick={() => setActiveSubTab("h2h")}
              className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                activeSubTab === "h2h"
                  ? "bg-slate-700 text-teal-400 border border-slate-650/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              H2H History
            </button>
            <button
              onClick={() => setActiveSubTab("details")}
              className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                activeSubTab === "details"
                  ? "bg-slate-700 text-teal-400 border border-slate-650/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Match Details
            </button>
            <button
              onClick={() => setActiveSubTab("lineups")}
              className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                activeSubTab === "lineups"
                  ? "bg-slate-700 text-teal-400 border border-slate-650/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Lineups
            </button>
            <button
              onClick={() => setActiveSubTab("stats")}
              className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                activeSubTab === "stats"
                  ? "bg-slate-700 text-teal-400 border border-slate-650/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveSubTab("events")}
              className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                activeSubTab === "events"
                  ? "bg-slate-700 text-teal-400 border border-slate-650/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Timeline
            </button>
          </>
        )}
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {/* H2H */}
        {activeSubTab === "h2h" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Aggregates chart */}
            <div className="md:col-span-1 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30 flex flex-col justify-center space-y-4">
              <div className="text-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">H2H aggregates</h4>
                <p className="text-3xl font-extrabold text-white mt-1">
                  {calculatedAggregates.total} <span className="text-xs font-normal text-slate-500">Recent matches</span>
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between text-xs font-semibold text-slate-350">
                  <span className="truncate max-w-[100px]">{h2hData?.aggregates.homeTeam.name}</span>
                  <span className="truncate max-w-[100px]">{h2hData?.aggregates.awayTeam.name}</span>
                </div>

                <div className="h-3.5 w-full bg-slate-700/40 rounded-full flex overflow-hidden border border-slate-700/20">
                  <div
                    className="bg-emerald-500 hover:bg-emerald-400 transition-all duration-300"
                    style={{ width: `${getPercentage(calculatedAggregates.homeWins, calculatedAggregates.total)}%` }}
                  />
                  <div
                    className="bg-slate-500 hover:bg-slate-450 transition-all duration-300"
                    style={{ width: `${getPercentage(calculatedAggregates.draws, calculatedAggregates.total)}%` }}
                  />
                  <div
                    className="bg-rose-500 hover:bg-rose-400 transition-all duration-300"
                    style={{ width: `${getPercentage(calculatedAggregates.awayWins, calculatedAggregates.total)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs pt-1.5 px-1">
                  <div className="flex flex-col items-start">
                    <span className="font-extrabold text-emerald-400 text-sm">{calculatedAggregates.homeWins}</span>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">Wins</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-extrabold text-slate-300 text-sm">{calculatedAggregates.draws}</span>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">Draws</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-extrabold text-rose-400 text-sm">{calculatedAggregates.awayWins}</span>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">Wins</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Matches list */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Recent Encounters
              </h4>
              {h2hData?.matches && h2hData.matches.length > 0 ? (
                <div className="space-y-3">
                  {h2hData.matches.slice(0, 8).map((match) => {
                    const matchDate = new Date(match.utcDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });
                    const isHomeWinner = (match.score.fullTime.home ?? 0) > (match.score.fullTime.away ?? 0);
                    const isAwayWinner = (match.score.fullTime.away ?? 0) > (match.score.fullTime.home ?? 0);

                    return (
                      <div key={match.id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/20 flex flex-col space-y-2.5 hover:bg-slate-800/40 transition-colors">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                          <span>H2H History</span>
                          <span>{matchDate}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                          <div className="flex items-center space-x-2.5">
                            {match.homeTeam.crest && (
                              <Image src={match.homeTeam.crest} alt={match.homeTeam.name} width={18} height={18} className="object-contain" unoptimized />
                            )}
                            <span className={`text-xs truncate ${isHomeWinner ? "font-bold text-white" : "text-slate-400"}`}>
                              {match.homeTeam.shortName || match.homeTeam.name}
                            </span>
                          </div>
                          <div className="flex justify-center">
                            <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-800 text-teal-400 rounded-md border border-slate-700/30">
                              {match.score.fullTime.home ?? 0} - {match.score.fullTime.away ?? 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-end space-x-2.5">
                            <span className={`text-xs truncate text-right ${isAwayWinner ? "font-bold text-white" : "text-slate-400"}`}>
                              {match.awayTeam.shortName || match.awayTeam.name}
                            </span>
                            {match.awayTeam.crest && (
                              <Image src={match.awayTeam.crest} alt={match.awayTeam.name} width={18} height={18} className="object-contain" unoptimized />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">No head-to-head records.</p>
              )}
            </div>
          </div>
        )}

        {/* DETAILS */}
        {activeSubTab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Scoreboard Info */}
            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/30 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700/40 pb-2">Score Breakdown</h4>
              <div className="space-y-4 text-xs md:text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">First Half (HT)</span>
                  <span className="font-bold text-slate-200">
                    {matchDetails.score?.halfTime?.home ?? 0} - {matchDetails.score?.halfTime?.away ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-800/50">
                  <span className="text-slate-400">Second Half (FT)</span>
                  <span className="font-bold text-slate-200">
                    {((matchDetails.score?.fullTime?.home ?? 0) - (matchDetails.score?.halfTime?.home ?? 0))} - {((matchDetails.score?.fullTime?.away ?? 0) - (matchDetails.score?.halfTime?.away ?? 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-t border-teal-500/20 font-bold">
                  <span className="text-teal-400 font-extrabold text-sm">Full Time Score</span>
                  <span className="text-teal-400 text-base">
                    {matchDetails.score?.fullTime?.home ?? 0} - {matchDetails.score?.fullTime?.away ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Stadium/Ref Info */}
            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/30 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700/40 pb-2">Match Information</h4>
              <div className="space-y-4 text-xs md:text-sm">
                <div className="flex justify-between py-1 border-b border-slate-800/30 last:border-0 pb-1.5">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-bold capitalize ${matchDetails.status === "FINISHED" ? "text-slate-450 text-slate-400" : "text-emerald-450 text-emerald-400 font-bold"}`}>
                    {matchDetails.status?.toLowerCase().replace("_", " ")}
                  </span>
                </div>
                {(externalData?.fixture?.venue?.name || matchDetails.venue) && (
                  <div className="flex justify-between py-1 border-b border-slate-800/30 last:border-0 pb-1.5">
                    <span className="text-slate-400">Stadium</span>
                    <span className="font-bold text-slate-200">{externalData?.fixture?.venue?.name || matchDetails.venue}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-800/30 last:border-0 pb-1.5">
                  <span className="text-slate-400">Matchday</span>
                  <span className="font-bold text-slate-200">{matchDetails.matchday}</span>
                </div>
                {matchDetails.referees && matchDetails.referees.length > 0 && (
                  <div className="flex flex-col py-1 space-y-1.5">
                    <span className="text-slate-400">Referees</span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {matchDetails.referees.map((ref: any, idx: number) => (
                        <span key={idx} className="bg-slate-750 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-700/30">
                          {ref.name} ({ref.type?.toLowerCase().replace("_", " ")})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LINEUPS */}
        {activeSubTab === "lineups" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {isScheduled ? (
              <div className="col-span-2 py-12 text-center bg-slate-800/20 rounded-2xl border border-slate-750">
                <p className="text-slate-400 text-xs font-semibold font-medium">Match details not available yet for scheduled matches.</p>
              </div>
            ) : !externalData || !externalData.lineups || externalData.lineups.length === 0 ? (
              <div className="col-span-2 py-12 text-center bg-slate-800/20 rounded-2xl border border-slate-750">
                <p className="text-slate-400 text-xs font-semibold">Starting lineups are not reported for this match.</p>
              </div>
            ) : (
              externalData.lineups.map((teamLineup: any, idx: number) => {
                const isHome = idx === 0;
                const accentColor = isHome ? "text-emerald-400 animate-fade-in" : "text-rose-400 animate-fade-in";
                const borderAccent = isHome ? "border-emerald-500/10" : "border-rose-500/10";
                return (
                  <div key={idx} className={`bg-slate-800/40 p-6 rounded-2xl border ${borderAccent} space-y-5 shadow-sm`}>
                    <div className="flex justify-between items-end border-b border-slate-700/40 pb-3">
                      <div>
                        <h4 className={`text-base font-bold ${accentColor}`}>{teamLineup.team.name}</h4>
                        <p className="text-[10px] text-slate-450 mt-0.5 font-medium">Coach: {teamLineup.coach?.name || "N/A"}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-slate-700 border border-slate-650 text-slate-200 text-xs font-extrabold tracking-wider">
                        {teamLineup.formation}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Starting XI</h5>
                      <div className="grid grid-cols-1 divide-y divide-slate-800/40">
                        {teamLineup.startXI.map((item: any, pIdx: number) => (
                          <div key={pIdx} className="flex items-center justify-between py-2 text-xs">
                            <div className="flex items-center space-x-2.5">
                              <span className="w-5 text-slate-500 font-extrabold text-[10px]">{item.player.number}</span>
                              <span className="text-slate-200 font-semibold">{item.player.name}</span>
                            </div>
                            <span className="text-[9px] uppercase font-bold text-slate-500 px-1 bg-slate-800 border border-slate-750 rounded">
                              {item.player.pos}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {teamLineup.substitutes && teamLineup.substitutes.length > 0 && (
                      <div className="space-y-3 pt-3">
                        <h5 className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">Substitutes Bench</h5>
                        <div className="grid grid-cols-1 divide-y divide-slate-800/40">
                          {teamLineup.substitutes.map((item: any, pIdx: number) => (
                            <div key={pIdx} className="flex items-center justify-between py-2 text-xs text-slate-350">
                              <div className="flex items-center space-x-2.5">
                                <span className="w-5 text-slate-500 font-medium text-[10px]">{item.player.number}</span>
                                <span>{item.player.name}</span>
                              </div>
                              <span className="text-[9px] uppercase font-bold text-slate-600 px-1 bg-slate-800 border border-slate-750/30 rounded">
                                {item.player.pos}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* STATISTICS */}
        {activeSubTab === "stats" && (
          <div className="w-full animate-fade-in">
            {isScheduled ? (
              <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/30 max-w-2xl mx-auto shadow-sm text-center py-12">
                <p className="text-slate-400 text-xs font-semibold font-medium">Match details not available yet for scheduled matches.</p>
              </div>
            ) : (
              (() => {
              const hasRealStats = externalData?.statistics && externalData.statistics.length > 0;

              const renderStatRow = (label: string, homeVal: any, awayVal: any, homePct: number, awayPct: number, suffix = "") => {
                return (
                  <div className="space-y-1.5 py-3 border-b border-slate-800/40 last:border-0">
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-white font-bold text-sm">{homeVal}{suffix}</span>
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{label}</span>
                      <span className="text-white font-bold text-sm">{awayVal}{suffix}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-700/40 rounded-full flex overflow-hidden">
                      <div
                        className="bg-emerald-500 transition-all duration-300"
                        style={{ width: `${homePct}%` }}
                      />
                      <div
                        className="bg-rose-500 transition-all duration-300"
                        style={{ width: `${awayPct}%` }}
                      />
                    </div>
                  </div>
                );
              };

              if (hasRealStats) {
                return (
                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/30 space-y-4 max-w-2xl mx-auto shadow-sm">
                    <div className="text-center border-b border-slate-700/50 pb-3 flex justify-between items-center">
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-extrabold border border-emerald-500/10 tracking-wider">REAL DATA</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Statistics</h4>
                      <div className="w-16"></div>
                    </div>

                    <div className="divide-y divide-slate-800/30">
                      {(() => {
                        const hp = getExternalStat(0, "Ball Possession");
                        const ap = getExternalStat(1, "Ball Possession");
                        return renderStatRow("Ball Possession", hp.raw, ap.raw, hp.percentage, ap.percentage);
                      })()}
                      {(() => {
                        const h = getExternalStat(0, "Total Shots");
                        const a = getExternalStat(1, "Total Shots");
                        return renderStatRow("Total Shots", h.raw, a.raw, h.percentage, a.percentage);
                      })()}
                      {(() => {
                        const h = getExternalStat(0, "Shots on Goal");
                        const a = getExternalStat(1, "Shots on Goal");
                        return renderStatRow("Shots on Target", h.raw, a.raw, h.percentage, a.percentage);
                      })()}
                      {(() => {
                        const h = getExternalStat(0, "Corner Kicks");
                        const a = getExternalStat(1, "Corner Kicks");
                        return renderStatRow("Corners", h.raw, a.raw, h.percentage, a.percentage);
                      })()}
                      {(() => {
                        const h = getExternalStat(0, "Fouls");
                        const a = getExternalStat(1, "Fouls");
                        return renderStatRow("Fouls Committed", h.raw, a.raw, h.percentage, a.percentage);
                      })()}
                      {(() => {
                        const h = getExternalStat(0, "Yellow Cards");
                        const a = getExternalStat(1, "Yellow Cards");
                        return renderStatRow("Yellow Cards", h.raw, a.raw, h.percentage, a.percentage);
                      })()}
                      {(() => {
                        const h = getExternalStat(0, "Red Cards");
                        const a = getExternalStat(1, "Red Cards");
                        return renderStatRow("Red Cards", h.raw, a.raw, h.percentage, a.percentage);
                      })()}
                    </div>
                  </div>
                );
              }

              // Fallback
              return (
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/30 max-w-2xl mx-auto shadow-sm text-center py-12">
                  <p className="text-slate-400 text-xs font-semibold">Team statistics are not available for this match.</p>
                </div>
              );
            })()
          )}
          </div>
        )}

        {/* TIMELINE */}
        {activeSubTab === "events" && (
          <div className="max-w-xl mx-auto w-full animate-fade-in space-y-4">
            {isScheduled ? (
              <div className="py-12 text-center bg-slate-800/20 rounded-2xl border border-slate-750">
                <p className="text-slate-400 text-xs font-semibold font-medium">Match details not available yet for scheduled matches.</p>
              </div>
            ) : (
              (() => {
              // Format Kickoff details
              const kickoffTimeStr = new Date(matchDetails.utcDate).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
              });

              return (
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/30 space-y-6 shadow-sm relative overflow-hidden">
                  <div className="text-center border-b border-slate-700/50 pb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Events Timeline</h4>
                  </div>

                  {/* 1. Kickoff Card (Before the Divider Line) */}
                  <div className="flex justify-center w-full">
                    <div className="p-2.5 px-4 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-350 text-[11px] font-semibold shadow flex items-center space-x-2.5 max-w-[280px] sm:max-w-md w-full justify-center">
                      <span className="text-sm">⏱️</span>
                      <span className="font-extrabold text-white uppercase tracking-wider text-[10px]">Kickoff</span>
                      <span className="text-slate-400 font-medium">Match started at {kickoffTimeStr}</span>
                    </div>
                  </div>

                  {/* 2. Middle Event List (Contains absolute divider line) */}
                  {sortedEvents.length > 0 ? (
                    <div className="relative space-y-6 py-4">
                      {/* Central Line (hidden on tiny screens, visible on sm+) */}
                      <div className="absolute left-4 sm:left-1/2 transform sm:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-slate-700/60" />

                      {sortedEvents.map((event: any, idx: number) => {
                        const isHomeEvent = event.team.id === externalData.teams.home.id;
                        
                        let icon = "🔔";
                        let bgClass = "bg-slate-750/30";

                        if (event.type === "Goal") {
                          icon = "⚽";
                          bgClass = "bg-emerald-500/10 border-emerald-500/25 text-emerald-400";
                        } else if (event.type === "Card") {
                          const isYellow = event.detail?.toLowerCase().includes("yellow");
                          icon = isYellow ? "🟨" : "🟥";
                          bgClass = isYellow ? "bg-amber-500/5 border-amber-500/20 text-amber-400" : "bg-red-500/5 border-red-500/20 text-red-400";
                        } else if (event.type === "subst") {
                          icon = "🔄";
                          bgClass = "bg-sky-500/5 border-sky-500/20 text-sky-400";
                        } else if (event.type === "Var") {
                          icon = "🖥️";
                          bgClass = "bg-purple-500/5 border-purple-500/20 text-purple-400";
                        }

                        const cardMarkup = (
                          <div className={`p-3.5 rounded-2xl border border-slate-750 ${bgClass} space-y-1 w-full max-w-[280px] shadow-md text-left`}>
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-sm">{icon}</span>
                                <span className="font-bold text-white">
                                  {event.type === "subst" ? "Substitution" : event.player.name}
                                </span>
                              </div>
                              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">
                                {event.type === "subst" ? "Sub" : event.type}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-350 leading-relaxed">
                              {event.type === "subst" ? (
                                <div className="flex flex-col space-y-0.5 mt-0.5">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-rose-455 text-rose-400 font-semibold text-[9px] uppercase tracking-wider w-8">Out:</span>
                                    <span className="text-slate-300 font-medium">{event.player.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-emerald-455 text-emerald-405 text-emerald-400 font-semibold text-[9px] uppercase tracking-wider w-8">In:</span>
                                    <span className="text-white font-bold">{event.assist?.name || "N/A"}</span>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {event.detail}
                                  {event.assist?.name && ` (Assist: ${event.assist.name})`}
                                </>
                              )}
                              {event.comments && ` - ${event.comments}`}
                            </div>
                            <div className="text-[9px] text-slate-500 italic mt-0.5">
                              {event.team.name}
                            </div>
                          </div>
                        );

                        return (
                          <div key={idx} className="relative flex flex-col sm:flex-row items-start sm:items-center w-full">
                            {/* Central Time Badge */}
                            <div className="absolute left-1.5 sm:left-1/2 transform sm:-translate-x-1/2 z-10 flex items-center justify-center">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 border-2 border-slate-700 text-[10px] font-extrabold text-teal-400 shadow-md">
                                {event.time.elapsed}'
                              </span>
                            </div>

                            {/* Dual Column Layout */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-4 sm:gap-12 pl-10 sm:pl-0">
                              {/* Home Column (Left) */}
                              <div className={`flex flex-col ${isHomeEvent ? "items-start sm:items-end text-left sm:text-right" : "hidden sm:flex invisible pointer-events-none"}`}>
                                {isHomeEvent && cardMarkup}
                              </div>

                              {/* Away Column (Right) */}
                              <div className={`flex flex-col ${!isHomeEvent ? "items-start text-left" : "hidden sm:flex invisible pointer-events-none"}`}>
                                {!isHomeEvent && cardMarkup}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-slate-550 text-xs italic">
                      No matching timeline events recorded.
                    </div>
                  )}

                  {/* 3. Final Whistle Card (After the Divider Line) */}
                  {matchDetails.status === "FINISHED" && (
                    <div className="flex justify-center w-full">
                      <div className="p-2.5 px-4 rounded-xl bg-teal-950/20 border border-teal-500/20 text-teal-300 text-[11px] font-semibold shadow flex items-center space-x-2.5 max-w-[280px] sm:max-w-md w-full justify-center">
                        <span className="text-sm">🏁</span>
                        <span className="font-extrabold text-white uppercase tracking-wider text-[10px]">Final Whistle</span>
                        <span className="text-slate-400 font-medium">Full Time: {homeScore ?? 0} - {awayScore ?? 0}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchInsightView;
