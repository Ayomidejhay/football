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
        
    </div>
  )
}

export default Navbar