'use client'

import { useState } from 'react'
import ExampleCard from '@/components/ExampleCard'

const categories = [
  { 
    id: 'all', 
    label: 'All', 
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  { 
    id: 'high', 
    label: 'High Risk', 
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.46 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )
  },
  { 
    id: 'moderate', 
    label: 'Moderate Risk', 
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  { 
    id: 'low', 
    label: 'Low Risk', 
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    id: 'structural', 
    label: 'Structural', 
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  { 
    id: 'surface', 
    label: 'Surface', 
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
      </svg>
    )
  }
]

interface CrackExample {
  id: string
  description: string
  image_urls: string[]
  risk_level: string
  ai_notes: string
  created_at: string
  user_id: string
}

interface ExamplesContentProps {
  cracks: CrackExample[]
}

export default function ExamplesContent({ cracks }: ExamplesContentProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredCracks = cracks.filter(crack => {
    if (activeCategory === 'all') return true
    if (activeCategory === 'high') return crack.risk_level === 'High'
    if (activeCategory === 'moderate') return crack.risk_level === 'Moderate'
    if (activeCategory === 'low') return crack.risk_level === 'Low'
    if (activeCategory === 'structural') return crack.description.includes('structural') || crack.description.includes('load-bearing')
    if (activeCategory === 'surface') return crack.description.includes('surface') || crack.description.includes('coating')
    return true
  })

  return (
    <>
      {/* Header */}
      <div className="bg-white pt-40 pb-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl lg:text-6xl font-bold text-black mb-8">
            All Examples
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            I carefully analyze wall cracks that are minimalistic, looks good and actually make you more productive. All my examples are made based on extensive research.
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeCategory === category.id
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
{category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Examples Grid */}
      <div className="bg-white pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCracks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCracks.map((crack) => (
                <ExampleCard key={crack.id} crack={crack} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600">
                No examples found for this category. Try selecting a different filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}