'use client'

import { 
  Twitter, 
  Linkedin, 
  Github, 
  Globe,
  Mail,
  MessageCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/Logo'

const socialPlatforms = [
  {
    name: 'Twitter',
    icon: Twitter,
    url: 'https://x.com/lantianlaoli',
    description: 'Follow us for updates and announcements',
    color: 'hover:text-blue-500'
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    url: 'https://linkedin.com/company/cracksense',
    description: 'Connect with us professionally',
    color: 'hover:text-blue-600'
  },
  {
    name: 'GitHub',
    icon: Github,
    url: 'https://github.com/cracksense',
    description: 'Check out our open source projects',
    color: 'hover:text-gray-700'
  },
  {
    name: 'Website',
    icon: Globe,
    url: 'https://cracksense.online',
    description: 'Visit our main website',
    color: 'hover:text-green-600'
  }
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <Logo size="md" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Support & Contact</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How Can We Help?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We&apos;re here to support you with any questions about CrackSense. 
            Choose your preferred way to get in touch with us.
          </p>
        </div>

        {/* Social Platforms */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Connect With Us
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon
              return (
                <Link
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200 ${platform.color}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {platform.name}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Additional Support */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Need More Help?</h3>
          <p className="text-gray-600 mb-6">
            If you have technical questions or need assistance with your account, 
            our team is ready to help you get the most out of CrackSense.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Email Support</h4>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Send us a detailed message and we&apos;ll get back to you within 24 hours.
              </p>
              <a 
                href="mailto:support@cracksense.online"
                className="text-gray-900 font-medium hover:text-gray-700 transition-colors"
              >
                support@cracksense.online
              </a>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Documentation</h4>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Browse our comprehensive guides and tutorials to learn more about CrackSense.
              </p>
              <Link 
                href="/docs"
                className="text-gray-900 font-medium hover:text-gray-700 transition-colors"
              >
                View Documentation →
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                How does CrackSense analyze crack images?
              </h4>
              <p className="text-gray-600 text-sm">
                Our AI uses advanced computer vision and machine learning algorithms to detect, 
                analyze, and assess cracks in structural images, providing detailed analysis reports.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                What types of images can I upload?
              </h4>
              <p className="text-gray-600 text-sm">
                We support common image formats (JPG, PNG, WebP) with clear, high-resolution 
                images of cracks for best analysis results.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                How accurate are the analysis results?
              </h4>
              <p className="text-gray-600 text-sm">
                Our AI achieves high accuracy rates, but results should be used as guidance. 
                For critical structural decisions, always consult with qualified professionals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
