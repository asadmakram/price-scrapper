'use client'

import { useState, useEffect } from 'react'
import { fetchImtiazPrices, fetchChaseupPrices, fetchMetroPrices, Product } from '@/app/lib/priceScraper'
import { TrendingDown, TrendingUp, Loader2, Search, Tag, Star, ShoppingCart, Plus, Minus, Award } from 'lucide-react'

interface ComparisonGroup {
  productName: string
  imtiazPrice?: number
  chaseupPrice?: number
  metroPrice?: number
  imtiazProduct?: Product
  chaseupProduct?: Product
  metroProduct?: Product
  bestPrice?: 'imtiaz' | 'chaseup' | 'metro'
  savings?: number
}

interface CartItem {
  productId: string
  productName: string
  website: string
  price: number
  quantity: number
}

interface UnmatchedProduct {
  product: Product
  website: string
}

function calculatePriceDifference(price1: number, price2: number) {
  const difference = price2 - price1
  const percentChange = (difference / price1) * 100
  return {
    difference: Math.round(difference * 100) / 100,
    percentChange: Math.round(percentChange * 100) / 100,
  }
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[m][n]
}

// Calculate similarity score (0-100)
function calculateSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 100
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  return Math.round(((maxLen - distance) / maxLen) * 100)
}

// Extract size from product name and convert to ml for comparison
function extractSize(name: string): number | null {
  const sizeMatch = name.match(/(\d+(?:\.\d+)?)\s*(ml|ltr|l|kg|g)\b/i)
  if (!sizeMatch) return null
  
  let value = parseFloat(sizeMatch[1])
  const unit = sizeMatch[2].toLowerCase()
  
  // Convert to ml for standard comparison
  if (unit === 'ltr' || unit === 'l') {
    value = value * 1000
  }
  return value
}

// Check if two sizes are compatible (within 15% tolerance)
function areSizesCompatible(size1: number | null, size2: number | null): boolean {
  if (!size1 || !size2) return true // If size can't be extracted, allow match
  const ratio = size1 / size2
  return ratio >= 0.85 && ratio <= 1.15 // Within 15% tolerance
}

// Normalize product names to match similar products from different stores
function normalizeProductName(name: string): string {
  // Extract size/volume information (e.g., "1Ltr", "500ml", "2.25L")
  const sizeMatch = name.match(/(\d+(?:\.\d+)?)\s*(ml|ltr|l|kg|g)\b/i)
  const size = sizeMatch ? `${sizeMatch[1]}${sizeMatch[2].toLowerCase()}` : ''

  // Remove size info and common variations
  let normalized = name
    .replace(/(\d+(?:\.\d+)?)\s*(ml|ltr|l|kg|g)\b/gi, '') // Remove size
    .replace(/\b(Pet Bottle|PET|Bottle|Soft Drink|Drink|Pack|Pkt|Pack Piece|NR|Drinkpet)\b/gi, '') // Remove common words
    .replace(/\s+/g, ' ')
    .trim()

  // Extract brand and base product name (first 2 words)
  const parts = normalized.split(' ').filter((p) => p.length > 0)
  const baseProduct = parts.slice(0, Math.min(2, parts.length)).join(' ')

  // Combine base product with size
  return size ? `${baseProduct} ${size}` : baseProduct
}


export default function PriceComparison() {
  const [comparisons, setComparisons] = useState<ComparisonGroup[]>([])
  const [unmatched, setUnmatched] = useState<UnmatchedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('milk')
  const [suggestedProducts] = useState(['milk', 'pepsi', 'oil', 'rice', 'tea', 'sugar', 'flour', 'butter'])
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (productId: string, productName: string, website: string, price: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.productId === productId && item.website === website
      )
      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === productId && item.website === website
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { productId, productName, website, price, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string, website: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.productId === productId && item.website === website))
    )
  }

  const updateQuantity = (productId: string, website: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, website)
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.productId === productId && item.website === website ? { ...item, quantity } : item
        )
      )
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const loadPrices = async (query: string) => {
    setLoading(true)
    try {
      // Fetch products with search query from all three stores
      const [imtiazData, chaseupData, metroData] = await Promise.all([
        fetchImtiazPrices(query),
        fetchChaseupPrices(query),
        fetchMetroPrices(query),
      ])

      // Use fuzzy matching to find best matches across all stores
      const SIMILARITY_THRESHOLD = 75 // 75% or higher similarity
      const matchedProducts = new Map<string, ComparisonGroup>()
      const usedIndices = {
        imtiaz: new Set<number>(),
        chaseup: new Set<number>(),
        metro: new Set<number>(),
      }
      const unmatchedList: UnmatchedProduct[] = []

      // Create a master list of all products with their source
      const allProducts = [
        ...imtiazData.map(p => ({ ...p, source: 'imtiaz' as const, index: imtiazData.indexOf(p) })),
        ...chaseupData.map(p => ({ ...p, source: 'chaseup' as const, index: chaseupData.indexOf(p) })),
        ...metroData.map(p => ({ ...p, source: 'metro' as const, index: metroData.indexOf(p) })),
      ]

      // Group products by normalized name
      const productGroups = new Map<string, typeof allProducts>()
      
      allProducts.forEach((product) => {
        const normalized = normalizeProductName(product.name)
        if (!productGroups.has(normalized)) {
          productGroups.set(normalized, [])
        }
        productGroups.get(normalized)!.push(product)
      })

      // For each normalized product name, try to match across all stores
      productGroups.forEach((products, normalizedName) => {
        const imtiazProduct = products.find(p => p.source === 'imtiaz' && !usedIndices.imtiaz.has(p.index))
        const chaseupProduct = products.find(p => p.source === 'chaseup' && !usedIndices.chaseup.has(p.index))
        const metroProduct = products.find(p => p.source === 'metro' && !usedIndices.metro.has(p.index))

        // If we have at least 2 products, create a comparison group
        const productCount = [imtiazProduct, chaseupProduct, metroProduct].filter(Boolean).length
        
        if (productCount >= 2) {
          const group: ComparisonGroup = {
            productName: normalizedName,
            imtiazPrice: imtiazProduct && imtiazProduct.price > 0 ? imtiazProduct.price : undefined,
            imtiazProduct: imtiazProduct,
            chaseupPrice: chaseupProduct && chaseupProduct.price > 0 ? chaseupProduct.price : undefined,
            chaseupProduct: chaseupProduct,
            metroPrice: metroProduct && metroProduct.price > 0 ? metroProduct.price : undefined,
            metroProduct: metroProduct,
          }

          // Find best price
          const prices = [
            { store: 'imtiaz' as const, price: group.imtiazPrice },
            { store: 'chaseup' as const, price: group.chaseupPrice },
            { store: 'metro' as const, price: group.metroPrice },
          ].filter(p => p.price !== undefined && p.price > 0)

          if (prices.length > 0) {
            const bestPrice = prices.reduce((min, p) => (p.price! < min.price! ? p : min))
            group.bestPrice = bestPrice.store
            const maxPrice = prices.reduce((max, p) => (p.price! > max.price! ? p : max))
            group.savings = maxPrice.price! - bestPrice.price!
          }

          matchedProducts.set(normalizedName, group)

          if (imtiazProduct) usedIndices.imtiaz.add(imtiazProduct.index)
          if (chaseupProduct) usedIndices.chaseup.add(chaseupProduct.index)
          if (metroProduct) usedIndices.metro.add(metroProduct.index)
        }
      })

      // Collect unmatched products
      imtiazData.forEach((product, index) => {
        if (!usedIndices.imtiaz.has(index)) {
          unmatchedList.push({ product, website: 'Imtiaz' })
        }
      })

      chaseupData.forEach((product, index) => {
        if (!usedIndices.chaseup.has(index)) {
          unmatchedList.push({ product, website: 'Chase Up' })
        }
      })

      metroData.forEach((product, index) => {
        if (!usedIndices.metro.has(index)) {
          unmatchedList.push({ product, website: 'Metro' })
        }
      })

      // Sort by savings (most savings first)
      const comparisons = Array.from(matchedProducts.values())
      comparisons.sort((a, b) => {
        const savingsA = a.savings || 0
        const savingsB = b.savings || 0
        return savingsB - savingsA
      })

      setComparisons(comparisons)
      setUnmatched(unmatchedList)
    } catch (error) {
      console.error('Failed to load prices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrices(searchQuery)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const query = formData.get('search') as string
    if (query.trim()) {
      setSearchQuery(query.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Price Comparison
          </h1>
          <p className="text-sm text-gray-600 font-medium">Compare prices across Imtiaz, Chase Up & Metro</p>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 mb-6">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </form>

          {/* Quick Filter Buttons */}
          <div>
            <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Quick filters:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedProducts.map((product) => (
                <button
                  key={product}
                  onClick={() => setSearchQuery(product)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all transform hover:scale-105 ${
                    searchQuery === product
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  {product}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        ) : comparisons.length === 0 && unmatched.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-sm text-gray-600">Try searching for other items</p>
          </div>
        ) : (
          <div className="space-y-4 pb-24">
            {/* MATCHED PRODUCTS SECTION */}
            {comparisons.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-md">✓</span>
                    Matched Products
                  </h2>
                  <span className="text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-1.5 rounded-full font-bold shadow-sm">
                    {comparisons.length} items
                  </span>
                </div>

                <div className="space-y-3">
                  {comparisons.map((comparison, idx) => {
                    const imtiazCartId = comparison.imtiazProduct?.id || `imtiaz-${idx}`
                    const chaseupCartId = comparison.chaseupProduct?.id || `chaseup-${idx}`
                    const metroCartId = comparison.metroProduct?.id || `metro-${idx}`
                    const imtiazInCart = cart.find(item => item.productId === imtiazCartId && item.website === 'Imtiaz')
                    const chaseupInCart = cart.find(item => item.productId === chaseupCartId && item.website === 'Chase Up')
                    const metroInCart = cart.find(item => item.productId === metroCartId && item.website === 'Metro')

                    return (
                      <div
                        key={`${comparison.productName}-${idx}`}
                        className="bg-white rounded-xl shadow-md border-2 border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                      >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-50 via-emerald-50 to-purple-50 px-4 py-3 border-b-2 border-gray-100">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-sm">{comparison.productName}</h3>
                            {comparison.savings && comparison.savings > 0 && (
                              <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                <Award className="w-3 h-3" />
                                Save Rs. {comparison.savings.toFixed(0)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Prices Grid - 3 columns */}
                        <div className="grid grid-cols-3 gap-3 p-4">
                          {/* Imtiaz */}
                          <div className={`rounded-lg p-3 transition-all ${
                            comparison.bestPrice === 'imtiaz'
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 shadow-md'
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Imtiaz</div>
                            {comparison.imtiazPrice ? (
                              <div className="space-y-2">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xl font-bold text-blue-600">Rs. {comparison.imtiazPrice}</span>
                                  {comparison.bestPrice === 'imtiaz' && (
                                    <span className="flex items-center gap-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                                      <Award className="w-3 h-3" />
                                      Best
                                    </span>
                                  )}
                                </div>
                                
                                {/* Stock */}
                                <div className="text-xs">
                                  {comparison.imtiazProduct?.inStock ? (
                                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-lg font-semibold">In Stock</span>
                                  ) : (
                                    <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-lg font-semibold">Out of Stock</span>
                                  )}
                                </div>

                                {/* Cart Buttons */}
                                {imtiazInCart ? (
                                  <div className="flex items-center gap-2 bg-blue-100 rounded-lg px-2 py-1.5">
                                    <button
                                      onClick={() => updateQuantity(imtiazCartId, 'Imtiaz', imtiazInCart.quantity - 1)}
                                      className="p-1 hover:bg-blue-200 rounded-lg text-blue-700 transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm font-bold text-blue-700 min-w-6 text-center">{imtiazInCart.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(imtiazCartId, 'Imtiaz', imtiazInCart.quantity + 1)}
                                      className="p-1 hover:bg-blue-200 rounded-lg text-blue-700 transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(imtiazCartId, comparison.productName, 'Imtiaz', comparison.imtiazPrice || 0)}
                                    className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    Add
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 italic">Not available</div>
                            )}
                          </div>

                          {/* Chase Up */}
                          <div className={`rounded-lg p-3 transition-all ${
                            comparison.bestPrice === 'chaseup'
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 shadow-md'
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Chase Up</div>
                            {comparison.chaseupPrice ? (
                              <div className="space-y-2">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xl font-bold text-emerald-600">Rs. {comparison.chaseupPrice}</span>
                                  {comparison.bestPrice === 'chaseup' && (
                                    <span className="flex items-center gap-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                                      <Award className="w-3 h-3" />
                                      Best
                                    </span>
                                  )}
                                </div>
                                
                                {/* Stock */}
                                <div className="text-xs">
                                  {comparison.chaseupProduct?.inStock ? (
                                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-lg font-semibold">In Stock</span>
                                  ) : (
                                    <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-lg font-semibold">Out of Stock</span>
                                  )}
                                </div>

                                {/* Cart Buttons */}
                                {chaseupInCart ? (
                                  <div className="flex items-center gap-2 bg-emerald-100 rounded-lg px-2 py-1.5">
                                    <button
                                      onClick={() => updateQuantity(chaseupCartId, 'Chase Up', chaseupInCart.quantity - 1)}
                                      className="p-1 hover:bg-emerald-200 rounded-lg text-emerald-700 transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm font-bold text-emerald-700 min-w-6 text-center">{chaseupInCart.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(chaseupCartId, 'Chase Up', chaseupInCart.quantity + 1)}
                                      className="p-1 hover:bg-emerald-200 rounded-lg text-emerald-700 transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(chaseupCartId, comparison.productName, 'Chase Up', comparison.chaseupPrice || 0)}
                                    className="w-full px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg text-xs font-semibold hover:from-emerald-700 hover:to-emerald-800 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    Add
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 italic">Not available</div>
                            )}
                          </div>

                          {/* Metro */}
                          <div className={`rounded-lg p-3 transition-all ${
                            comparison.bestPrice === 'metro'
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 shadow-md'
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Metro</div>
                            {comparison.metroPrice ? (
                              <div className="space-y-2">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xl font-bold text-purple-600">Rs. {comparison.metroPrice}</span>
                                  {comparison.bestPrice === 'metro' && (
                                    <span className="flex items-center gap-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                                      <Award className="w-3 h-3" />
                                      Best
                                    </span>
                                  )}
                                </div>
                                
                                {/* Stock */}
                                <div className="text-xs">
                                  {comparison.metroProduct?.inStock ? (
                                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-lg font-semibold">In Stock</span>
                                  ) : (
                                    <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-lg font-semibold">Out of Stock</span>
                                  )}
                                </div>

                                {/* Cart Buttons */}
                                {metroInCart ? (
                                  <div className="flex items-center gap-2 bg-purple-100 rounded-lg px-2 py-1.5">
                                    <button
                                      onClick={() => updateQuantity(metroCartId, 'Metro', metroInCart.quantity - 1)}
                                      className="p-1 hover:bg-purple-200 rounded-lg text-purple-700 transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm font-bold text-purple-700 min-w-6 text-center">{metroInCart.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(metroCartId, 'Metro', metroInCart.quantity + 1)}
                                      className="p-1 hover:bg-purple-200 rounded-lg text-purple-700 transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(metroCartId, comparison.productName, 'Metro', comparison.metroPrice || 0)}
                                    className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-purple-800 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    Add
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 italic">Not available</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* UNMATCHED PRODUCTS SECTION - Grouped by Store */}
            {unmatched.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6 mt-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-md">!</span>
                    Only in One Store
                  </h2>
                  <span className="text-sm bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-4 py-1.5 rounded-full font-bold shadow-sm">
                    {unmatched.length} items
                  </span>
                </div>

                {/* Group unmatched products by store */}
                {(() => {
                  const groupedByStore = unmatched.reduce((acc, item) => {
                    const store = item.website
                    if (!acc[store]) {
                      acc[store] = []
                    }
                    acc[store].push(item)
                    return acc
                  }, {} as Record<string, UnmatchedProduct[]>)

                  const storeOrder = ['Imtiaz', 'Chase Up', 'Metro']
                  const websiteStyles = {
                    'Imtiaz': {
                      headerBg: 'bg-gradient-to-r from-blue-50 to-blue-100',
                      headerBorder: 'border-blue-300',
                      headerText: 'text-blue-900',
                      badgeBg: 'bg-blue-100',
                      badgeText: 'text-blue-700',
                      button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
                      cardBg: 'bg-blue-50/50',
                    },
                    'Chase Up': {
                      headerBg: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
                      headerBorder: 'border-emerald-300',
                      headerText: 'text-emerald-900',
                      badgeBg: 'bg-emerald-100',
                      badgeText: 'text-emerald-700',
                      button: 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800',
                      cardBg: 'bg-emerald-50/50',
                    },
                    'Metro': {
                      headerBg: 'bg-gradient-to-r from-purple-50 to-purple-100',
                      headerBorder: 'border-purple-300',
                      headerText: 'text-purple-900',
                      badgeBg: 'bg-purple-100',
                      badgeText: 'text-purple-700',
                      button: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
                      cardBg: 'bg-purple-50/50',
                    },
                  }

                  return (
                    <div className="space-y-6">
                      {storeOrder.map((storeName) => {
                        const storeProducts = groupedByStore[storeName] || []
                        if (storeProducts.length === 0) return null

                        const styles = websiteStyles[storeName as keyof typeof websiteStyles] || websiteStyles['Imtiaz']

                        return (
                          <div key={storeName} className="space-y-3">
                            {/* Store Header */}
                            <div className={`${styles.headerBg} border-2 ${styles.headerBorder} rounded-xl px-4 py-3 shadow-sm`}>
                              <div className="flex items-center justify-between">
                                <h3 className={`text-lg font-bold ${styles.headerText} flex items-center gap-2`}>
                                  <span className={`${styles.badgeBg} ${styles.badgeText} px-3 py-1 rounded-lg text-sm font-bold shadow-sm`}>
                                    {storeName}
                                  </span>
                                </h3>
                                <span className={`text-sm font-semibold ${styles.headerText} bg-white/60 px-3 py-1 rounded-lg`}>
                                  {storeProducts.length} product{storeProducts.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {storeProducts.map((item, idx) => {
                                const cartId = item.product.id || `unmatched-${item.website}-${idx}`
                                const inCart = cart.find(cartItem => cartItem.productId === cartId && cartItem.website === item.website)

                                return (
                                  <div key={cartId} className={`bg-white rounded-xl border-2 border-gray-100 shadow-md hover:shadow-xl transition-all overflow-hidden p-3 ${styles.cardBg}`}>
                                    <div className="mb-3">
                                      <p className="text-xs font-bold text-gray-900 line-clamp-2 mb-2">{item.product.name}</p>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="text-xl font-bold text-gray-900">Rs. {item.product.price}</div>
                                      
                                      <div className="text-xs">
                                        {item.product.inStock ? (
                                          <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-lg font-semibold">In Stock</span>
                                        ) : (
                                          <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-lg font-semibold">Out of Stock</span>
                                        )}
                                      </div>

                                      {/* Cart Button */}
                                      {inCart ? (
                                        <div className={`flex items-center gap-2 ${styles.badgeBg} rounded-lg px-2 py-1.5`}>
                                          <button
                                            onClick={() => updateQuantity(cartId, item.website, inCart.quantity - 1)}
                                            className={`p-1 hover:opacity-80 rounded-lg ${styles.badgeText} transition-colors`}
                                          >
                                            <Minus className="w-3 h-3" />
                                          </button>
                                          <span className={`text-sm font-bold ${styles.badgeText} min-w-6 text-center`}>{inCart.quantity}</span>
                                          <button
                                            onClick={() => updateQuantity(cartId, item.website, inCart.quantity + 1)}
                                            className={`p-1 hover:opacity-80 rounded-lg ${styles.badgeText} transition-colors`}
                                          >
                                            <Plus className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => addToCart(cartId, item.product.name, item.website, item.product.price)}
                                          className={`w-full px-3 py-2 bg-gradient-to-r ${styles.button} text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all`}
                                        >
                                          <ShoppingCart className="w-3.5 h-3.5" />
                                          Add
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {/* FLOATING CART SUMMARY */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600 shadow-2xl border-t-2 border-white/30 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-lg p-2">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <p className="text-xs opacity-90 font-medium">Cart Items</p>
                  <p className="font-bold text-base">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-white opacity-90 font-medium">Total</p>
                <p className="font-bold text-xl text-white">Rs. {cartTotal.toLocaleString()}</p>
              </div>
              <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
