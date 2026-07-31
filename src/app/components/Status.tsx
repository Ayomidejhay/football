"use client";

import { matchesType } from "@/types";
import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import LeagueTable from "./LeagueTable";

const Status = ({
  matchesList = [],
  matchesListFinished = [],
}: {
  matchesList: matchesType[],
  matchesListFinished: matchesType[]
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [statusMatch, setStatusMatch] = useState("FIXTURES");

  // Swedish locale format ("sv") outputs YYYY-MM-DD in local time
  const todayDateStr = new Date().toLocaleDateString("sv");
  const currentDateStr = searchParams.get("date") || todayDateStr;

  const isPastDate = currentDateStr < todayDateStr;
  const activeTab = isPastDate ? "RESULTS" : statusMatch;

  // Filter matches for the selected date
  const isFixtureMatch = (status: string) => {
    return status === "TIMED" || status === "IN_PLAY" || status === "PAUSED";
  };

  const fixturesMatches = matchesList.filter((data) => isFixtureMatch(data.status));
  const resultsMatches = matchesList.filter((data) => data.status === "FINISHED");

  // Date switching handlers
  const handlePrevDay = () => {
    const d = new Date(currentDateStr + "T12:00:00");
    d.setDate(d.getDate() - 1);
    const newDate = d.toLocaleDateString("sv");
    router.push(`${pathname}?date=${newDate}`);
  };

  const handleNextDay = () => {
    const d = new Date(currentDateStr + "T12:00:00");
    d.setDate(d.getDate() + 1);
    const newDate = d.toLocaleDateString("sv");
    router.push(`${pathname}?date=${newDate}`);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate) {
      router.push(`${pathname}?date=${newDate}`);
    }
  };

  const handleGoToToday = () => {
    router.push(pathname);
  };

  return (
    <div className="w-full space-y-4">
      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-slate-800/40 border border-slate-700/30 rounded-2xl shadow-sm text-sm w-full">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevDay}
            className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow"
            title="Previous Day"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <input
            type="date"
            value={currentDateStr}
            onChange={handleDateChange}
            className="bg-slate-750 border border-slate-700/50 rounded-lg px-2.5 py-1 text-xs md:text-sm text-teal-405 font-bold outline-none cursor-pointer focus:border-teal-500/50 text-teal-400"
          />

          <button
            onClick={handleNextDay}
            className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow"
            title="Next Day"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          onClick={handleGoToToday}
          className="px-3 py-1.5 rounded-lg bg-slate-750 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold border border-slate-700/40 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <span>Today</span>
        </button>
      </div>

      {/* Tabs */}
      {!isPastDate ? (
        <div className="flex space-x-3">
          <button
            onClick={() => setStatusMatch("FIXTURES")}
            className={`px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === "FIXTURES"
                ? "bg-teal-400 text-slate-900 shadow-md shadow-teal-500/10 font-bold"
                : "bg-slate-700 text-slate-300 hover:bg-slate-650 hover:text-white"
            }`}
          >
            Fixtures
          </button>
          <button
            onClick={() => setStatusMatch("RESULTS")}
            className={`px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === "RESULTS"
                ? "bg-teal-400 text-slate-900 shadow-md shadow-teal-500/10 font-bold"
                : "bg-slate-700 text-slate-300 hover:bg-slate-650 hover:text-white"
            }`}
          >
            Results
          </button>
        </div>
      ) : (
        <div className="text-xs font-bold uppercase tracking-wider text-teal-400 border-b border-slate-700/30 pb-2">
          Match Results
        </div>
      )}

      {/* Tab Contents */}
      <div className="w-full">
        {activeTab === "FIXTURES" ? (
          fixturesMatches.length > 0 ? (
            fixturesMatches.map((data) => (
              <LeagueTable
                key={data.id}
                data={data}
                onMatchClick={(id) => router.push(`/matches/${id}`)}
              />
            ))
          ) : (
            <div className="p-8 text-center bg-[rgb(40,46,58)] rounded-xl border border-slate-700/30 shadow-md">
              <p className="text-slate-400 font-medium">No fixtures scheduled for this date.</p>
              <p className="text-xs text-slate-500 mt-1">Try another day or check league schedules in the sidebar.</p>
            </div>
          )
        ) : null}

        {activeTab === "RESULTS" ? (
          resultsMatches.length > 0 ? (
            resultsMatches.map((data) => (
              <LeagueTable
                key={data.id}
                data={data}
                onMatchClick={(id) => router.push(`/matches/${id}`)}
              />
            ))
          ) : (
            <div className="p-8 text-center bg-[rgb(40,46,58)] rounded-xl border border-slate-700/30 shadow-md">
              <p className="text-slate-400 font-medium">No results recorded for this date.</p>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default Status;
