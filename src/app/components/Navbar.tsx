import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Navbar = () => {
  return (
    <div className='flex justify-between items-center py-2'>
        <Link href='/' className='flex items-center space-x-2'>
            <div className='relative w-[30px] h-[30px]'>
                <Image src='/football-info.png' alt='logo' fill className='object-cover'/>
            </div>
            <span className='text-2xl font-bold hidden md:block'>Football info</span>
        </Link>
        <Link
          href="/compare"
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700/50 hover:bg-slate-700/85 hover:border-slate-600/80 text-xs font-bold text-teal-400 hover:text-white transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
        >
          <span>📊 Compare Players</span>
        </Link>
    </div>
  )
}

export default Navbar