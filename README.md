# Price Scraper - README

Price Scraper is a full-stack web application for comparing product prices between Imtiaz Super Market and Chase Up Grocery, two major online grocery providers in Pakistan.

## 🎯 Features

- **Price Comparison**: Compare prices side-by-side from multiple grocery websites
- **Product Search**: Search for specific products across all integrated websites
- **Stock Status**: Real-time inventory information
- **Product Ratings**: Community ratings for each product
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Storage Integration**: Persistent user preferences and shopping cart data
- **Fast Performance**: Optimized with Next.js and React

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
app/
├── components/          # Reusable React components
├── lib/                # Utility functions and helpers
├── store/              # Zustand state management
├── api/                # API routes
├── comparison/         # Price comparison page
├── search/             # Product search page
├── layout.tsx          # App layout
├── page.tsx            # Homepage
└── globals.css         # Global styles
```

## 🔑 Key Components

### Price Comparison
Displays real-time price comparisons between Imtiaz and Chase Up Grocery with:
- Side-by-side pricing
- Price difference calculations
- Percentage changes
- Stock availability

### Product Search
Search functionality to find products across all integrated websites with:
- Real-time search results
- Stock status
- Ratings and reviews
- Quick add to cart

### State Management
Zustand store with localStorage persistence:
- `persist:root` key for app state
- Branch and location management
- Shopping cart data
- User preferences

## 📊 Websites Included

- **Imtiaz Super Market** (shop.imtiaz.com.pk)
- **Chase Up Grocery** (chaseupgrocery.com)

## 🛠️ Build & Deploy

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## 💾 Local Storage Configuration

The app uses `persist:root` key with the following structure:

```json
{
  "state": {
    "branchStatus": {...},
    "orderType": "GLOBAL",
    "currentCity": {...},
    "currentBranchId": 54940,
    "currentLang": "en",
    "userAddress": null,
    "userLocation": null
  },
  "cart": {...},
  "_persist": {...}
}
```

## 🔧 Configuration Files

- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration
- `postcss.config.js` - PostCSS configuration
- `.eslintrc.json` - ESLint configuration

## 📦 Dependencies

- **next** - React framework
- **react** - UI library
- **zustand** - State management
- **tailwindcss** - CSS framework
- **lucide-react** - Icons
- **axios** - HTTP client

## 🚀 Future Improvements

- [ ] Real web scraping integration
- [ ] User authentication
- [ ] Wishlist functionality
- [ ] Price history charts
- [ ] Advanced filtering
- [ ] Payment integration
- [ ] Order tracking

## 📝 Notes

- This is a prototype with mock data
- Replace mock data with real APIs for production use
- Ensure proper CORS handling when scraping external websites
- Consider using Puppeteer or Cheerio for web scraping

## 👤 Author

Al-Hayat Software

## 📄 License

All rights reserved.
