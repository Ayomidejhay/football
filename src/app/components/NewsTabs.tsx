"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { newsType } from "@/types";

interface NewsTabsProps {
  newsData: newsType[];
  transferData: newsType[];
}

const NewsTabs = ({ newsData, transferData }: NewsTabsProps) => {
  const [activeTab, setActiveTab] = useState<"headlines" | "transfers">("headlines");

  const currentData = activeTab === "headlines" ? newsData : transferData;

  const tabClass = (tabName: typeof activeTab) => {
    const base = "px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer text-center flex-1 uppercase tracking-wider";
    return activeTab === tabName
      ? `${base} bg-teal-400 text-slate-900 shadow-md shadow-teal-500/10`
      : `${base} bg-slate-700 text-slate-300 hover:bg-slate-650 hover:text-white`;
  };

  return (
    <div className="space-y-4">
      {/* Toggles */}
      <div className="flex space-x-2 p-1 bg-slate-800/30 border border-slate-700/25 rounded-xl w-full">
        <button onClick={() => setActiveTab("headlines")} className={tabClass("headlines")}>
          Headlines
        </button>
        <button onClick={() => setActiveTab("transfers")} className={tabClass("transfers")}>
          Transfers
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {currentData.length > 0 ? (
          currentData.map((news, index) => {
            if (!news.title) return null;

            // Use index + title to create unique key
            return (
              <Link
                key={`${index}-${news.title}`}
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative w-full h-[140px] group overflow-hidden rounded-xl border border-slate-700/30 shadow-md transition-all duration-200 hover:border-slate-600/80 hover:shadow-lg hover:shadow-teal-500/5"
              >
                {/* Source Badge */}
                {news.source?.name && (
                  <span className="absolute top-2 left-2 z-20 text-[9px] uppercase tracking-wider font-extrabold text-teal-400 bg-slate-950/85 backdrop-blur-sm px-2 py-0.5 rounded border border-teal-500/20">
                    {news.source.name}
                  </span>
                )}

                {/* News Image */}
                <Image
                  src={news?.urlToImage || "/img/news-football.webp"}
                  alt={news.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
                
                {/* Gradient Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

                {/* News Text */}
                <div className="absolute bottom-0 left-0 w-full p-3 z-20">
                  <p className="font-bold text-xs md:text-sm text-white leading-snug group-hover:text-teal-300 transition-colors duration-150 line-clamp-2">
                    {news.title}
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <p className="text-sm">No articles found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsTabs;
