"use client";

import React from "react";
import Image from "next/image";
import { TableRowType } from "@/types";

interface StandingsTableProps {
  table: TableRowType[];
  competitionCode: string;
  onTeamClick: (id: number) => void;
}

const StandingsTable = ({ table, competitionCode, onTeamClick }: StandingsTableProps) => {
  // Determine border/highlight colors based on position and competition
  const getPositionClass = (position: number, totalTeams: number) => {
    // Champions League / Top positions
    if (position <= 4) {
      return "border-l-4 border-teal-400 bg-teal-500/5 hover:bg-teal-500/10";
    }
    // Europa League / Upper positions
    if (position === 5 || position === 6) {
      return "border-l-4 border-blue-400 bg-blue-500/5 hover:bg-blue-500/10";
    }
    // Relegation zone (typically bottom 3)
    if (position > totalTeams - 3) {
      return "border-l-4 border-rose-500 bg-rose-500/5 hover:bg-rose-500/10";
    }
    return "border-l-4 border-transparent hover:bg-slate-700/30";
  };

  const getFormBadge = (char: string) => {
    switch (char.toUpperCase()) {
      case "W":
        return (
          <span
            key={Math.random()}
            className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm shadow-emerald-900/50"
            title="Win"
          >
            W
          </span>
        );
      case "D":
        return (
          <span
            key={Math.random()}
            className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold bg-slate-500 text-white shadow-sm shadow-slate-900/50"
            title="Draw"
          >
            D
          </span>
        );
      case "L":
        return (
          <span
            key={Math.random()}
            className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-sm shadow-rose-900/50"
            title="Loss"
          >
            L
          </span>
        );
      default:
        return null;
    }
  };

  const renderForm = (formString: string | null) => {
    if (!formString) return <span className="text-xs text-slate-500">-</span>;
    const chars = formString.includes(",")
      ? formString.split(",")
      : formString.split("");
    
    return (
      <div className="flex space-x-1 justify-center">
        {chars.slice(-5).map((c) => getFormBadge(c.trim()))}
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl bg-[rgb(40,46,58)] shadow-xl border border-slate-700/50 backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800/50 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
            <th className="py-3 px-3 w-10 text-center">Pos</th>
            <th className="py-3 px-4">Team</th>
            <th className="py-3 px-3 text-center">GP</th>
            <th className="py-3 px-2 text-center hidden md:table-cell">W</th>
            <th className="py-3 px-2 text-center hidden md:table-cell">D</th>
            <th className="py-3 px-2 text-center hidden md:table-cell">L</th>
            <th className="py-3 px-3 text-center">GD</th>
            <th className="py-3 px-3 text-center">Pts</th>
            <th className="py-3 px-4 text-center hidden lg:table-cell">Form</th>
          </tr>
        </thead>
        <tbody className="text-xs md:text-sm divide-y divide-slate-800 text-textPrimary">
          {table.map((row) => (
            <tr
              key={row.team.id}
              onClick={() => onTeamClick(row.team.id)}
              className={`transition-colors duration-150 cursor-pointer ${getPositionClass(
                row.position,
                table.length
              )}`}
            >
              <td className="py-3.5 px-3 text-center font-bold text-slate-300">
                {row.position}
              </td>
              <td className="py-3.5 px-4 font-semibold text-white">
                <div className="flex items-center space-x-3">
                  <div className="relative w-6 h-6 flex-shrink-0">
                    <Image
                      src={row.team.crest || "/football-info.png"}
                      alt={row.team.name}
                      fill
                      sizes="24px"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="truncate max-w-[140px] md:max-w-none hover:text-teal-400 transition-colors duration-150">
                    {row.team.shortName || row.team.name}
                  </span>
                </div>
              </td>
              <td className="py-3.5 px-3 text-center font-medium text-slate-300">
                {row.playedGames}
              </td>
              <td className="py-3.5 px-2 text-center text-slate-400 hidden md:table-cell">
                {row.won}
              </td>
              <td className="py-3.5 px-2 text-center text-slate-400 hidden md:table-cell">
                {row.draw}
              </td>
              <td className="py-3.5 px-2 text-center text-slate-400 hidden md:table-cell">
                {row.lost}
              </td>
              <td
                className={`py-3.5 px-3 text-center font-semibold ${
                  row.goalDifference > 0
                    ? "text-emerald-400"
                    : row.goalDifference < 0
                    ? "text-rose-400"
                    : "text-slate-400"
                }`}
              >
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </td>
              <td className="py-3.5 px-3 text-center font-bold text-teal-400 text-sm">
                {row.points}
              </td>
              <td className="py-3.5 px-4 text-center hidden lg:table-cell animate-fade-in">
                {renderForm(row.form)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable;
