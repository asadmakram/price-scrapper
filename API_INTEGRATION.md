# API Integration Guide - Real Product Data

## Overview
The Price Scraper now uses **actual API endpoints** from both Imtiaz Super Market and Chase Up Grocery instead of HTML scraping. Both websites use the same underlying platform, making price comparison seamless.

## API Architecture

### Endpoint Structure
Both Imtiaz and Chase Up use identical API structures:
```
GET /api/search-dish-v2?restId=55525&rest_brId=56119&delivery_type=0&search=pepsi&page_no=1&per_page=24
```

### Base URLs
- **Imtiaz**: `https://shop.imtiaz.com.pk/api/search-dish-v2`
- **Chase Up**: `https://www.chaseupgrocery.com/api/search-dish-v2`

### Query Parameters
| Parameter | Value | Description |
|-----------|-------|-------------|
| `restId` | `55525` | Restaurant/Store ID (same for both) |
| `rest_brId` | `56119` | Branch ID (same for both) |
| `delivery_type` | `0` | Delivery type |
| `search` | `{query}` | Product search term (e.g., "pepsi", "flour") |
| `page_no` | `1` | Page number for pagination |
| `per_page` | `24` | Items per page |
| `start` | `0` | Starting index |
| `limit` | `24` | Limit per request |

## Response Structure

### Successful Response
```json
{
  "status": 200,
  "msg": "success",
  "data": {
    "dishes": [
      {
        "id": 2723367,
        "name": "Pepsi Soft Drink Pet Bottle 2.25Ltr",
        "brand_name": "Pepsi",
        "price": "836.000",
        "discount_price": "776.000",
        "img_url": "https://g-cdn.blinkco.io/ordering-system/55525/gallery/...",
        "availability": 1,
        "dish_branch_status": {
          "id": 4398165,
          "restbrId": 56119,
          "dishId": 2723367,
          "price": "836.000",
          "discount_price": "760.000",
          "status": 1
        }
      }
      // ... more products
    ],
    "brands": [...],
    "sub_sections": [...]
  },
  "time_now": "2026-03-01 08:04:04"
}
```

## Key Fields Mapping

| API Field | Mapped To | Description |
|-----------|-----------|-------------|
| `id` | `Product.id` | Unique product identifier |
| `name` | `Product.name` | Product name/title |
| `img_url` | `Product.image` | Product image URL |
| `availability` | `Product.inStock` | Stock availability (1 = in stock) |
| `dish_branch_status.discount_price` | `Product.price` | Current price (with discount if available) |
| `dish_branch_status.price` | Fallback price | Branch-specific price |

## Implementation Details

### Price Selection Logic
```javascript
// Uses discount price if available, otherwise regular price
const branchStatus = dish.dish_branch_status
const priceStr = 
  branchStatus?.discount_price ||  // Branch discount price (preferred)
  branchStatus?.price ||            // Branch regular price
  dish.discount_price ||            // Global discount price
  dish.price                        // Global regular price
const price = parseFloat(priceStr) || 0
```

### Stock Status
- `availability === 1` AND `price > 0` = In Stock
- Otherwise = Out of Stock

### Product URLs
- **Imtiaz**: `https://shop.imtiaz.com.pk/product/{id}`
- **Chase Up**: `https://www.chaseupgrocery.com/product/{id}`

## Testing the API

### Test in Browser
1. Open browser and navigate to:
   ```
   http://localhost:3000/comparison
   ```

2. Open DevTools Console (F12 → Console)

3. Search for a product (e.g., "pepsi", "flour", "sugar")

4. Check console logs for:
   - API response times
   - Number of products fetched
   - Any error messages

### Test Directly with cURL
```bash
# Search for "pepsi" products
curl "http://localhost:3000/api/products?source=all&q=pepsi"

# Fetch only Imtiaz products
curl "http://localhost:3000/api/products?source=imtiaz"

# Fetch only Chase Up products
curl "http://localhost:3000/api/products?source=chaseup"
```

### Test with Node.js
```javascript
const response = await fetch('/api/products?source=all&q=pepsi')
const data = await response.json()
console.log(`Found ${data.count} products`)
console.log(data.products)
```

## API Response Format (Our Backend)

### GET `/api/products`

**Query Parameters:**
- `source`: `'imtiaz'` | `'chaseup'` | `'all'` (default: `'all'`)
- `q`: Search query string (optional)

**Successful Response (200):**
```json
{
  "products": [
    {
      "id": "imtiaz-2723367",
      "name": "Pepsi Soft Drink Pet Bottle 2.25Ltr",
      "price": 760,
      "website": "Imtiaz Super Market",
      "image": "https://g-cdn.blinkco.io/...",
      "url": "https://shop.imtiaz.com.pk/product/2723367",
      "inStock": true,
      "rating": 4.2
    }
  ],
  "count": 24,
  "status": "success"
}
```

**Error Response (500):**
```json
{
  "products": [],
  "error": "Failed to fetch products",
  "message": "Error details..."
}
```

## Performance Considerations

### Request Timing
- **Average Response**: 500-1500ms per API call
- **Timeout**: 10 seconds per request
- **Parallel Requests**: Both APIs called simultaneously using `Promise.all()`

### Data Caching (Optional Future Enhancement)
Currently not implemented, but can be added using:
- Redis (distributed caching)
- Node.js in-memory cache
- Database with TTL

## Troubleshooting

### No Products Returned
**Possible Causes:**
1. API endpoint is down
2. Search query doesn't match any products
3. Network connectivity issue
4. API rate limiting

**Solutions:**
1. Check API directly: `https://shop.imtiaz.com.pk/api/search-dish-v2?restId=55525&rest_brId=56119&search=pepsi`
2. Try different search terms
3. Check browser console for error messages
4. Verify internet connection

### Wrong Prices Displayed
**Possible Causes:**
1. Using wrong price field (discount vs regular)
2. Branch status not updated
3. Product has multiple prices for different branches

**Solutions:**
1. Check `dish_branch_status.discount_price` value
2. Verify `availability` field is set correctly
3. Review fallback logic in code

### API Response is Empty
**Possible Causes:**
1. Search term has no matches
2. API endpoint structure changed
3. Authentication required

**Solutions:**
1. Try popular products: "pepsi", "milk", "flour"
2. Check if websites updated their API
3. Test with browser DevTools Network tab

## Differences from Web Scraping

| Aspect | Web Scraping (Old) | API Integration (New) |
|--------|-------|--------|
| **Reliability** | Low (depends on HTML structure) | High (stable API) |
| **Speed** | Slow (parse HTML) | Fast (JSON response) |
| **Data Accuracy** | Inconsistent | Guaranteed |
| **Maintenance** | High (HTML changes break it) | Low (API rarely changes) |
| **Rate Limiting** | Yes | Less likely |
| **Authentication** | Not needed | Not needed |

## Future Enhancements

1. **Pagination Support**
   - Implement `page_no` parameter
   - Load more products on scroll

2. **Caching**
   - Cache API responses for 5-10 minutes
   - Reduce server load and improve response time

3. **Additional Filters**
   - Sort by price, rating, etc.
   - Filter by category (brands, sub_sections)

4. **Database Integration**
   - Store product history
   - Track price changes over time

5. **Real-time Updates**
   - Webhook integration for price changes
   - Inventory tracking

## Files Modified

- `app/api/products/route.ts` - API route with new implementation
- `app/lib/priceScraper.ts` - Client-side wrapper (fallback included)

## Need Help?

1. Check the Network tab in DevTools to inspect API responses
2. Review console logs for error messages
3. Test the API endpoint directly in the browser
4. Compare response with examples in this guide
