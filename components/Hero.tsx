'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="lg:pr-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-black leading-tight mb-6">
              AI-Powered Wall Crack Detection for Safer Homes
            </h1>
            
            <h2 className="text-lg text-gray-600 mb-8 leading-relaxed">
              Upload a photo of your wall cracks and get instant AI analysis with expert-backed repair guidance — keep your property safe and sound.
            </h2>

            <div className="flex items-center gap-4 mb-12">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Analysis
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                href="/example"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                View Example
              </Link>
            </div>
          </div>

          {/* Right Column - Illustration */}
          <div className="lg:pl-8">
            <div className="relative">
              <Image
                src="/images/hero_illustration.png"
                alt="House with smartphone showing crack analysis app"
                width={600}
                height={400}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}