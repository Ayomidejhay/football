
import { apiOptions, matchesType } from "@/types";
import next from "next";
import { headers } from "next/headers";

const option:apiOptions = {
    next: {revalidate:30},
    headers:{
        'X-Auth-Token': 'e0370622d70648a884aaa022c149e789',
        'Content-Type': 'application/json'
    }
    
}

export const getMatchesFootball = async () => {
    const matchData = await fetch('https://api.football-data.org/v4/matches', option)
    return matchData.json()
    
    
}

const todayDate = new Date()
const getDateMonth = new Date(todayDate.getTime())
getDateMonth.setDate(todayDate.getDate() - 1)
const year = getDateMonth.getFullYear()
const month = String(getDateMonth.getMonth() + 1).padStart(2, '0')
const day = String(getDateMonth.getDate()).padStart(2, '0')

const yesterday = [year, month, day].join('-')

export const getMatchesFootballFinished = async () => {
    const matchData = await fetch(`https://api.football-data.org/v4/matches?date=${yesterday}`, option)
    return matchData.json()
}

export const getNewsInfo = async () => {
    const newsData = await fetch(`https://newsapi.org/v2/everything?apikey=a699742715bf4a59968c8e700d55fe92&q=soccer&pageSize=5`,{next:{revalidate:20}})
    return newsData.json()
}

export const filterLeague = async (filterData:string) => {
    const getEnglishLeague = await getMatchesFootball()
    const filterPremierLeague:matchesType[] = getEnglishLeague?.matches
    const getData = filterPremierLeague.filter((item) => item.competition.name === filterData)
    return getData
  }

