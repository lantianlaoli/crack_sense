'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
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
          ? 'bg-gray-50/90 backdrop-blur-md border border-gray-300/50' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="px-8 lg:px-12 w-full min-w-[900px] lg:min-w-[1100px]">
          <div className="flex items-center py-2.5">
            <div className="flex-1">
            {/* Logo */}
            <div className="flex items-center mr-16">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="CrackSense Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
                <span className="text-2xl font-bold text-gray-900">CrackSense</span>
              </Link>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* CTA Buttons and Navigation Links */}
          <div className="flex items-center gap-6 flex-1 justify-end">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/blog" className="text-gray-700 hover:text-gray-900 font-medium">
                Blog
              </Link>
              <Link href="/example" className="text-gray-700 hover:text-gray-900 font-medium">
                Example
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-gray-900 font-medium">
                Pricing
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
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
                    Discover
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
          </div>
        </div>
      </nav>
    </div>
  )
}