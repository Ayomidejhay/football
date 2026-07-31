import React from "react";
import { getNewsInfo, getTransferGossipInfo } from "@/api";
import { newsType } from "@/types";
import NewsTabs from "./NewsTabs";

const News = async () => {
  // Fetch both headlines and transfers concurrently on the server
  const [getNews, getTransfers] = await Promise.all([
    getNewsInfo(),
    getTransferGossipInfo()
  ]);

  const newsData: newsType[] = getNews?.articles || [];
  const transferData: newsType[] = getTransfers?.articles || [];

  return (
    <aside className="w-full lg:w-[350px] shrink-0 p-4 bg-[rgb(40,46,58)] rounded-2xl border border-slate-700/40 shadow-lg">
      <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400 mb-3 px-1">
        Football News Hub
      </h2>
      <NewsTabs newsData={newsData} transferData={transferData} />
    </aside>
  );
};

export default News;