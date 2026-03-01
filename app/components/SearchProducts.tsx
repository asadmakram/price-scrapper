'use client'

import { useState } from 'react'
import { fetchAllPrices, Product } from '@/app/lib/priceScraper'
import { Search, Loader2 } from 'lucide-react'

export default function SearchProducts() {
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setError('Please enter a product name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const results = await fetchAllPrices(searchQuery)
      setProducts(results)
      if (results.length === 0) {
        setError('No products found')
      }
    } catch (err) {
      setError('Failed to fetch products. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search products (e.g., Wheat Flour, Rice, Milk)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          Search
        </button>
      </form>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

      {products.length > 0 && (
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Search Results</h2>
            <span className="text-sm text-gray-600">{products.length} products found</span>
          </div>
          {products.map((product) => (
            <div
              key={product.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{product.website}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-bold text-blue-600">Rs. {product.price}</span>
                    {product.inStock ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">In Stock</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Out of Stock</span>
                    )}
                  </div>
                  {product.rating && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span className="font-semibold text-yellow-500">★ {product.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
