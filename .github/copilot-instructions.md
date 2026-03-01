# Price Scraper - Project Instructions

## Project Overview
Price Scraper is a full-stack web application that compares product prices between Imtiaz Super Market (shop.imtiaz.com.pk) and Chase Up Grocery (chaseupgrocery.com).

## Technology Stack
- **Frontend**: Next.js 14 with React 18 and TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with localStorage persistence
- **Icons**: Lucide React

## Features
1. **Dashboard**: Overview of available products and quick statistics
2. **Price Comparison**: Side-by-side price comparison of products from both websites
3. **Product Search**: Search for specific products across all websites
4. **Local Storage Integration**: Persistent state management with `persist:root` key
5. **Stock Status**: Real-time availability information
6. **Product Ratings**: Customer ratings for each product

## LocalStorage Structure
The application uses Zustand with localStorage persistence. The key is `persist:root` and contains:
- Branch status and location information
- Current city and branch
- Order type and language settings
- Shopping cart data
- Order total and payment information

## Installation & Setup

### Prerequisites
- Node.js 18+ or higher
- npm or yarn package manager

### Installation Steps
1. Navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file (optional for development):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

### Running the Application

#### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

#### Production Build
```bash
npm run build
npm start
```

## Project Structure
```
price-scrapper/
├── app/
│   ├── api/                 # API routes (if needed)
│   ├── components/          # React components
│   │   ├── Navigation.tsx
│   │   ├── PriceComparison.tsx
│   │   └── SearchProducts.tsx
│   ├── lib/                 # Utility functions
│   │   └── priceScraper.ts  # Price fetching & comparison logic
│   ├── store/               # Zustand store
│   │   └── useStore.ts      # Global state management
│   ├── comparison/          # Comparison page
│   ├── search/              # Search page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

## Key Components

### Navigation Component
Provides navigation between:
- Dashboard (/)
- Price Comparison (/comparison)
- Search Products (/search)

### Price Comparison Component
Displays side-by-side price comparisons with:
- Price differences
- Percentage changes
- Stock status
- Product ratings

### Search Products Component
Allows users to search for specific products across all websites

### Price Scraper Library
Mock implementation of price fetching:
- `fetchImtiazPrices()`: Fetch prices from Imtiaz
- `fetchChaseupPrices()`: Fetch prices from Chase Up
- `fetchAllPrices()`: Fetch from both websites
- `calculatePriceDifference()`: Calculate price variations

### Zustand Store
Global state management with features:
- Branch and location management
- Shopping cart functionality
- User preferences (language, payment type)
- Cart calculations

## Future Enhancements
1. Integration with real scraping APIs
2. User authentication
3. Wishlist functionality
4. Price history and trends
5. Discount and coupon information
6. Real-time inventory updates
7. Payment gateway integration
8. Order history and management

## Notes
- The current implementation uses mock data for demonstration
- To integrate real data, replace the mock data in `priceScraper.ts` with actual API calls
- Handle CORS issues when scraping external websites
- Consider using proper web scraping libraries (Puppeteer, Cheerio) for production

## License
Private Project - All Rights Reserved
