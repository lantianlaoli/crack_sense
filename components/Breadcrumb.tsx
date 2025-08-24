import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'
import StructuredData from './StructuredData'

interface BreadcrumbItem {
  name: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const allItems = [
    { name: 'Home', href: '/' },
    ...items
  ]

  const breadcrumbStructuredData = {
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href ? `https://www.cracksense.online${item.href}` : undefined
    }))
  }

  return (
    <>
      <StructuredData type="website" data={breadcrumbStructuredData} />
      <nav className={`flex ${className}`} aria-label="Breadcrumb">
        <ol role="list" className="flex items-center space-x-4">
          <li>
            <div>
              <Link 
                href="/" 
                className="text-gray-400 hover:text-gray-500 transition-colors"
                aria-label="Home"
              >
                <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </li>
          {items.map((item) => (
            <li key={item.name}>
              <div className="flex items-center">
                <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                {item.current ? (
                  <span
                    className="ml-4 text-sm font-medium text-gray-500"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}