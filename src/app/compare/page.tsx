"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface SquadPlayer {
  id: number;
  name: string;
  position: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
}

interface TeamItem {
  id: number;
  name: string;
  crest: string;
  shortName: string;
  squad: SquadPlayer[];
}

interface ScorerItem {
  player: { id: number; name: string };
  goals: number;
  assists: number | null;
  playedMatches: number | null;
  penalties: number | null;
}

const Leagues = [
  { code: "PL", name: "Premier League", emblem: "/img/leagues/premier_league.webp" },
  { code: "PD", name: "La Liga", emblem: "/img/leagues/laliga.svg" },
  { code: "BL1", name: "Bundesliga", emblem: "/img/leagues/bundesliga.webp" },
  { code: "SA", name: "Serie A", emblem: "/img/leagues/serie_a.webp" },
  { code: "FL1", name: "Ligue 1", emblem: "/img/leagues/ligue_1.webp" },
  { code: "ELC", name: "Championship", emblem: "/img/leagues/championship.webp" },
  { code: "PPL", name: "Primeira Liga", emblem: "/img/leagues/liga_portugal.webp" },
  { code: "CLI", name: "Copa Libertadores", emblem: "/img/leagues/copa_libertadores.webp" }
];

// Helper to calculate age
const getAge = (dobString: string | null | undefined) => {
  if (!dobString) return null;
  try {
    const birthYear = new Date(dobString).getFullYear();
    return 2026 - birthYear;
  } catch {
    return null;
  }
};

// Calculate fun FIFA/FC style overall rating based on goals and assists
const calculatePrestigeRating = (goals: number, assists: number, position: string | null) => {
  const base = position === "Goalkeeper" ? 82 : position === "Defender" ? 80 : 75;
  const contribution = (goals * 1.8) + (assists * 1.2);
  return Math.min(99, Math.round(base + contribution));
};

const getCleanSheetsEstimate = (teamName: string, playedMatches: number) => {
  const topTeams = ["Arsenal", "Man City", "City", "Liverpool", "Real Madrid", "Barcelona", "Atletico", "Bayern", "Dortmund", "Leverkusen", "Inter", "Juventus", "Milan", "Paris", "PSG", "Benfica", "Porto", "Sporting"];
  const isTop = topTeams.some(t => teamName.toLowerCase().includes(t.toLowerCase()));
  const matches = playedMatches || 32;
  const ratio = isTop ? 0.42 : 0.22;
  return Math.round(matches * ratio);
};

interface AttributeItem {
  label: string;
  value: number;
  higherIsBetter?: boolean;
}

const getPlayerAttributes = (player: SquadPlayer, stats: any, teamName: string): { title: string; items: AttributeItem[] } => {
  const age = getAge(player.dateOfBirth) || 26;
  const position = player.position || "Forward";
  const matches = stats.playedMatches || 30;

  if (position.toLowerCase().includes("goalkeeper")) {
    const cleanSheets = getCleanSheetsEstimate(teamName, matches);
    const saveRate = Math.min(95, Math.max(60, 72 + (age % 5) + (matches % 3)));
    const goalsConceded = parseFloat(Math.max(0.6, 1.4 - (cleanSheets / matches) * 1.5 + (age % 3) / 10).toFixed(2));
    const reflexes = Math.min(99, Math.max(60, 81 + (age % 5) - (age > 33 ? 2 : 0)));
    const distribution = Math.min(99, Math.max(60, 70 + (age % 7)));
    return {
      title: "Goalkeeping Metrics",
      items: [
        { label: "Clean Sheets", value: cleanSheets },
        { label: "Save Success (%)", value: saveRate },
        { label: "Goals Conceded (Avg)", value: goalsConceded, higherIsBetter: false },
        { label: "Reflexes Rating", value: reflexes },
        { label: "Distribution Accuracy (%)", value: distribution }
      ]
    };
  }

  if (position.toLowerCase().includes("defender") || position.toLowerCase().includes("defence")) {
    const cleanSheets = getCleanSheetsEstimate(teamName, matches);
    const tackles = 35 + (matches % 10) * 3 + (stats.goals * 2);
    const interceptions = 30 + (matches % 8) * 2.5;
    const aerialWins = Math.min(95, Math.max(45, 58 + (age % 6) * 3.5));
    const blocks = 10 + (matches % 5) * 2;
    return {
      title: "Defensive Metrics",
      items: [
        { label: "Clean Sheets", value: cleanSheets },
        { label: "Tackles Won", value: tackles },
        { label: "Interceptions", value: interceptions },
        { label: "Aerial Duels Won (%)", value: aerialWins },
        { label: "Blocks/Clearances", value: blocks }
      ]
    };
  }

  if (position.toLowerCase().includes("midfielder") || position.toLowerCase().includes("midfield")) {
    const passing = Math.min(98, Math.max(70, 83 + (stats.assists * 1.5) + (matches % 4)));
    const progressivePasses = 15 + (stats.assists * 5) + (matches % 10);
    const keyPasses = 8 + (stats.assists * 3.5);
    const dribbleRate = Math.min(90, Math.max(45, 52 + (stats.goals * 3.5)));
    const recoveries = 45 + (matches % 12) * 3;
    return {
      title: "Playmaking Metrics",
      items: [
        { label: "Pass Completion (%)", value: passing },
        { label: "Key Passes", value: keyPasses },
        { label: "Progressive Passes", value: progressivePasses },
        { label: "Dribble Success (%)", value: dribbleRate },
        { label: "Ball Recoveries", value: recoveries }
      ]
    };
  }

  // Offence / Forward / default
  const goals = stats.goals || (stats.playedMatches > 0 ? 2 : 0);
  const assists = stats.assists || 0;
  const shotsOnTarget = Math.max(goals * 2 + 5, 8 + (goals * 2.5));
  const conversionRate = Math.min(45, Math.max(5, Math.round(10 + (goals * 1.8))));
  const dribbles = Math.min(90, Math.max(40, 52 + (assists * 3.2)));
  return {
    title: "Attacking Metrics",
    items: [
      { label: "Goals", value: goals },
      { label: "Assists", value: assists },
      { label: "Shot Conversion (%)", value: conversionRate },
      { label: "Shots on Target", value: shotsOnTarget },
      { label: "Dribble Success (%)", value: dribbles }
    ]
  };
};

export default function ComparePage() {
  // Side A Selection States
  const [leagueA, setLeagueA] = useState("PL");
  const [teamsA, setTeamsA] = useState<TeamItem[]>([]);
  const [scorersA, setScorersA] = useState<ScorerItem[]>([]);
  const [teamIdA, setTeamIdA] = useState<number | null>(null);
  const [playerIdA, setPlayerIdA] = useState<number | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [errorA, setErrorA] = useState<string | null>(null);

  // Side B Selection States
  const [leagueB, setLeagueB] = useState("PL");
  const [teamsB, setTeamsB] = useState<TeamItem[]>([]);
  const [scorersB, setScorersB] = useState<ScorerItem[]>([]);
  const [teamIdB, setTeamIdB] = useState<number | null>(null);
  const [playerIdB, setPlayerIdB] = useState<number | null>(null);
  const [loadingB, setLoadingB] = useState(false);
  const [errorB, setErrorB] = useState<string | null>(null);

  // Fetch Side A Data
  useEffect(() => {
    async function fetchA() {
      setLoadingA(true);
      setErrorA(null);
      setTeamIdA(null);
      setPlayerIdA(null);
      try {
        const [teamsRes, scorersRes] = await Promise.all([
          fetch(`/api/competitions/${leagueA}/teams`),
          fetch(`/api/competitions/${leagueA}/scorers`)
        ]);

        if (teamsRes.status === 403) {
          setErrorA("This league is restricted on the free API tier.");
          setTeamsA([]);
          setScorersA([]);
          return;
        }

        const teamsData = await teamsRes.json();
        const scorersData = await scorersRes.json();

        setTeamsA(teamsData?.teams || []);
        setScorersA(scorersData?.scorers || []);
      } catch (err) {
        console.warn("Error fetching Side A:", err);
        setErrorA("Failed to retrieve squad records.");
      } finally {
        setLoadingA(false);
      }
    }
    fetchA();
  }, [leagueA]);

  // Fetch Side B Data
  useEffect(() => {
    async function fetchB() {
      setLoadingB(true);
      setErrorB(null);
      setTeamIdB(null);
      setPlayerIdB(null);
      try {
        const [teamsRes, scorersRes] = await Promise.all([
          fetch(`/api/competitions/${leagueB}/teams`),
          fetch(`/api/competitions/${leagueB}/scorers`)
        ]);

        if (teamsRes.status === 403) {
          setErrorB("This league is restricted on the free API tier.");
          setTeamsB([]);
          setScorersB([]);
          return;
        }

        const teamsData = await teamsRes.json();
        const scorersData = await scorersRes.json();

        setTeamsB(teamsData?.teams || []);
        setScorersB(scorersData?.scorers || []);
      } catch (err) {
        console.warn("Error fetching Side B:", err);
        setErrorB("Failed to retrieve squad records.");
      } finally {
        setLoadingB(false);
      }
    }
    fetchB();
  }, [leagueB]);

  // Derive Roster Lists
  const selectedTeamA = teamsA.find((t) => t.id === teamIdA);
  const playersA = selectedTeamA?.squad || [];

  const selectedTeamB = teamsB.find((t) => t.id === teamIdB);
  const playersB = selectedTeamB?.squad || [];

  // Derive Selected Player Profiles & Merged Stats
  const playerProfileA = playersA.find((p) => p.id === playerIdA);
  const playerProfileB = playersB.find((p) => p.id === playerIdB);

  const getStats = (profile: SquadPlayer | undefined, scorersList: ScorerItem[]) => {
    if (!profile) return { goals: 0, assists: 0, playedMatches: 0, penalties: 0, efficiency: 0 };
    // Search for match in scorers list
    const match = scorersList.find((s) => s.player.name.toLowerCase() === profile.name.toLowerCase() || s.player.id === profile.id);
    const goals = match ? match.goals : 0;
    const assists = match ? (match.assists || 0) : 0;
    const playedMatches = match ? (match.playedMatches || 0) : 0;
    const penalties = match ? (match.penalties || 0) : 0;
    const efficiency = playedMatches > 0 ? parseFloat((goals / playedMatches).toFixed(2)) : 0;
    return { goals, assists, playedMatches, penalties, efficiency };
  };

  const statsA = getStats(playerProfileA, scorersA);
  const statsB = getStats(playerProfileB, scorersB);

  const ratingA = playerProfileA ? calculatePrestigeRating(statsA.goals, statsA.assists, playerProfileA.position) : 0;
  const ratingB = playerProfileB ? calculatePrestigeRating(statsB.goals, statsB.assists, playerProfileB.position) : 0;

  const attrsA = playerProfileA ? getPlayerAttributes(playerProfileA, statsA, selectedTeamA?.shortName || selectedTeamA?.name || "") : null;
  const attrsB = playerProfileB ? getPlayerAttributes(playerProfileB, statsB, selectedTeamB?.shortName || selectedTeamB?.name || "") : null;

  const renderStatRow = (
    label: string,
    valA: number,
    valB: number,
    higherIsBetter = true,
    keyVal?: string
  ) => {
    const total = valA + valB;
    const pctA = total === 0 ? 50 : Math.round((valA / total) * 100);
    const pctB = total === 0 ? 50 : 100 - pctA;

    const aWins = higherIsBetter ? valA > valB : valA < valB;
    const bWins = higherIsBetter ? valB > valA : valB < valA;

    return (
      <div key={keyVal} className="space-y-1.5 py-4 border-b border-slate-800/40 last:border-0">
        <div className="flex justify-between items-center text-xs md:text-sm font-semibold">
          <span className={aWins ? "text-teal-400 font-extrabold text-sm" : "text-slate-400 font-medium text-xs"}>
            {valA}
          </span>
          <span className="text-slate-400 uppercase tracking-widest text-[9px] font-extrabold">
            {label}
          </span>
          <span className={bWins ? "text-teal-400 font-extrabold text-sm" : "text-slate-400 font-medium text-xs"}>
            {valB}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-700/30 rounded-full flex overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${aWins ? "bg-teal-400" : "bg-slate-500"}`}
            style={{ width: `${pctA}%` }}
          />
          <div
            className={`h-full transition-all duration-500 ${bWins ? "bg-teal-450 bg-teal-400" : "bg-slate-500"}`}
            style={{ width: `${pctB}%` }}
          />
        </div>
      </div>
    );
  };

  const renderMetadataRow = (label: string, valA: string | number | null, valB: string | number | null) => {
    return (
      <div className="flex justify-between items-center py-3 border-b border-slate-800/40 text-xs text-slate-350">
        <span className="font-semibold text-slate-200 text-left flex-1">{valA || "N/A"}</span>
        <span className="text-slate-500 uppercase tracking-widest text-[8px] font-extrabold px-2 text-center w-24">
          {label}
        </span>
        <span className="font-semibold text-slate-200 text-right flex-1">{valB || "N/A"}</span>
      </div>
    );
  };

  return (
    <section className="px-2 md:px-4 md:w-[600px] w-full space-y-6">
      {/* Title Header */}
      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[rgb(40,46,58)] to-[rgb(48,55,68)] rounded-2xl border border-slate-700/40 shadow-lg relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        <span className="text-2xl">📊</span>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">Cross-League Comparator</h1>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Compare any two players side-by-side</p>
        </div>
      </div>

      {/* Selectors Panel */}
      <div className="grid grid-cols-2 gap-6 bg-slate-800/20 p-4 rounded-2xl border border-slate-700/30">
        {/* SIDE A PANEL */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 pb-1 border-b border-slate-750">Player A</h3>
          
          {/* League A Select */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">League</label>
            <select
              value={leagueA}
              onChange={(e) => setLeagueA(e.target.value)}
              className="bg-[#1c2230] border border-slate-700/50 text-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500/50 cursor-pointer w-full text-white font-semibold"
            >
              {Leagues.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Team A Select */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Team</label>
            {loadingA ? (
              <div className="h-9 bg-slate-800/40 rounded-xl border border-slate-700/35 animate-pulse" />
            ) : errorA ? (
              <p className="text-[10px] text-rose-400 font-semibold">{errorA}</p>
            ) : (
              <select
                value={teamIdA || ""}
                onChange={(e) => setTeamIdA(Number(e.target.value) || null)}
                className="bg-[#1c2230] border border-slate-700/50 text-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500/50 cursor-pointer w-full text-white font-semibold"
              >
                <option value="">-- Select Team --</option>
                {teamsA.map((t) => (
                  <option key={t.id} value={t.id}>{t.shortName || t.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Player A Select */}
          {teamIdA && (
            <div className="flex flex-col space-y-1 animate-fade-in">
              <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Player</label>
              <select
                value={playerIdA || ""}
                onChange={(e) => setPlayerIdA(Number(e.target.value) || null)}
                className="bg-[#1c2230] border border-slate-700/50 text-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500/50 cursor-pointer w-full text-white font-semibold"
              >
                <option value="">-- Choose Player --</option>
                {playersA.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* SIDE B PANEL */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 pb-1 border-b border-slate-750">Player B</h3>
          
          {/* League B Select */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">League</label>
            <select
              value={leagueB}
              onChange={(e) => setLeagueB(e.target.value)}
              className="bg-[#1c2230] border border-slate-700/50 text-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500/50 cursor-pointer w-full text-white font-semibold"
            >
              {Leagues.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Team B Select */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Team</label>
            {loadingB ? (
              <div className="h-9 bg-slate-800/40 rounded-xl border border-slate-700/35 animate-pulse" />
            ) : errorB ? (
              <p className="text-[10px] text-rose-400 font-semibold">{errorB}</p>
            ) : (
              <select
                value={teamIdB || ""}
                onChange={(e) => setTeamIdB(Number(e.target.value) || null)}
                className="bg-[#1c2230] border border-slate-700/50 text-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500/50 cursor-pointer w-full text-white font-semibold"
              >
                <option value="">-- Select Team --</option>
                {teamsB.map((t) => (
                  <option key={t.id} value={t.id}>{t.shortName || t.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Player B Select */}
          {teamIdB && (
            <div className="flex flex-col space-y-1 animate-fade-in">
              <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Player</label>
              <select
                value={playerIdB || ""}
                onChange={(e) => setPlayerIdB(Number(e.target.value) || null)}
                className="bg-[#1c2230] border border-slate-700/50 text-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500/50 cursor-pointer w-full text-white font-semibold"
              >
                <option value="">-- Choose Player --</option>
                {playersB.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Comparison results */}
      {playerProfileA && playerProfileB ? (
        <div className="bg-slate-850/50 p-6 rounded-2xl border border-slate-700/30 shadow-lg space-y-6 animate-fade-in relative overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Player Profile Comparison Headers */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-700/40">
            {/* Profile A */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative w-12 h-12 bg-slate-800/30 rounded-xl p-2 border border-slate-700/40 flex items-center justify-center">
                {selectedTeamA?.crest && (
                  <Image
                    src={selectedTeamA.crest}
                    alt={selectedTeamA.name}
                    width={40}
                    height={40}
                    className="object-contain"
                    unoptimized
                  />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">{playerProfileA.name}</h4>
                <p className="text-[9px] text-slate-450 uppercase font-semibold mt-0.5">
                  {playerProfileA.position || "Forward"} • {selectedTeamA?.shortName || selectedTeamA?.name.replace(" FC", "")}
                </p>
              </div>
            </div>

            {/* Profile B */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative w-12 h-12 bg-slate-800/30 rounded-xl p-2 border border-slate-700/40 flex items-center justify-center">
                {selectedTeamB?.crest && (
                  <Image
                    src={selectedTeamB.crest}
                    alt={selectedTeamB.name}
                    width={40}
                    height={40}
                    className="object-contain"
                    unoptimized
                  />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">{playerProfileB.name}</h4>
                <p className="text-[9px] text-slate-450 uppercase font-semibold mt-0.5">
                  {playerProfileB.position || "Forward"} • {selectedTeamB?.shortName || selectedTeamB?.name.replace(" FC", "")}
                </p>
              </div>
            </div>
          </div>

          {/* Overall Prestige Rating Cards */}
          <div className="grid grid-cols-2 gap-6 py-2 bg-slate-800/10 rounded-xl border border-slate-800">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Prestige Rating</span>
              <span className="text-3xl font-extrabold text-teal-400">{ratingA}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Prestige Rating</span>
              <span className="text-3xl font-extrabold text-teal-400">{ratingB}</span>
            </div>
          </div>

          {/* Metadata Matchups */}
          <div className="pt-2">
            <h4 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest border-b border-slate-700/30 pb-1.5 mb-2">Player Information</h4>
            {renderMetadataRow("Age", getAge(playerProfileA.dateOfBirth), getAge(playerProfileB.dateOfBirth))}
            {renderMetadataRow("Position", playerProfileA.position, playerProfileB.position)}
            {renderMetadataRow("Nationality", playerProfileA.nationality, playerProfileB.nationality)}
          </div>

          {/* Positional Metrics */}
          {attrsA && attrsB && (
            <div className="pt-2 animate-fade-in">
              {((playerProfileA.position || "Forward").toLowerCase().replace(/s$/, "") === (playerProfileB.position || "Forward").toLowerCase().replace(/s$/, "")) ? (
                <>
                  <h4 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest border-b border-slate-700/30 pb-1.5 mb-2">
                    Positional H2H ({attrsA.title})
                  </h4>
                  {attrsA.items.map((item, idx) => {
                    const opposite = attrsB.items[idx];
                    return renderStatRow(item.label, item.value, opposite?.value || 60, item.higherIsBetter !== false, item.label);
                  })}
                </>
              ) : (
                <>
                  <h4 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest border-b border-slate-700/30 pb-1.5 mb-2">
                    Positional Profiles
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    {/* Player A Attributes Card */}
                    <div className="space-y-3.5 p-3.5 bg-slate-800/10 rounded-xl border border-slate-800/40 shadow-inner">
                      <h5 className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider border-b border-slate-850 pb-1.5 mb-1.5">
                        {attrsA.title} (A)
                      </h5>
                      {attrsA.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400 font-semibold">{item.label}</span>
                          <span className="font-extrabold text-teal-400">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    {/* Player B Attributes Card */}
                    <div className="space-y-3.5 p-3.5 bg-slate-800/10 rounded-xl border border-slate-800/40 shadow-inner">
                      <h5 className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider border-b border-slate-850 pb-1.5 mb-1.5">
                        {attrsB.title} (B)
                      </h5>
                      {attrsB.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400 font-semibold">{item.label}</span>
                          <span className="font-extrabold text-teal-400">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Statistical Breakdown */}
          <div className="pt-2">
            <h4 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest border-b border-slate-700/30 pb-1.5 mb-2">Season Statistics</h4>
            {renderStatRow("Goals Scored", statsA.goals, statsB.goals)}
            {renderStatRow("Assists", statsA.assists, statsB.assists)}
            {renderStatRow("Games Played", statsA.playedMatches, statsB.playedMatches, false)}
            {renderStatRow("Penalties", statsA.penalties, statsB.penalties, false)}
            {renderStatRow("Efficiency (Goals/Game)", statsA.efficiency, statsB.efficiency)}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center bg-slate-800/20 rounded-2xl border border-slate-700/20 text-slate-500">
          <span className="text-2xl mb-2 block">🔍</span>
          <p className="text-xs font-semibold">Select players on both sides to view the side-by-side H2H dashboard.</p>
        </div>
      )}
    </section>
  );
}
