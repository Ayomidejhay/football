import { apiOptions, matchesType } from "@/types";

// In-memory cache to prevent hitting API rate limits on the free tier (10 calls/min)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

const fetchWithCache = async (key: string, url: string, options: RequestInit) => {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    console.warn(`HTTP warning fetching ${url}: ${res.status}`);
    return { error: res.status };
  }

  const data = await res.json();
  cache.set(key, { data, timestamp: now });
  return data;
};

const getOptions = (): apiOptions => {
  const token = process.env.NEXT_PUBLIC_API_TOKEN || "e0370622d70648a884aaa022c149e789";
  const cleanToken = token.replace(/;$/, "");
  return {
    next: { revalidate: 600 }, // Align with 10 mins cache TTL
    headers: {
      "X-Auth-Token": cleanToken,
      "Content-Type": "application/json"
    }
  };
};

export const getMatchesFootball = async () => {
  try {
    return await fetchWithCache(
      "matches-today",
      "https://api.football-data.org/v4/matches",
      getOptions()
    );
  } catch (error) {
    console.warn("Failed to fetch football matches:", error);
    return { matches: [], error: 500 };
  }
};

export const getMatchesFootballFinished = async () => {
  try {
    const todayDate = new Date();
    const getDateMonth = new Date(todayDate.getTime());
    getDateMonth.setDate(todayDate.getDate() - 1);
    const year = getDateMonth.getFullYear();
    const month = String(getDateMonth.getMonth() + 1).padStart(2, "0");
    const day = String(getDateMonth.getDate()).padStart(2, "0");
    const yesterday = [year, month, day].join("-");

    return await fetchWithCache(
      `matches-finished-${yesterday}`,
      `https://api.football-data.org/v4/matches?date=${yesterday}`,
      getOptions()
    );
  } catch (error) {
    console.warn("Failed to fetch finished matches:", error);
    return { matches: [], error: 500 };
  }
};

export const getNewsInfo = async () => {
  try {
    const token = process.env.API_TOKEN_NEWS || "a699742715bf4a59968c8e700d55fe92";
    const cleanToken = token.replace(/;$/, "");
    
    // News cache key
    const cacheKey = "news-articles";
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const newsData = await fetch(
      `https://newsapi.org/v2/everything?apikey=${cleanToken}&domains=skysports.com,goal.com,espn.com,bbc.com/sport&q=football+OR+transfers+OR+soccer&language=en&sortBy=publishedAt&pageSize=8`,
      { next: { revalidate: 600 } }
    );
    if (!newsData.ok) {
      console.warn(`HTTP warning fetching news: ${newsData.status}`);
      return { articles: [], error: newsData.status };
    }
    const data = await newsData.json();
    cache.set(cacheKey, { data, timestamp: now });
    return data;
  } catch (error) {
    console.warn("Failed to fetch news info:", error);
    return { articles: [], error: 500 };
  }
};

export const getTransferGossipInfo = async () => {
  try {
    const token = process.env.API_TOKEN_NEWS || "a699742715bf4a59968c8e700d55fe92";
    const cleanToken = token.replace(/;$/, "");
    
    const cacheKey = "transfer-articles";
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const newsData = await fetch(
      `https://newsapi.org/v2/everything?apikey=${cleanToken}&domains=skysports.com,goal.com,espn.com,bbc.com/sport&q=transfers+OR+signings+OR+rumors&language=en&sortBy=publishedAt&pageSize=8`,
      { next: { revalidate: 600 } }
    );
    if (!newsData.ok) {
      console.warn(`HTTP warning fetching transfer news: ${newsData.status}`);
      return { articles: [], error: newsData.status };
    }
    const data = await newsData.json();
    cache.set(cacheKey, { data, timestamp: now });
    return data;
  } catch (error) {
    console.warn("Failed to fetch transfer news info:", error);
    return { articles: [], error: 500 };
  }
};

export const filterLeague = async (filterData: string) => {
  try {
    const getEnglishLeague = await getMatchesFootball();
    if (getEnglishLeague.error) {
      return [];
    }
    const filterPremierLeague: matchesType[] = getEnglishLeague?.matches || [];
    const getData = filterPremierLeague.filter((item) => item.competition.name === filterData);
    return getData;
  } catch (error) {
    console.warn(`Failed to filter league ${filterData}:`, error);
    return [];
  }
};

export const getLeagueStandings = async (code: string) => {
  try {
    return await fetchWithCache(
      `standings-${code}`,
      `https://api.football-data.org/v4/competitions/${code}/standings`,
      getOptions()
    );
  } catch (error) {
    console.warn(`Failed to fetch standings for ${code}:`, error);
    return { standings: [], error: 500 };
  }
};

export const getLeagueMatches = async (code: string, matchday?: number) => {
  try {
    const options = getOptions();
    const url = matchday
      ? `https://api.football-data.org/v4/competitions/${code}/matches?matchday=${matchday}`
      : `https://api.football-data.org/v4/competitions/${code}/matches`;
    
    const cacheKey = matchday ? `matches-${code}-${matchday}` : `matches-${code}-all`;
    return await fetchWithCache(cacheKey, url, options);
  } catch (error) {
    console.warn(`Failed to fetch matches for ${code}:`, error);
    return { matches: [], error: 500 };
  }
};

export const getMatchesByDate = async (dateStr: string) => {
  try {
    const nextDay = new Date(dateStr + "T12:00:00");
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toLocaleDateString("sv");

    return await fetchWithCache(
      `matches-date-${dateStr}`,
      `https://api.football-data.org/v4/matches?dateFrom=${dateStr}&dateTo=${nextDayStr}`,
      getOptions()
    );
  } catch (error) {
    console.warn(`Failed to fetch matches for date ${dateStr}:`, error);
    return { matches: [], error: 500 };
  }
};

export const getMatchDetails = async (id: string) => {
  try {
    return await fetchWithCache(
      `match-detail-${id}`,
      `https://api.football-data.org/v4/matches/${id}`,
      getOptions()
    );
  } catch (error) {
    console.warn(`Failed to fetch match detail for ${id}:`, error);
    return null;
  }
};

export const getMatchH2H = async (id: string) => {
  try {
    return await fetchWithCache(
      `match-h2h-${id}`,
      `https://api.football-data.org/v4/matches/${id}/head2head`,
      getOptions()
    );
  } catch (error) {
    console.warn(`Failed to fetch match H2H for ${id}:`, error);
    return null;
  }
};

