import { matchesType } from '@/types'
import React from 'react'
import Competition from './Competition'
import Matches from './Matches'

const LeagueTable = ({
  data,
  onMatchClick
}: {
  data: matchesType;
  onMatchClick?: (id: number) => void;
}) => {
  return (
    <div
      onClick={() => onMatchClick?.(data.id)}
      className="py-3 px-2 md:px-3 rounded-md flex flex-col bg-[rgb(40,46,58)] hover:bg-[rgb(48,55,68)] mb-2 cursor-pointer transition-colors duration-150 border border-slate-700/20 shadow-sm"
    >
      <Competition data={data} />
      <Matches data={data} />
    </div>
  );
};

export default LeagueTable