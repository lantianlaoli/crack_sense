'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { PACKAGES } from '@/lib/constants'

export default function Pricing() {
  const { user } = useUser()
  const [paymentLoading, setPaymentLoading] = useState(false)

  const handlePurchase = async (packageName: 'starter' | 'pro') => {
    if (paymentLoading || !user?.id) return
    
    const userEmail = user.emailAddresses?.[0]?.emailAddress
    if (!userEmail) {
      alert('Unable to get user email. Please try again.')
      return
    }
    
    setPaymentLoading(true)
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
      setPaymentLoading(false)
    }
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Pay once, use forever. No subscriptions, no hidden fees. Choose the package that fits your needs.
          </p>
          <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            🎉 New users get 1,000 free credits (5 analyses) to get started!
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Pack */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black mb-2">{PACKAGES.starter.name}</h3>
              <p className="text-gray-600 mb-4">{PACKAGES.starter.description}</p>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-black">${PACKAGES.starter.price}</span>
              </div>
              <p className="text-gray-500 mt-2">One-time payment</p>
            </div>

            <ul className="space-y-4 mb-8">
              {PACKAGES.starter.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {!user ? (
              <button className="w-full bg-gray-300 text-gray-500 rounded-full py-3 px-6 font-medium cursor-not-allowed">
                Sign in required
              </button>
            ) : (
              <button
                onClick={() => handlePurchase('starter')}
                disabled={paymentLoading}
                className="w-full bg-black text-white rounded-full py-3 px-6 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? 'Processing...' : 'Get Starter Pack'}
              </button>
            )}
          </div>

          {/* Pro Pack */}
          <div className="bg-white rounded-2xl p-8 border-2 border-black relative hover:shadow-lg transition-shadow">
            {/* Recommended Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm font-medium px-4 py-1 rounded-full">
              Best Value
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black mb-2">{PACKAGES.pro.name}</h3>
              <p className="text-gray-600 mb-4">{PACKAGES.pro.description}</p>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-black">${PACKAGES.pro.price}</span>
              </div>
              <p className="text-gray-500 mt-2">One-time payment</p>
            </div>

            <ul className="space-y-4 mb-8">
              {PACKAGES.pro.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {!user ? (
              <button className="w-full bg-gray-300 text-gray-500 rounded-full py-3 px-6 font-medium cursor-not-allowed">
                Sign in required
              </button>
            ) : (
              <button
                onClick={() => handlePurchase('pro')}
                disabled={paymentLoading}
                className="w-full bg-black text-white rounded-full py-3 px-6 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? 'Processing...' : 'Get Pro Pack'}
              </button>
            )}
          </div>
        </div>

        {/* Credit Info */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold text-black mb-4">AI Model Costs</h3>
          <div className="grid md:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="font-medium text-black">GPT-4o Mini</div>
              <div className="text-gray-600">200 credits per analysis</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="font-medium text-black">GPT-4o</div>
              <div className="text-gray-600">500 credits per analysis</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}