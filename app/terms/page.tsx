import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-black mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-xl leading-relaxed mb-8">
              Last updated: January 2025
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using CrackSense, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Service Description</h2>
            <p>
              CrackSense provides AI-powered wall crack analysis services. Our platform analyzes uploaded images and provides risk assessments and repair recommendations.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Responsibilities</h2>
            <p>
              Users are responsible for providing accurate information and using the service in accordance with applicable laws and regulations.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Disclaimer</h2>
            <p>
              The analysis provided by CrackSense is for informational purposes only. For structural concerns, always consult with a qualified professional.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Limitation of Liability</h2>
            <p>
              CrackSense shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of our service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through our support channels.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}