import React from "react";
import Linkside from "./Linkside";
import MiniStandingsCarousel from "./MiniStandingsCarousel";

const Leagues = [
  { id: 1, name: "Premier League", href: "premier-league", emblem: "/img/leagues/premier_league.webp" },
  { id: 2, name: "La Liga", href: "la-liga", emblem: "/img/leagues/laliga.svg" },
  { id: 3, name: "Bundesliga", href: "bundesliga", emblem: "/img/leagues/bundesliga.webp" },
  { id: 4, name: "Serie A", href: "serie-a", emblem: "/img/leagues/serie_a.webp" },
  { id: 5, name: "Ligue 1", href: "ligue-1", emblem: "/img/leagues/ligue_1.webp" },
  { id: 6, name: "Championship", href: "championship", emblem: "/img/leagues/championship.webp" },
  { id: 7, name: "Primeira Liga", href: "primeira-liga", emblem: "/img/leagues/liga_portugal.webp" },
  { id: 8, name: "Brazilian Série A", href: "brazilian-series-a", emblem: "/img/leagues/brazilian_serie_a.webp" },
  { id: 9, name: "Copa Libertadores", href: "copa-libertadores", emblem: "/img/leagues/copa_libertadores.webp" },
];

const Sidebar = () => {
  return (
    <aside className="w-full lg:w-[250px] shrink-0 p-3 lg:p-4 bg-[rgb(40,46,58)] rounded-2xl border border-slate-700/40 shadow-lg overflow-hidden flex flex-col">
      <div className="flex flex-row lg:flex-col gap-4 lg:space-y-4 overflow-x-auto lg:overflow-visible no-scrollbar scroll-smooth">
        {/* Menu Row/Column */}
        <div className="flex-shrink-0 flex items-center lg:block">
          <h2 className="hidden lg:block font-bold text-[10px] uppercase tracking-wider text-teal-400 mb-3 px-3">
            Menu
          </h2>
          <div className="flex w-36 lg:w-auto">
            <Linkside href="" name="All Matches" src="/football-info.png" />
          </div>
        </div>

        {/* Leagues Row/Column */}
        <div className="flex flex-row lg:flex-col gap-2 lg:gap-0 lg:pt-2 lg:border-t lg:border-slate-700/60 overflow-x-auto lg:overflow-visible no-scrollbar">
          <h2 className="hidden lg:block font-bold text-[10px] uppercase tracking-wider text-teal-400 mb-3 px-3">
            Leagues
          </h2>
          <ul className="flex flex-row lg:flex-col gap-2 lg:gap-1 lg:space-y-1">
            {Leagues.map((league) => (
              <li key={league.id} className="flex flex-shrink-0 w-36 lg:w-auto">
                <Linkside href={league.href} name={league.name} src={league.emblem} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mini Standings Slider Carousel (Desktop-only to preserve mobile scroll links) */}
      <div className="hidden lg:block pt-4 border-t border-slate-700/60 mt-4">
        <h2 className="font-bold text-[10px] uppercase tracking-wider text-teal-400 mb-3 px-3">
          Top Standings
        </h2>
        <MiniStandingsCarousel />
      </div>
    </aside>
  );
};

export default Sidebar;