import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

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

interface ApiDish {
  id: number
  name: string
  brand_name: string
  price: string
  discount_price: string
  img_url: string
  availability: number
  dish_branch_status?: {
    price: string
    discount_price: string
  }
}

// Mock data for fallback
const mockImtiazProducts: Product[] = [
  {
    id: 'imtiaz-1',
    name: 'Pepsi Soft Drink Pet Bottle 2.25Ltr',
    price: 776,
    website: 'Imtiaz Super Market',
    image: 'https://via.placeholder.com/200',
    url: 'https://shop.imtiaz.com.pk/product/1',
    inStock: true,
    rating: 4.5,
  },
  {
    id: 'imtiaz-2',
    name: 'Coca Cola Soft Drink Pet Bottle 2.25Ltr',
    price: 776,
    website: 'Imtiaz Super Market',
    image: 'https://via.placeholder.com/200',
    url: 'https://shop.imtiaz.com.pk/product/2',
    inStock: true,
    rating: 4.4,
  },
  {
    id: 'imtiaz-3',
    name: 'Sprite Lemon Lime 1.5L',
    price: 450,
    website: 'Imtiaz Super Market',
    image: 'https://via.placeholder.com/200',
    url: 'https://shop.imtiaz.com.pk/product/3',
    inStock: true,
    rating: 4.3,
  },
  {
    id: 'imtiaz-4',
    name: 'Evian Drinking Water 1.5L',
    price: 200,
    website: 'Imtiaz Super Market',
    image: 'https://via.placeholder.com/200',
    url: 'https://shop.imtiaz.com.pk/product/4',
    inStock: true,
    rating: 4.6,
  },
  {
    id: 'imtiaz-5',
    name: 'Desi Ghee 1KG',
    price: 1850,
    website: 'Imtiaz Super Market',
    image: 'https://via.placeholder.com/200',
    url: 'https://shop.imtiaz.com.pk/product/5',
    inStock: true,
    rating: 4.7,
  },
]

const mockChaseupProducts: Product[] = [
  {
    id: 'chaseup-1',
    name: 'Pepsi Soft Drink Pet Bottle 2.25Ltr',
    price: 780,
    website: 'Chase Up Grocery',
    image: 'https://via.placeholder.com/200',
    url: 'https://www.chaseupgrocery.com/product/1',
    inStock: true,
    rating: 4.4,
  },
  {
    id: 'chaseup-2',
    name: 'Coca Cola Soft Drink Pet Bottle 2.25Ltr',
    price: 780,
    website: 'Chase Up Grocery',
    image: 'https://via.placeholder.com/200',
    url: 'https://www.chaseupgrocery.com/product/2',
    inStock: true,
    rating: 4.5,
  },
  {
    id: 'chaseup-3',
    name: 'Sprite Lemon Lime 1.5L',
    price: 460,
    website: 'Chase Up Grocery',
    image: 'https://via.placeholder.com/200',
    url: 'https://www.chaseupgrocery.com/product/3',
    inStock: true,
    rating: 4.2,
  },
  {
    id: 'chaseup-4',
    name: 'Evian Drinking Water 1.5L',
    price: 210,
    website: 'Chase Up Grocery',
    image: 'https://via.placeholder.com/200',
    url: 'https://www.chaseupgrocery.com/product/4',
    inStock: true,
    rating: 4.5,
  },
  {
    id: 'chaseup-5',
    name: 'Desi Ghee 1KG',
    price: 1900,
    website: 'Chase Up Grocery',
    image: 'https://via.placeholder.com/200',
    url: 'https://www.chaseupgrocery.com/product/5',
    inStock: true,
    rating: 4.6,
  },
]

const mockMetroProducts: Product[] = [
  {
    id: 'metro-1',
    name: 'Pepsi Soft Drink Pet Bottle 2.25Ltr',
    price: 775,
    website: 'Metro Online',
    image: 'https://via.placeholder.com/200',
    url: 'https://www.metro-online.pk/product/1',
    inStock: true,
    rating: 4.5,
  },
  {
    id: 'metro-2',
    name: 'Coca Cola Soft Drink Pet Bottle 2.25Ltr',
    price: 775,
    website: 'Metro Online',
    image: 'https://via.placeholder.com/200',
    url: 'https://www.metro-online.pk/product/2',
    inStock: true,
    rating: 4.6,
  },
  {
    id: 'metro-3',
    name: 'Sprite Lemon Lime 1.5L',
    price: 455,
    website: 'Metro Online',
    image: 'https://via.placeholder.com/200',
    url: 'https://www.metro-online.pk/product/3',
    inStock: true,
    rating: 4.4,
  },
  {
    id: 'metro-4',
    name: 'Evian Drinking Water 1.5L',
    price: 205,
    website: 'Metro Online',
    image: 'https://via.placeholder.com/200',
    url: 'https://www.metro-online.pk/product/4',
    inStock: true,
    rating: 4.5,
  },
  {
    id: 'metro-5',
    name: 'Desi Ghee 1KG',
    price: 1875,
    website: 'Metro Online',
    image: 'https://via.placeholder.com/200',
    url: 'https://www.metro-online.pk/product/5',
    inStock: true,
    rating: 4.7,
  },
]

// Imtiaz API - uses same platform as Chase Up
async function fetchImtiazProducts(searchQuery?: string): Promise<Product[]> {
  try {
    const params = {
      restId: '55126',
      rest_brId: '54940',
      delivery_type: '0',
      source: '',
      search: searchQuery || '',
      sort_by: '',
      sort: '',
      page_no: '1',
      per_page: '24',
      start: '0',
      limit: '24',
    }

    const queryString = new URLSearchParams(params).toString()
    const url = `https://shop.imtiaz.com.pk/api/search-dish?${queryString}`

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        'app-name': 'imtiazsuperstore',
        'rest-id': '55126',
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'referer': 'https://shop.imtiaz.com.pk/search',
      },
      timeout: 10000,
    })

    const dishes = response.data?.data || []

    return dishes.map((dish: ApiDish) => {
      // Use discount_price if available, otherwise use regular price
      const priceStr = dish.discount_price && dish.discount_price !== '0.00' ? dish.discount_price : dish.price
      const price = parseFloat(priceStr) || 0

      return {
        id: `imtiaz-${dish.id}`,
        name: dish.name,
        price,
        website: 'Imtiaz Super Market',
        image: dish.img_url,
        url: `https://shop.imtiaz.com.pk/product/${dish.id}`,
        inStock: price > 0,
        rating: 4.5,
      }
    })
  } catch (error) {
    console.error('Failed to fetch from Imtiaz API:', error)
    return mockImtiazProducts
  }
}

// Chase Up API - different endpoint and credentials than Imtiaz
async function fetchChaseUpProducts(searchQuery?: string): Promise<Product[]> {
  try {
    const params = {
      restId: '55525',
      rest_brId: '56119',
      delivery_type: '0',
      source: '',
      search: searchQuery || '',
      sort_by: '',
      sort: '',
      page_no: '1',
      per_page: '24',
      start: '0',
      limit: '24',
    }

    const queryString = new URLSearchParams(params).toString()
    const url = `https://www.chaseupgrocery.com/api/search-dish-v2?${queryString}`

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        'app-name': 'chaseup',
        'rest-id': '55525',
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,la;q=0.8',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'timezone': 'Asia/Karachi',
        'referer': 'https://www.chaseupgrocery.com/search',
      },
      timeout: 10000,
    })

    const dishes = response.data?.data?.dishes || []

    return dishes.map((dish: ApiDish) => {
      // Use discount_price if available, otherwise use regular price
      const priceStr = dish.discount_price && dish.discount_price !== '0.00' && dish.discount_price !== '0.000' ? dish.discount_price : dish.price
      const price = parseFloat(priceStr) || 0

      return {
        id: `chaseup-${dish.id}`,
        name: dish.name,
        price,
        website: 'Chase Up Grocery',
        image: dish.img_url,
        url: `https://www.chaseupgrocery.com/product/${dish.id}`,
        inStock: price > 0,
        rating: 4.5,
      }
    })
  } catch (error) {
    console.error('Failed to fetch from Chase Up API:', error)
    return mockChaseupProducts
  }
}

// Metro Online API
interface MetroProduct {
  id: number
  name: string
  price: number
  image?: string
  url?: string
  inStock?: boolean
}

async function fetchMetroProducts(searchQuery?: string): Promise<Product[]> {
  try {
    // Build the URL with filters based on the curl command provided
    // Note: Metro API uses multiple filter/filterValue pairs, so we need to build URL manually
    const baseUrl = 'https://admin.metro-online.pk/api/read/Products'
    const params: string[] = [
      'type=Products_nd_associated_Brands',
      'order=product_scoring__DESC',
      'filter=promotion_tier2_id',
      'filterValue=10636',
      'offset=0',
      'limit=12',
      'filter=active',
      'filterValue=true',
      'filter=storeId',
      'filterValue=10',
      'filter=!url',
      'filterValue=!null',
      'filter=Op.available_stock',
      'filterValue=Op.gt__0',
    ]

    // Add search query if provided
    if (searchQuery) {
      params.push(`filter=name`)
      params.push(`filterValue=Op.like__${encodeURIComponent(searchQuery)}`)
    }

    const url = `${baseUrl}?${params.join('&')}`

    const response = await axios.get(url, {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,la;q=0.8',
        'cache-control': 'no-cache',
        'origin': 'https://www.metro-online.pk',
        'pragma': 'no-cache',
        'referer': 'https://www.metro-online.pk/',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    })

    const products = response.data?.data || []

    return products.map((product: any) => {
      const price = parseFloat(product.price) || parseFloat(product.sale_price) || 0
      const image = product.image_url || product.img_url || product.image
      const productUrl = product.url || `https://www.metro-online.pk/product/${product.id}`

      return {
        id: `metro-${product.id}`,
        name: product.name || product.product_name || 'Unknown Product',
        price,
        website: 'Metro Online',
        image,
        url: productUrl,
        inStock: product.available_stock > 0 || product.in_stock === true,
        rating: 4.5,
      }
    })
  } catch (error) {
    console.error('Failed to fetch from Metro API:', error)
    return mockMetroProducts
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const source = searchParams.get('source') || 'all'
    const query = searchParams.get('q') || ''

    let products: Product[] = []

    if (source === 'imtiaz' || source === 'all') {
      const imtiazProducts = await fetchImtiazProducts(query)
      products = [...products, ...imtiazProducts]
    }

    if (source === 'chaseup' || source === 'all') {
      const chaseupProducts = await fetchChaseUpProducts(query)
      products = [...products, ...chaseupProducts]
    }

    if (source === 'metro' || source === 'all') {
      const metroProducts = await fetchMetroProducts(query)
      products = [...products, ...metroProducts]
    }

    return NextResponse.json({
      products,
      count: products.length,
      status: 'success',
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        products: [],
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
