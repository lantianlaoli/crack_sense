export interface StructuredDataProps {
  type: 'website' | 'service' | 'article' | 'organization'
  data: Record<string, any>
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
    }

    switch (type) {
      case 'website':
        return {
          ...baseSchema,
          '@type': 'WebSite',
          name: 'CrackSense',
          url: 'https://www.cracksense.online',
          description: 'Professional AI-powered crack analysis service for building inspection',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://www.cracksense.online/search?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          },
          ...data
        }

      case 'service':
        return {
          ...baseSchema,
          '@type': 'Service',
          name: 'AI-Powered Crack Analysis',
          provider: {
            '@type': 'Organization',
            name: 'CrackSense',
            url: 'https://www.cracksense.online'
          },
          description: 'Professional crack analysis using artificial intelligence for structural assessment',
          serviceType: 'Building Inspection',
          category: 'Construction & Engineering',
          areaServed: {
            '@type': 'Country',
            name: 'Global'
          },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Crack Analysis Services',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'AI Crack Analysis',
                  description: 'Upload photos and get instant AI-powered crack analysis'
                }
              }
            ]
          },
          ...data
        }

      case 'organization':
        return {
          ...baseSchema,
          '@type': 'Organization',
          name: 'CrackSense',
          url: 'https://www.cracksense.online',
          logo: 'https://www.cracksense.online/logo.png',
          description: 'Leading AI-powered crack analysis service for building and structural inspection',
          foundingDate: '2024',
          industry: 'Construction Technology',
          serviceArea: {
            '@type': 'Country',
            name: 'Global'
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            url: 'https://www.cracksense.online/contact'
          },
          sameAs: [
            'https://twitter.com/cracksense'
          ],
          ...data
        }

      case 'article':
        return {
          ...baseSchema,
          '@type': 'Article',
          publisher: {
            '@type': 'Organization',
            name: 'CrackSense',
            logo: {
              '@type': 'ImageObject',
              url: 'https://www.cracksense.online/logo.png'
            }
          },
          ...data
        }

      default:
        return { ...baseSchema, ...data }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSchema())
      }}
    />
  )
}