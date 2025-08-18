'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import { isAdmin } from '@/lib/admin'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const { user } = useUser()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 w-full z-50 flex justify-center pt-4">
      <nav className={`transition-all duration-300 rounded-2xl ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border border-gray-200/50' 
          : 'bg-white border border-gray-100'
      }`}>
        <div className="px-8 lg:px-12 w-full min-w-[900px] lg:min-w-[1100px]">
          <div className="flex items-center py-2.5">
            <div className="flex-1">
            {/* Logo */}
            <div className="flex items-center mr-16">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="CrackCheck Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-gray-900">CrackCheck</span>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center justify-center flex-1 mr-8">
            <div className="flex items-center space-x-20">
              <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">
                Home
              </Link>
              <Link href="/examples" className="text-gray-700 hover:text-gray-900 font-medium">
                Examples
              </Link>
              <Link href="/blogs" className="text-gray-700 hover:text-gray-900 font-medium">
                Blogs
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-gray-900 font-medium">
                About
              </Link>
              <Link href="/faq" className="text-gray-700 hover:text-gray-900 font-medium">
                FAQ
              </Link>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            {isAdmin(user) && (
              <Link 
                href="/admin"
                className="bg-gray-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                Admin
              </Link>
            )}
            {user && (
              <Link 
                href="/dashboard"
                className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </Link>
            )}
            {user ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  Get All Analysis
                </button>
              </SignInButton>
            )}
          </div>
          </div>
        </div>
      </nav>
    </div>
  )
}