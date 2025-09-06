'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Package } from 'lucide-react'

export default function Hero() {
  const [secondButtonHover, setSecondButtonHover] = useState(false)

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Original Content */}
          <div className="space-y-8">
            {/* Promotion Banner */}
            <div className="flex items-center">
              <div className="inline-flex items-center gap-3 bg-black/90 backdrop-blur-sm border border-gray-200 text-white px-6 py-3 rounded-full">
                <div className="flex items-center gap-2">
                  <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Package className="w-4 h-4 text-gray-900" />
                    20 Free Credits
                  </span>
                  <span className="text-white/90 text-sm font-medium">
                    for New Users
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Check Wall Cracks Instantly
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
              Don&apos;t guess if it&apos;s dangerous. Get peace of mind with a quick crack check.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-none hover:translate-y-0.5 transition-all duration-200"
                onMouseEnter={() => setSecondButtonHover(true)}
                onMouseLeave={() => setSecondButtonHover(false)}
              >
                Check My Crack Now
                {secondButtonHover ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                )}
              </Link>
            </div>


          </div>

          {/* Right Side - Crack Analysis Example */}
          <div className="relative">
            {/* Crack Image with Minimal Analysis */}
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <Image 
                src="/crack_example.jpg"
                alt="Wall crack example"
                width={500}
                height={400}
                className="w-full h-auto"
              />
              
              {/* Minimal Analysis Overlay */}
              <div className="absolute inset-0">
                {/* Risk Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-black text-white px-3 py-1 rounded text-sm font-medium">
                    Critical
                  </div>
                </div>

                {/* Data Points */}
                <div className="absolute top-1/4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded border border-gray-200 px-3 py-2 shadow-sm">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Width</div>
                    <div className="text-sm font-semibold text-gray-900">3.2mm</div>
                  </div>
                </div>

                <div className="absolute bottom-1/3 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded border border-gray-200 px-3 py-2 shadow-sm">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Length</div>
                    <div className="text-sm font-semibold text-gray-900">45cm</div>
                  </div>
                </div>

                {/* Analysis Text */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded border border-gray-200 px-3 py-2 shadow-sm max-w-xs">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Analysis</div>
                    <div className="text-sm text-gray-900 leading-relaxed">
                      Structural crack detected. Diagonal pattern suggests foundation settlement.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}