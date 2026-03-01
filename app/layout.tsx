import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/app/components/Navigation'

export const metadata: Metadata = {
  title: 'Price Scraper - Compare Grocery Prices',
  description: 'Compare product prices from Imtiaz Super Market and Chase Up Grocery',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>&copy; 2026 Price Scraper. All rights reserved.</p>
              <p className="text-sm mt-2">
                Comparing prices from <strong>Imtiaz Super Market</strong> and{' '}
                <strong>Chase Up Grocery</strong>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
