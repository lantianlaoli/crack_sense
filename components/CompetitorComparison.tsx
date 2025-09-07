'use client'

import { TrendingUp } from 'lucide-react'

export default function CompetitorComparison() {
  const competitors = [
    {
      name: 'CrackSense',
      isOurs: true,
      pricing: 'Pay-per-result, from $29.9',
      reportSpeed: 'Instant (minutes)',
      features: 'Engineer-level AI analysis, generates PDF reports, powered by Claude & Gemini models',
      convenience: 'Upload a photo → receive professional report instantly',
      transparency: 'Flat, upfront pricing',
      bestFor: 'Homeowners & repair firms seeking fast, low-cost, engineer-grade reports'
    },
    {
      name: 'Crack Detector',
      isOurs: false,
      pricing: '$2.99 app + $24.99 / 100 uses',
      reportSpeed: 'Real-time detection only',
      features: 'Basic crack measurement (length & thickness), no PDF report',
      convenience: 'Use phone camera → get simple measurements',
      transparency: 'Clear in-app pricing',
      bestFor: 'DIY users needing quick crack measurement'
    },
    {
      name: 'SkyFrame Analytics',
      isOurs: false,
      pricing: 'Custom quotes, usually hundreds to thousands',
      reportSpeed: 'About 7 days (scheduling + analysis)',
      features: 'Drone survey + AI crack mapping, suited for infrastructure',
      convenience: 'Requires booking drone flight → delayed report',
      transparency: 'Quote-only, not transparent',
      bestFor: 'Infrastructure & high-rise projects'
    },
    {
      name: 'Professional Inspection',
      isOurs: false,
      pricing: '$300–$1,500+ depending on scope',
      reportSpeed: 'Several days (site visit + report prep)',
      features: 'Full structural evaluation with certified engineer',
      convenience: 'Schedule onsite engineer visit',
      transparency: 'Quote-based, varies widely',
      bestFor: 'Legal or certified structural inspections'
    }
  ]

  const features = [
    { key: 'pricing', label: 'Pricing' },
    { key: 'reportSpeed', label: 'Report Speed' },
    { key: 'features', label: 'Features' },
    { key: 'convenience', label: 'Convenience' },
    { key: 'transparency', label: 'Transparency' },
    { key: 'bestFor', label: 'Best For' }
  ]

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            Market Comparison
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How CrackSense Compares
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            See why professionals and homeowners choose CrackSense for fast, accurate, and affordable crack analysis
          </p>
        </div>

        {/* Comparison Table - Desktop */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
            {/* Header Row */}
            <div className="grid grid-cols-5 bg-gray-100">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">Solution</h3>
              </div>
              {competitors.map((competitor, index) => (
                <div 
                  key={index} 
                  className={`p-4 ${competitor.isOurs ? 'bg-black text-white' : ''}`}
                >
                  <h3 className={`font-bold text-center ${competitor.isOurs ? 'text-white' : 'text-gray-900'}`}>
                    {competitor.name}
                  </h3>
                </div>
              ))}
            </div>

            {/* Feature Rows */}
            {features.map((feature, featureIndex) => (
              <div key={feature.key} className={`grid grid-cols-5 border-t border-gray-200 ${featureIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="py-4 px-4 font-medium text-gray-900">
                  {feature.label}
                </div>
                {competitors.map((competitor, compIndex) => (
                  <div 
                    key={compIndex} 
                    className={`py-4 px-4 ${competitor.isOurs ? 'bg-black/5 font-medium' : ''}`}
                  >
                    <div className={`text-sm ${competitor.isOurs ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                      {competitor[feature.key as keyof typeof competitor]}
                    </div>
                  </div>
                ))}
              </div>
            ))}

          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-6">
          {competitors.map((competitor, index) => (
            <div key={index} className={`bg-white rounded-xl border ${competitor.isOurs ? 'border-black border-2' : 'border-gray-200'} p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">
                  {competitor.name}
                </h3>
                {competitor.isOurs && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Our Solution
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.key}>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {feature.label}
                    </div>
                    <div className={`text-sm ${competitor.isOurs ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {competitor[feature.key as keyof typeof competitor]}
                    </div>
                  </div>
                ))}
              </div>

              {competitor.isOurs && (
                <div className="mt-6">
                  <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors w-full">
                    Start Analysis
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}