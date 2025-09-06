import { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: '404 - Page Not Found | CrackSense',
  description: 'The page you are looking for could not be found. Return to CrackSense home page or explore our crack analysis services.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-200">404</h1>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. 
              The link might be broken or the page may have been moved.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Return Home
            </Link>
            
            <div className="text-sm text-gray-500">
              or try one of these popular pages:
            </div>
            
            <div className="flex flex-col space-y-2 text-sm">
              <Link 
                href="/dashboard" 
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Start Crack Analysis
              </Link>
              <Link 
                href="/examples" 
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                View Examples
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}