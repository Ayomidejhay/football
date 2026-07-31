"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type linkProps = {
  href: string;
  src: string;
  name: string;
};

const Linkside = ({ href, src, name }: linkProps) => {
  const pathname = usePathname();
  // Normalize the href for active comparison
  const normalizedHref = href === "" ? "/" : `/${href}`;
  const isActive = pathname === normalizedHref;

  return (
    <Link
      href={normalizedHref}
      className={`flex items-center py-2.5 px-3 rounded-xl transition-all duration-200 w-full group ${
        isActive
          ? "bg-slate-700/60 text-teal-400 font-semibold border-r-2 border-teal-400 shadow-inner"
          : "text-slate-300 hover:bg-[rgb(54,63,78)] hover:text-white"
      }`}
    >
      <div className="relative w-5 h-5 flex-shrink-0 flex items-center justify-center transition-transform duration-250 group-hover:scale-110">
        <Image
          src={src}
          alt={name}
          fill
          sizes="20px"
          className="object-contain"
          unoptimized
        />
      </div>
      <p className="ml-3.5 text-xs md:text-sm tracking-wide transition-colors duration-150">
        {name}
      </p>
    </Link>
  );
};

export default Linkside;