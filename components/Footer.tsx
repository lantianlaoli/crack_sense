import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="CrackSense Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-lg font-bold text-gray-900">CrackSense</span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              Get organized and productive with AI-powered crack analysis. 
              Analyze your wall cracks and get expert recommendations with our 
              all-in-one system.
            </p>
          </div>

          {/* Social */}
          <div className="lg:text-right">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Social</h4>
            <Link 
              href="https://x.com/lantianlaoli"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              X (Twitter)
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-600">
            <span>© Copyright 2025. All Rights Reserved.</span>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <span>Made with <span className="text-red-500">❤️</span> by lantianlaoli</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}