'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "How accurate is CrackSense analysis?",
    answer: "CrackSense uses advanced AI models including Google Gemini 2.0 Flash and Claude 4 to provide professional-grade crack analysis. Our system achieves high accuracy by combining multiple analytical approaches: structural pattern recognition, dimensional analysis, and risk assessment based on established engineering principles. The AI is trained on thousands of crack analysis cases and provides confidence scores with each assessment. However, for critical structural concerns, we always recommend professional consultation with a structural engineer."
  },
  {
    question: "What types of cracks require immediate attention?",
    answer: "Several crack characteristics indicate immediate professional attention is needed: cracks wider than 1/4 inch (6mm), horizontal cracks in foundation walls, rapidly growing cracks, stair-step cracks in masonry that are widening, and any cracks accompanied by doors/windows that suddenly stick or won't close properly. Additionally, multiple new cracks appearing simultaneously or cracks showing visible displacement or separation should be evaluated immediately. Our AI analysis helps identify these critical warning signs and provides clear recommendations for urgent cases."
  },
  {
    question: "How much does crack analysis cost?",
    answer: "CrackSense operates on a flexible credit system designed to be affordable and transparent. New users receive 20 free credits to get started. Basic crack analysis costs 5 credits per analysis, with detailed homeowner assessments using advanced AI models requiring 10-15 credits. Credits can be purchased in packages, with better value on larger packages. This approach is significantly more cost-effective than traditional structural consultations, which typically cost $200-500+, while providing immediate results and professional-grade analysis you can access anytime."
  }
]

export default function FAQ() {
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get answers to the most common questions about crack analysis and our service
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-medium text-gray-900 pr-4">
                  {item.question}
                </h3>
                <div className="flex-shrink-0">
                  {expandedItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              {expandedItems.includes(index) && (
                <div className="px-6 pb-4">
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We&apos;re here to help.
          </p>
          <a
            href="/support"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}