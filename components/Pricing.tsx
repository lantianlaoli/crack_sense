'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { TagIcon } from '@heroicons/react/24/outline'
import { PACKAGES, CREDIT_COSTS } from '@/lib/constants'
import CountingNumber from './CountingNumber'

export default function Pricing() {
  const { user } = useUser()
  const [paymentLoading, setPaymentLoading] = useState({ starter: false, pro: false })
  const [selectedModel, setSelectedModel] = useState<'google/gemini-2.0-flash-001' | 'google/gemini-2.5-flash' | 'anthropic/claude-sonnet-4'>('google/gemini-2.0-flash-001')
  const [animationKey, setAnimationKey] = useState(0)

  // Calculate analyses based on selected model
  const getAnalysesCount = (credits: number) => {
    const creditCost = CREDIT_COSTS[selectedModel]
    return Math.floor(credits / creditCost)
  }

  // Trigger animation when model changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1)
  }, [selectedModel])

  const handlePurchase = async (packageName: 'starter' | 'pro') => {
    if (paymentLoading[packageName] || !user?.id) return
    
    const userEmail = user.emailAddresses?.[0]?.emailAddress
    if (!userEmail) {
      alert('Unable to get user email. Please try again.')
      return
    }
    
    setPaymentLoading(prev => ({ ...prev, [packageName]: true }))
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: userEmail,
          packageName: packageName
        })
      })

      const data = await response.json()
      
      if (data.success && data.checkout_url) {
        window.open(data.checkout_url, '_blank')
      } else {
        alert(data.error || 'Failed to create payment session. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setPaymentLoading(prev => ({ ...prev, [packageName]: false }))
    }
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            Prices
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            No hidden fees. Just clear answers about your wall cracks.
          </p>
        </div>

        {/* Pricing Cards Container with Gray Background */}
        <div className="relative bg-gray-100 rounded-3xl p-6 max-w-5xl mx-auto">
          {/* Model Switcher in top right */}
          <div className="absolute top-4 right-6">
            <div className="bg-white rounded-lg p-1 inline-flex shadow-sm">
              <button
                onClick={() => setSelectedModel('anthropic/claude-sonnet-4')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedModel === 'anthropic/claude-sonnet-4'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Claude 4
              </button>
              <button
                onClick={() => setSelectedModel('google/gemini-2.5-flash')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedModel === 'google/gemini-2.5-flash'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Gemini 2.5
              </button>
              <button
                onClick={() => setSelectedModel('google/gemini-2.0-flash-001')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedModel === 'google/gemini-2.0-flash-001'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Gemini 2.0
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 pt-12">
          {/* Starter Pack */}
          <div className="bg-white rounded-2xl p-8 border-2 border-black relative hover:shadow-lg transition-shadow">
            {/* Recommended Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm font-medium px-4 py-1 rounded-full">
              Recommended
            </div>
            
            {/* Icon and Title */}
            <div className="flex items-center mb-6">
              <TagIcon className="w-6 h-6 text-black mr-3" />
              <h3 className="text-2xl font-bold text-black">{PACKAGES.starter.name}</h3>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline">
                <CountingNumber 
                  key={`starter-price-${animationKey}`}
                  end={PACKAGES.starter.price}
                  prefix="$"
                  className="text-5xl font-bold text-black"
                  duration={1200}
                  decimals={2}
                />
              </div>
              <p className="text-gray-500 mt-1">One-time payment</p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-black font-bold">{PACKAGES.starter.description}</p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <CountingNumber 
                    key={`starter-credits-${animationKey}`}
                    end={PACKAGES.starter.credits}
                    suffix=" credits included"
                    duration={1000}
                  />
                </span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <CountingNumber 
                    key={`starter-analyses-${animationKey}`}
                    end={getAnalysesCount(PACKAGES.starter.credits)}
                    suffix=" analyses"
                    duration={1100}
                  />
                </span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Structural engineer support</span>
              </li>
            </ul>

            {!user ? (
              <button className="w-full bg-gray-300 text-gray-500 rounded-lg py-3 px-6 font-medium cursor-not-allowed">
                Sign in required
              </button>
            ) : (
              <button
                onClick={() => handlePurchase('starter')}
                disabled={paymentLoading.starter}
                className="w-full bg-black text-white rounded-lg py-3 px-6 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading.starter ? 'Processing...' : 'Start Checking'}
              </button>
            )}
          </div>

          {/* Pro Pack */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            
            {/* Icon and Title */}
            <div className="flex items-center mb-6">
              <TagIcon className="w-6 h-6 text-black mr-3" />
              <h3 className="text-2xl font-bold text-black">{PACKAGES.pro.name}</h3>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline">
                <CountingNumber 
                  key={`pro-price-${animationKey}`}
                  end={PACKAGES.pro.price}
                  prefix="$"
                  className="text-5xl font-bold text-black"
                  duration={1200}
                  decimals={2}
                />
              </div>
              <p className="text-gray-500 mt-1">One-time payment</p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-black font-bold">{PACKAGES.pro.description}</p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <CountingNumber 
                    key={`pro-credits-${animationKey}`}
                    end={PACKAGES.pro.credits}
                    suffix=" credits included"
                    duration={1000}
                  />
                </span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <CountingNumber 
                    key={`pro-analyses-${animationKey}`}
                    end={getAnalysesCount(PACKAGES.pro.credits)}
                    suffix=" analyses"
                    duration={1100}
                  />
                </span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Structural engineer support</span>
              </li>
            </ul>

            {!user ? (
              <button className="w-full bg-gray-300 text-gray-500 rounded-lg py-3 px-6 font-medium cursor-not-allowed">
                Sign in required
              </button>
            ) : (
              <button
                onClick={() => handlePurchase('pro')}
                disabled={paymentLoading.pro}
                className="w-full bg-black text-white rounded-lg py-3 px-6 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading.pro ? 'Processing...' : 'Get Pro Value'}
              </button>
            )}
          </div>
          </div>
        </div>

      </div>
    </section>
  )
}