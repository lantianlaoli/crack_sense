import Navigation from '@/components/Navigation'
import Image from 'next/image'

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="lg:pr-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
                Wall Crack Detection Examples & AI Analysis Results
              </h1>
              
              <h2 className="text-lg text-gray-600 mb-8 leading-relaxed">
                See how CrackCheck detects and evaluates real wall cracks using AI — with detailed risk levels, crack types, and repair suggestions.
              </h2>
            </div>

            {/* Illustration */}
            <div className="lg:pl-8">
              <div className="relative">
                <Image
                  src="/images/example_illustration.png"
                  alt="Person analyzing data and templates"
                  width={400}
                  height={300}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for future examples */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="text-center text-gray-600">
            Example cases will be displayed here once crack analysis data is available.
          </p>
        </div>
      </div>
    </div>
  )
}