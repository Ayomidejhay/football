export type apiOptions = {
  next: { revalidate: number };
  headers: {
    "X-Auth-Token": string;
    "Content-Type": string;
  };
};

export type matchesArea = {
  id?: number;
  name: string;
  code?: string;
  flag?: string;
};

export type matchesCompetition = {
  id?: number;
  name: string;
  emblem: string;
  code?: string;
  type?: string;
};

export type matchesHomeTeam = {
  id?: number;
  name: string;
  crest: string;
  shortName?: string;
  tla?: string;
};

export type matchesAwayTeam = {
  id?: number;
  name: string;
  crest: string;
  shortName?: string;
  tla?: string;
};

export type scores = {
  fullTime: {
    home: number | null;
    away: number | null;
  };
  halfTime?: {
    home: number | null;
    away: number | null;
  };
};

export type matchesType = {
  area: matchesArea;
  competition: matchesCompetition;
  id: number;
  utcDate: string;
  status: string;
  matchday?: number;
  homeTeam?: matchesHomeTeam;
  awayTeam?: matchesAwayTeam;
  score?: scores;
};

export type newsType = {
  title: string;
  url: string;
  urlToImage: string;
  source?: {
    name: string;
    id: string | null;
  };
};

// Standings Specific Types
export type TeamType = {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
};

export type TableRowType = {
  position: number;
  team: TeamType;
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

export type StandingsType = {
  stage: string;
  type: string;
  group: string | null;
  table: TableRowType[];
};

export type SeasonType = {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number;
  winner: any;
};

export type CompetitionStandingsType = {
  filters: any;
  competition: matchesCompetition;
  season: SeasonType;
  standings: StandingsType[];
};