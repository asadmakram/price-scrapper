'use client'

import { useState, useEffect } from 'react'
import { fetchImtiazPrices, fetchChaseupPrices, Product } from '@/app/lib/priceScraper'
import { TrendingDown, TrendingUp, Loader2, Search, Tag, Star, ShoppingCart, Plus, Minus } from 'lucide-react'

interface ComparisonGroup {
  productName: string
  imtiazPrice?: number
  chaseupPrice?: number
  imtiazProduct?: Product
  chaseupProduct?: Product
  priceDiff?: { difference: number; percentChange: number }
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
      // Fetch products with search query
      const [imtiazData, chaseupData] = await Promise.all([
        fetchImtiazPrices(query),
        fetchChaseupPrices(query),
      ])

      // Use fuzzy matching to find best matches between stores
      const SIMILARITY_THRESHOLD = 75 // 75% or higher similarity
      const matchedProducts = new Map<string, ComparisonGroup>()
      const usedChaseupIndices = new Set<number>()
      const usedImtiazIndices = new Set<number>()
      const unmatchedList: UnmatchedProduct[] = []

      // For each Imtiaz product, find best match in Chase Up
      imtiazData.forEach((imtiazProduct, imtiazIndex) => {
        const imtiazNormalized = normalizeProductName(imtiazProduct.name)
        const imtiazSize = extractSize(imtiazProduct.name)
        let bestMatch: { index: number; similarity: number } | null = null

        // Find best matching product from Chase Up using fuzzy matching
        chaseupData.forEach((chaseupProduct, index) => {
          if (usedChaseupIndices.has(index)) return

          const chaseupNormalized = normalizeProductName(chaseupProduct.name)
          const chaseupSize = extractSize(chaseupProduct.name)
          
          // IMPORTANT: Check if sizes are compatible first (within 15%)
          if (!areSizesCompatible(imtiazSize, chaseupSize)) {
            return // Skip if sizes don't match
          }
          
          const similarity = calculateSimilarity(imtiazNormalized, chaseupNormalized)

          if (similarity >= SIMILARITY_THRESHOLD) {
            if (!bestMatch || similarity > bestMatch.similarity) {
              bestMatch = { index, similarity }
            }
          }
        })

        if (bestMatch) {
          const match = bestMatch as { index: number; similarity: number }
          const chaseupProduct = chaseupData[match.index]
          const matchKey = `${imtiazNormalized}_${match.similarity}`

          matchedProducts.set(matchKey, {
            productName: imtiazNormalized,
            imtiazPrice: imtiazProduct.price > 0 ? imtiazProduct.price : undefined,
            imtiazProduct,
            chaseupPrice: chaseupProduct.price > 0 ? chaseupProduct.price : undefined,
            chaseupProduct,
          })

          usedChaseupIndices.add(match.index)
          usedImtiazIndices.add(imtiazIndex)
        }
      })

      // Collect unmatched Imtiaz products
      imtiazData.forEach((product, index) => {
        if (!usedImtiazIndices.has(index)) {
          unmatchedList.push({ product, website: 'Imtiaz' })
        }
      })

      // Collect unmatched Chase Up products
      chaseupData.forEach((product, index) => {
        if (!usedChaseupIndices.has(index)) {
          unmatchedList.push({ product, website: 'Chase Up' })
        }
      })

      // Calculate price differences for matched products
      const comparisons = Array.from(matchedProducts.values())
      comparisons.forEach((group) => {
        if (group.imtiazPrice && group.chaseupPrice) {
          group.priceDiff = calculatePriceDifference(group.imtiazPrice, group.chaseupPrice)
        }
      })

      // Sort by price difference (most savings first)
      comparisons.sort((a, b) => {
        if (!a.priceDiff || !b.priceDiff) return 0
        return Math.abs(b.priceDiff.difference) - Math.abs(a.priceDiff.difference)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* Header Section */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Price Comparison</h1>
          <p className="text-sm text-gray-600">Imtiaz Super Market vs Chase Up Grocery</p>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="flex gap-1 md:gap-2">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search for products..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </form>

          {/* Quick Filter Buttons */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Quick filters:</p>
            <div className="flex flex-wrap gap-1">
              {suggestedProducts.map((product) => (
                <button
                  key={product}
                  onClick={() => setSearchQuery(product)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    searchQuery === product
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
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
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">No products found</h3>
            <p className="text-sm text-gray-600">Try searching for other items</p>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {/* MATCHED PRODUCTS SECTION */}
            {comparisons.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    Matched Products
                  </h2>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    {comparisons.length} items
                  </span>
                </div>

                <div className="space-y-2">
                  {comparisons.map((comparison, idx) => {
                    const priceDiff = comparison.priceDiff
                    const isBetter = priceDiff && priceDiff.difference > 0 ? 'imtiaz' : 'chaseup'
                    const imtiazCartId = comparison.imtiazProduct?.id || `imtiaz-${idx}`
                    const chaseupCartId = comparison.chaseupProduct?.id || `chaseup-${idx}`
                    const imtiazInCart = cart.find(item => item.productId === imtiazCartId && item.website === 'Imtiaz')
                    const chaseupInCart = cart.find(item => item.productId === chaseupCartId && item.website === 'Chase Up')

                    return (
                      <div
                        key={`${comparison.productName}-${idx}`}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow transition-shadow"
                      >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-xs">{comparison.productName}</h3>
                            {priceDiff && (
                              <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                priceDiff.difference > 0
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                Save Rs. {Math.abs(priceDiff.difference)} ({Math.abs(priceDiff.percentChange).toFixed(1)}%)
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Prices Grid */}
                        <div className="grid grid-cols-2 gap-2 p-3">
                          {/* Imtiaz */}
                          <div className={`rounded p-2 ${
                            isBetter === 'imtiaz' && priceDiff
                              ? 'bg-green-50 border-2 border-green-300'
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <div className="text-xs font-semibold text-gray-600 mb-1">Imtiaz</div>
                            {comparison.imtiazPrice ? (
                              <div className="space-y-1.5">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-lg font-bold text-blue-600">Rs. {comparison.imtiazPrice}</span>
                                  {priceDiff && isBetter === 'imtiaz' && (
                                    <span className="text-xs bg-green-500 text-white px-1.5 py-0 rounded-full font-bold leading-tight">
                                      Best
                                    </span>
                                  )}
                                </div>
                                
                                {/* Stock & Rating */}
                                <div className="text-xs space-y-0.5">
                                  {comparison.imtiazProduct?.inStock ? (
                                    <span className="inline-block bg-green-100 text-green-700 px-1.5 py-0 rounded text-xs">In Stock</span>
                                  ) : (
                                    <span className="inline-block bg-red-100 text-red-700 px-1.5 py-0 rounded text-xs">Out of Stock</span>
                                  )}
                                </div>

                                {/* Cart Buttons */}
                                {imtiazInCart ? (
                                  <div className="flex items-center gap-1 bg-blue-100 rounded px-1.5 py-1">
                                    <button
                                      onClick={() => updateQuantity(imtiazCartId, 'Imtiaz', imtiazInCart.quantity - 1)}
                                      className="p-0 hover:bg-blue-200 rounded text-blue-700"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-bold text-blue-700 min-w-4 text-center">{imtiazInCart.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(imtiazCartId, 'Imtiaz', imtiazInCart.quantity + 1)}
                                      className="p-0 hover:bg-blue-200 rounded text-blue-700"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(imtiazCartId, comparison.productName, 'Imtiaz', comparison.imtiazPrice || 0)}
                                    className="w-full px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 flex items-center justify-center gap-1"
                                  >
                                    <ShoppingCart className="w-3 h-3" />
                                    Add
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">Not available</div>
                            )}
                          </div>

                          {/* Chase Up */}
                          <div className={`rounded p-2 ${
                            isBetter === 'chaseup' && priceDiff
                              ? 'bg-green-50 border-2 border-green-300'
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <div className="text-xs font-semibold text-gray-600 mb-1">Chase Up</div>
                            {comparison.chaseupPrice ? (
                              <div className="space-y-1.5">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-lg font-bold text-emerald-600">Rs. {comparison.chaseupPrice}</span>
                                  {priceDiff && isBetter === 'chaseup' && (
                                    <span className="text-xs bg-green-500 text-white px-1.5 py-0 rounded-full font-bold leading-tight">
                                      Best
                                    </span>
                                  )}
                                </div>
                                
                                {/* Stock & Rating */}
                                <div className="text-xs space-y-0.5">
                                  {comparison.chaseupProduct?.inStock ? (
                                    <span className="inline-block bg-green-100 text-green-700 px-1.5 py-0 rounded text-xs">In Stock</span>
                                  ) : (
                                    <span className="inline-block bg-red-100 text-red-700 px-1.5 py-0 rounded text-xs">Out of Stock</span>
                                  )}
                                </div>

                                {/* Cart Buttons */}
                                {chaseupInCart ? (
                                  <div className="flex items-center gap-1 bg-emerald-100 rounded px-1.5 py-1">
                                    <button
                                      onClick={() => updateQuantity(chaseupCartId, 'Chase Up', chaseupInCart.quantity - 1)}
                                      className="p-0 hover:bg-emerald-200 rounded text-emerald-700"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-bold text-emerald-700 min-w-4 text-center">{chaseupInCart.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(chaseupCartId, 'Chase Up', chaseupInCart.quantity + 1)}
                                      className="p-0 hover:bg-emerald-200 rounded text-emerald-700"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(chaseupCartId, comparison.productName, 'Chase Up', comparison.chaseupPrice || 0)}
                                    className="w-full px-2 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 flex items-center justify-center gap-1"
                                  >
                                    <ShoppingCart className="w-3 h-3" />
                                    Add
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">Not available</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* UNMATCHED PRODUCTS SECTION */}
            {unmatched.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2 mt-4">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">!</span>
                    Only in One Store
                  </h2>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                    {unmatched.length} items
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {unmatched.map((item, idx) => {
                    const cartId = item.product.id || `unmatched-${item.website}-${idx}`
                    const inCart = cart.find(cartItem => cartItem.productId === cartId && cartItem.website === item.website)

                    return (
                      <div key={cartId} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow overflow-hidden p-2">
                        <div className="mb-2">
                          <p className="text-xs font-bold text-gray-900 line-clamp-2 mb-1">{item.product.name}</p>
                          <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.website === 'Imtiaz'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {item.website}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-lg font-bold text-gray-900">Rs. {item.product.price}</div>
                          
                          <div className="text-xs">
                            {item.product.inStock ? (
                              <span className="inline-block bg-green-100 text-green-700 px-1.5 py-0 rounded">In Stock</span>
                            ) : (
                              <span className="inline-block bg-red-100 text-red-700 px-1.5 py-0 rounded">Out of Stock</span>
                            )}
                          </div>

                          {/* Cart Button */}
                          {inCart ? (
                            <div className="flex items-center gap-1 bg-gray-100 rounded px-1.5 py-1">
                              <button
                                onClick={() => updateQuantity(cartId, item.website, inCart.quantity - 1)}
                                className="p-0 hover:bg-gray-200 rounded"
                              >
                                <Minus className="w-3 h-3 text-gray-600" />
                              </button>
                              <span className="text-xs font-bold text-gray-700 min-w-4 text-center">{inCart.quantity}</span>
                              <button
                                onClick={() => updateQuantity(cartId, item.website, inCart.quantity + 1)}
                                className="p-0 hover:bg-gray-200 rounded"
                              >
                                <Plus className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(cartId, item.product.name, item.website, item.product.price)}
                              className="w-full px-2 py-1 bg-gray-700 text-white rounded text-xs font-medium hover:bg-gray-800 flex items-center justify-center gap-1"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FLOATING CART SUMMARY */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-emerald-600 shadow-lg border-t border-white/20">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-white" />
                <div className="text-white">
                  <p className="text-xs opacity-90">Cart Items</p>
                  <p className="font-bold text-sm">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-white opacity-90">Total</p>
                <p className="font-bold text-lg text-white">Rs. {cartTotal.toLocaleString()}</p>
              </div>
              <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
