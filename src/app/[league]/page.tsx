import React from "react";
import Link from "next/link";
import { getLeagueStandings, getLeagueMatches } from "@/api";
import LeagueDashboard from "../components/LeagueDashboard";

const leagueMap: { [key: string]: { code: string; name: string; emblem: string } } = {
  "premier-league": { code: "PL", name: "Premier League", emblem: "/img/leagues/premier_league.webp" },
  "la-liga": { code: "PD", name: "Primera Division", emblem: "/img/leagues/laliga.svg" },
  "bundesliga": { code: "BL1", name: "Bundesliga", emblem: "/img/leagues/bundesliga.webp" },
  "serie-a": { code: "SA", name: "Serie A", emblem: "/img/leagues/serie_a.webp" },
  "ligue-1": { code: "FL1", name: "Ligue 1", emblem: "/img/leagues/ligue_1.webp" },
  "championship": { code: "ELC", name: "Championship", emblem: "/img/leagues/championship.webp" },
  "primeira-liga": { code: "PPL", name: "Primeira Liga", emblem: "/img/leagues/liga_portugal.webp" },
  "brazilian-series-a": { code: "BSA", name: "Campeonato Brasileiro Série A", emblem: "/img/leagues/brazilian_serie_a.webp" },
  "copa-libertadores": { code: "CLI", name: "Copa Libertadores", emblem: "/img/leagues/copa_libertadores.webp" },
};

interface PageProps {
  params: Promise<{ league: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function LeaguePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.league;
  const activeTab = resolvedSearchParams.tab || "standings";

  const leagueInfo = leagueMap[slug];

  if (!leagueInfo) {
    return (
      <div className="w-full md:w-[600px] py-12 text-center bg-[rgb(40,46,58)] rounded-2xl border border-slate-700/50">
        <h2 className="text-xl font-bold text-rose-400 mb-2">League Not Found</h2>
        <p className="text-slate-400">The requested league route does not exist.</p>
        <Link href="/" className="mt-4 inline-block text-teal-400 hover:underline">
          Go Back Home
        </Link>
      </div>
    );
  }

  let standingsData = null;
  let matchesData = null;
  let errorStatus = null;

  // Fetch both standings and matches to allow instant, bug-free tab switching on the client
  standingsData = await getLeagueStandings(leagueInfo.code);
  if (standingsData?.error) {
    errorStatus = standingsData.error;
  } else {
    const currentMatchday = standingsData?.season?.currentMatchday;
    matchesData = await getLeagueMatches(leagueInfo.code, currentMatchday);
    if (matchesData?.error && matchesData.error !== 403 && matchesData.error !== 404) {
      // Only set errorStatus if we couldn't get standings, or if it is a rate limit
      if (matchesData.error === 429) {
        errorStatus = 429;
      }
    }
  }

  // Handle Rate Limiting (429) or other API errors
  if (errorStatus === 429) {
    return (
      <div className="w-full md:w-[600px] p-6 text-center bg-[rgb(40,46,58)] rounded-2xl border border-amber-500/30 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-amber-400 mb-1">Rate Limit Exceeded (429)</h2>
        <p className="text-slate-300 text-sm">
          The API has rate-limited our requests (free keys are limited to 10 calls per minute).
        </p>
        <p className="text-xs text-slate-500 mt-3">
          Please wait 10-15 seconds and refresh the page to try again.
        </p>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div className="w-full md:w-[600px] p-6 text-center bg-[rgb(40,46,58)] rounded-2xl border border-rose-500/30 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-rose-400 mb-1">API Error ({errorStatus})</h2>
        <p className="text-slate-350 text-sm">
          {errorStatus === 403
            ? "Access to this competition's data is restricted on the free tier."
            : "An error occurred while fetching data from the football provider."}
        </p>
        <Link href="/" className="mt-4 inline-block text-teal-400 hover:underline text-sm font-semibold">
          Go Back Home
        </Link>
      </div>
    );
  }

  const leagueMatches = matchesData?.matches || [];

  return (
    <div className="w-full md:w-[600px]">
      <LeagueDashboard
        standings={standingsData}
        matches={leagueMatches}
        leagueInfo={leagueInfo}
        slug={slug}
        initialTab={activeTab}
      />
    </div>
  );
}
