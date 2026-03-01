'use client'

import { useState, useEffect } from 'react'
import { fetchImtiazPrices, fetchChaseupPrices, Product } from '@/app/lib/priceScraper'
import { ShoppingCart, Loader2, Star } from 'lucide-react'

export default function PopularProducts() {
  const [imtiazProducts, setImtiazProducts] = useState<Product[]>([])
  const [chaseupProducts, setChaseupProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        // Fetch popular products with common search terms
        const searchTerms = ['milk', 'oil', 'rice']
        
        const [imtiazMilk, imtiazOil, imtiazRice, chaseupMilk, chaseupOil, chaseupRice] = await Promise.all([
          fetchImtiazPrices('milk'),
          fetchImtiazPrices('oil'),
          fetchImtiazPrices('rice'),
          fetchChaseupPrices('milk'),
          fetchChaseupPrices('oil'),
          fetchChaseupPrices('rice'),
        ])

        // Combine and take top products from each
        const combinedImtiaz = [...imtiazMilk, ...imtiazOil, ...imtiazRice]
        const combinedChaseup = [...chaseupMilk, ...chaseupOil, ...chaseupRice]

        // Remove duplicates and take top 6
        const uniqueImtiaz = Array.from(new Map(combinedImtiaz.map((p) => [p.id, p])).values()).slice(0, 6)
        const uniqueChaseup = Array.from(new Map(combinedChaseup.map((p) => [p.id, p])).values()).slice(0, 6)

        setImtiazProducts(uniqueImtiaz)
        setChaseupProducts(uniqueChaseup)
      } catch (error) {
        console.error('Failed to load popular products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading popular products...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          🏪 Imtiaz Super Market Popular Products
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {imtiazProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-40 bg-gray-100 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f0f0f0" width="100" height="100"/></svg>'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{product.name}</h4>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl font-bold text-gray-900">Rs. {product.price}</span>
                </div>
                {product.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-gray-600">{product.rating}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          🛒 Chase Up Grocery Popular Products
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chaseupProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-40 bg-gray-100 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f0f0f0" width="100" height="100"/></svg>'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{product.name}</h4>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl font-bold text-gray-900">Rs. {product.price}</span>
                </div>
                {product.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-gray-600">{product.rating}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
