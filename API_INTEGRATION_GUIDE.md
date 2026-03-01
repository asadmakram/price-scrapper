# API & Integration Guide

## Current State: Mock Data Implementation

The application currently uses **mock data** for demonstration purposes. Here's how the price fetching works:

### Mock Data Files

**Location**: `app/lib/priceScraper.ts`

This file contains:
1. **Product Interfaces**
   ```typescript
   interface Product {
     id: string
     name: string
     price: number
     website: string
     image?: string
     url?: string
     inStock: boolean
     rating?: number
   }
   ```

2. **Mock Datasets**
   - `imtiazProducts` - 6 products from Imtiaz
   - `chaseupProducts` - 6 products from Chase Up

3. **Mock Functions**
   - `fetchImtiazPrices(searchQuery?)` - Returns mock Imtiaz products
   - `fetchChaseupPrices(searchQuery?)` - Returns mock Chase Up products
   - `fetchAllPrices(searchQuery?)` - Returns combined products
   - `calculatePriceDifference(price1, price2)` - Calculates differences

---

## Integration: Real API Implementation

### Step 1: Identify API Endpoints

**Imtiaz Super Market**
- Base URL: `https://shop.imtiaz.com.pk/api`
- Typical endpoints:
  - `/products` - List all products
  - `/products/search?q={query}` - Search products
  - `/products/{id}` - Get product details
  - `/prices` - Get current prices

**Chase Up Grocery**
- Base URL: `https://chaseupgrocery.com/api`
- Typical endpoints:
  - `/products` - List all products
  - `/products/search?q={query}` - Search products
  - `/products/{id}` - Get product details

### Step 2: Update Mock Functions

Replace the mock implementations in `app/lib/priceScraper.ts`:

```typescript
import axios from 'axios'

export async function fetchImtiazPrices(searchQuery?: string): Promise<Product[]> {
  try {
    const url = searchQuery
      ? `https://shop.imtiaz.com.pk/api/products/search?q=${searchQuery}`
      : `https://shop.imtiaz.com.pk/api/products`

    const response = await axios.get(url)
    
    // Transform API response to Product format
    return response.data.products.map((item: any) => ({
      id: item.id,
      name: item.productName,
      price: item.price,
      website: 'Imtiaz Super Market',
      image: item.imageUrl,
      inStock: item.availability,
      rating: item.rating,
    }))
  } catch (error) {
    console.error('Failed to fetch Imtiaz prices:', error)
    return []
  }
}

export async function fetchChaseupPrices(searchQuery?: string): Promise<Product[]> {
  try {
    const url = searchQuery
      ? `https://chaseupgrocery.com/api/products/search?q=${searchQuery}`
      : `https://chaseupgrocery.com/api/products`

    const response = await axios.get(url)
    
    return response.data.results.map((item: any) => ({
      id: item.productId,
      name: item.name,
      price: item.currentPrice,
      website: 'Chase Up Grocery',
      image: item.imageUrl,
      inStock: item.inStock,
      rating: item.customerRating,
    }))
  } catch (error) {
    console.error('Failed to fetch Chase Up prices:', error)
    return []
  }
}
```

### Step 3: Handle CORS Issues

If you encounter CORS errors, create a backend proxy:

**Option A: Use Next.js API Routes**

Create `app/api/products/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const source = searchParams.get('source') // 'imtiaz' or 'chaseup'

  try {
    let url: string

    if (source === 'imtiaz') {
      url = query
        ? `https://shop.imtiaz.com.pk/api/products/search?q=${query}`
        : `https://shop.imtiaz.com.pk/api/products`
    } else {
      url = query
        ? `https://chaseupgrocery.com/api/products/search?q=${query}`
        : `https://chaseupgrocery.com/api/products`
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0...',
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
```

Then update the fetch functions:
```typescript
export async function fetchImtiazPrices(searchQuery?: string): Promise<Product[]> {
  const response = await fetch(
    `/api/products?source=imtiaz&q=${searchQuery || ''}`
  )
  const data = await response.json()
  // Transform and return...
}
```

**Option B: Use a Web Scraping Service**

Use services like:
- **ScrapingAPI**: `https://www.scrapingapi.com`
- **RapidAPI**: Web scraping endpoints
- **Crawlbase**: Proxy for web scraping

### Step 4: Add Error Handling

```typescript
export async function fetchImtiazPrices(searchQuery?: string): Promise<Product[]> {
  try {
    // ... fetch logic ...
    return products
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 429) {
        console.error('Rate limited by Imtiaz')
      } else if (error.response?.status === 403) {
        console.error('Access forbidden (CORS or authentication)')
      }
    }
    throw error
  }
}
```

### Step 5: Add Caching

```typescript
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 600 }) // 10 minute cache

export async function fetchImtiazPrices(searchQuery?: string): Promise<Product[]> {
  const cacheKey = `imtiaz_${searchQuery || 'all'}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached) return cached as Product[]

  // Fetch if not in cache
  const products = await fetchFromAPI()
  
  // Store in cache
  cache.set(cacheKey, products)
  
  return products
}
```

---

## Database Integration (Optional)

If you want to store price history for trends:

### Setup with Prisma + PostgreSQL

1. **Install dependencies**:
   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

2. **Initialize Prisma**:
   ```bash
   npx prisma init
   ```

3. **Define Schema** (`prisma/schema.prisma`):
   ```prisma
   model Product {
     id        Int     @id @default(autoincrement())
     name      String
     imtiazPrice    Float?
     chaseupPrice   Float?
     imtiazStock    Boolean?
     chaseupStock   Boolean?
     timestamp DateTime @default(now())
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

4. **Migrate**:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Create API Route**:
   ```typescript
   // app/api/price-history/route.ts
   import { prisma } from '@/lib/prisma'
   
   export async function POST(request: Request) {
     const { productName, imtiazPrice, chaseupPrice } = await request.json()
     
     const record = await prisma.product.create({
       data: {
         name: productName,
         imtiazPrice,
         chaseupPrice,
       },
     })
     
     return Response.json(record)
   }
   ```

---

## Testing APIs

### Using Postman

1. Import API collection
2. Test each endpoint
3. Save response examples
4. Document authentication requirements

### Using cURL

```bash
# Test Imtiaz API
curl "https://shop.imtiaz.com.pk/api/products" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Accept: application/json"

# Test Chase Up API
curl "https://chaseupgrocery.com/api/products" \
  -H "User-Agent: Mozilla/5.0"
```

### Using Insomnia

- Import the endpoints
- Test headers and authentication
- Document response schemas

---

## Rate Limiting & Best Practices

1. **Add delays between requests**:
   ```typescript
   const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
   
   export async function fetchAllPrices() {
     const [imtiaz] = await Promise.all([
       fetchImtiazPrices(),
       (async () => {
         await delay(1000) // 1 second delay
         return fetchChaseupPrices()
       })(),
     ])
   }
   ```

2. **Implement exponential backoff**:
   ```typescript
   async function fetchWithRetry(url: string, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fetch(url)
       } catch (error) {
         if (i === maxRetries - 1) throw error
         await delay(1000 * Math.pow(2, i))
       }
     }
   }
   ```

3. **Monitor API usage**:
   - Log all API calls
   - Track error rates
   - Alert on rate limit hits

---

## Environment Variables

Update `.env.local`:
```env
# Imtiaz API
NEXT_PUBLIC_IMTIAZ_API_URL=https://shop.imtiaz.com.pk/api
IMTIAZ_API_KEY=your_key_here

# Chase Up API
NEXT_PUBLIC_CHASEUP_API_URL=https://chaseupgrocery.com/api
CHASEUP_API_KEY=your_key_here

# Proxy/Service
SCRAPING_API_KEY=your_key_here
```

---

## Troubleshooting Integration

| Issue | Solution |
|-------|----------|
| CORS Error | Use Next.js API route as proxy |
| 403 Forbidden | Add User-Agent header |
| Rate Limited | Implement delay and backoff |
| 404 Not Found | Verify endpoint URL is correct |
| Timeout | Increase request timeout |

---

## Future Enhancements

- [ ] Add product image caching
- [ ] Implement price alert notifications
- [ ] Add user-submitted price corrections
- [ ] Create price trend graphs
- [ ] Add competitor analysis
- [ ] Implement product recommendations
- [ ] Add barcode scanning

---

**Last Updated**: March 1, 2026
