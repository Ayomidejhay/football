import { filterLeague } from "@/api";
import LeagueTable from "@/app/components/LeagueTable";
import React from "react";

const Brasileiro = async () => {
  const getBrasileiro = await filterLeague("Campeonato Brasileiro Série A");
  return (
    <div>
      <div className="w-[600px]">
        {getBrasileiro.map((data) => (
          <div key={data.id}>
            <LeagueTable data={data} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Brasileiro;
