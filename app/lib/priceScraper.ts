// Real price scraper that fetches from actual websites via API routes
// Falls back to mock data if scraping fails

'use client'

export interface Product {
  id: string
  name: string
  price: number
  website: string
  image?: string
  url?: string
  inStock: boolean
  rating?: number
}

// Fallback mock data (used if scraping fails)
const fallbackImtiazProducts: Product[] = [
  {
    id: 'imtiaz-1',
    name: 'Pepsi Soft Drink Pet Bottle 2.25Ltr',
    price: 760,
    website: 'Imtiaz Super Market',
    inStock: true,
    rating: 4.2,
  },
  {
    id: 'imtiaz-2',
    name: 'Milk 1L (Fresh)',
    price: 180,
    website: 'Imtiaz Super Market',
    inStock: true,
    rating: 4.1,
  },
]

const fallbackChaseupProducts: Product[] = [
  {
    id: 'chaseup-1',
    name: 'Pepsi Soft Drink Pet Bottle 2.25Ltr',
    price: 776,
    website: 'Chase Up Grocery',
    inStock: true,
    rating: 4.2,
  },
  {
    id: 'chaseup-2',
    name: 'Milk 1L (Fresh)',
    price: 200,
    website: 'Chase Up Grocery',
    inStock: true,
    rating: 4.0,
  },
]

async function fetchFromAPI(source: 'imtiaz' | 'chaseup' | 'all', searchQuery?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams()
    params.append('source', source)
    if (searchQuery) params.append('q', searchQuery)

    const response = await fetch(`/api/products?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error(`Failed to fetch from ${source}:`, error)
    return []
  }
}

export async function fetchImtiazPrices(searchQuery?: string): Promise<Product[]> {
  // Try to fetch from local API route first (which handles server-side requests)
  const realProducts = await fetchFromAPI('imtiaz', searchQuery)

  console.log('Fetched Imtiaz products:', realProducts)
  // If we got real products, return them
  if (realProducts.length > 0) {
    return realProducts
  }

  // Fallback to mock data
  console.warn('Falling back to mock Imtiaz data')
  if (searchQuery) {
    return fallbackImtiazProducts.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
  return fallbackImtiazProducts
}

export async function fetchChaseupPrices(searchQuery?: string): Promise<Product[]> {
  // Try to fetch from local API route first (which handles server-side requests)
  const realProducts = await fetchFromAPI('chaseup', searchQuery)

  // If we got real products, return them
  if (realProducts.length > 0) {
    return realProducts
  }

  // Fallback to mock data
  console.warn('Falling back to mock Chase Up data')
  if (searchQuery) {
    return fallbackChaseupProducts.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
  return fallbackChaseupProducts
}

export async function fetchAllPrices(searchQuery?: string): Promise<Product[]> {
  // Try to fetch from both websites
  const [imtiazData, chaseupData] = await Promise.all([
    fetchImtiazPrices(searchQuery),
    fetchChaseupPrices(searchQuery),
  ])

  return [...imtiazData, ...chaseupData]
}

export async function calculatePriceDifference(
  price1: number,
  price2: number
): Promise<{ difference: number; percentChange: number }> {
  const difference = price2 - price1
  const percentChange = (difference / price1) * 100

  return {
    difference: Math.round(difference * 100) / 100,
    percentChange: Math.round(percentChange * 100) / 100,
  }
}
