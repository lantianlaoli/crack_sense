'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Flame } from 'lucide-react'

export default function Hero() {
  const [firstButtonHover, setFirstButtonHover] = useState(false)
  const [secondButtonHover, setSecondButtonHover] = useState(false)

  return (
    <div className="min-h-screen bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center relative">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Promotion Banner */}
          <div className="flex items-center justify-center mb-8">
            <div className="inline-flex items-center gap-3 bg-black/80 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Free 300 Credits
                </span>
                <span className="text-white/90 text-sm font-medium">
                  for New Users — Try 2 Crack Checks on Us
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
            Check Wall Cracks Instantly
          </h1>
          
          <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Don&apos;t guess if it&apos;s dangerous. Get peace of mind with a quick crack check.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/examples"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-none hover:translate-y-0.5 transition-all duration-200"
              onMouseEnter={() => setFirstButtonHover(true)}
              onMouseLeave={() => setFirstButtonHover(false)}
            >
              Explore All Crack Cases
              {firstButtonHover ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/>
                </svg>
              )}
            </Link>
            
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-none hover:translate-y-0.5 transition-all duration-200"
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

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-4 pt-8">
            <div className="flex -space-x-2">
              <Image 
                src="https://mperrwywxrkmqsglgvhw.supabase.co/storage/v1/object/public/images/customers_avatars/customer_1.jpg"
                alt="Customer 1"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
              <Image 
                src="https://mperrwywxrkmqsglgvhw.supabase.co/storage/v1/object/public/images/customers_avatars/customer_2.jpg"
                alt="Customer 2"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
              <Image 
                src="https://mperrwywxrkmqsglgvhw.supabase.co/storage/v1/object/public/images/customers_avatars/customer_3.jpg"
                alt="Customer 3"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
              <Image 
                src="https://mperrwywxrkmqsglgvhw.supabase.co/storage/v1/object/public/images/customers_avatars/customer_4.jpg"
                alt="Customer 4"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
              <Image 
                src="https://mperrwywxrkmqsglgvhw.supabase.co/storage/v1/object/public/images/customers_avatars/customer_5.jpg"
                alt="Customer 5"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">1,200+ cracks checked worldwide</span>
          </div>
        </div>
      </div>
    </div>
  )
}