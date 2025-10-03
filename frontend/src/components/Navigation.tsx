'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              Umamivers
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/how-to-use" 
              className={`text-sm transition-colors ${
                pathname === '/how-to-use' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              How to Use
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}