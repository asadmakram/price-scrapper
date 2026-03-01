# Price Scraper - Setup & Usage Guide

## 🎯 Project Overview

This is a **full-stack price comparison web application** that compares product prices between:
- **Imtiaz Super Market** (shop.imtiaz.com.pk)
- **Chase Up Grocery** (chaseupgrocery.com)

Built with Next.js, React, TypeScript, Tailwind CSS, and Zustand for state management.

---

## 📋 What's Included

### ✅ Frontend
- **Next.js 14** with React 18 and TypeScript
- **Responsive UI** with Tailwind CSS
- **3 Main Pages**:
  - Dashboard (/) - Overview with quick search
  - Price Comparison (/comparison) - Side-by-side price comparisons
  - Search Products (/search) - Advanced product search

### ✅ Backend/API
- Mock price fetching from both websites
- Real-time price comparison logic
- Stock status and rating information

### ✅ State Management
- **Zustand** with localStorage persistence
- Key: `persist:root`
- Stores: branch info, cart, user preferences, language settings

### ✅ Components
- **Navigation** - Site-wide navigation
- **PriceComparison** - Displays price differences with trends
- **SearchProducts** - Search functionality with filters
- **Dashboard** - Statistics and overview

---

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment (Optional)
```bash
# Copy example environment file
cp .env.example .env.local

# The file already has default values configured
```

### Step 3: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎮 Using the Application

### Dashboard (Home Page)
- View welcome message and statistics
- Quick search bar to find products
- Overview of all products with prices
- Information about integrated websites

### Price Comparison Page
- Automatic side-by-side comparison of products
- View price differences
- See percentage changes (marked with ↑ or ↓)
- Stock availability status
- Product ratings from customers

### Search Products Page
- Search for specific products
- Filter across all websites
- Instant results with pricing
- Stock status for each product

---

## 💾 Local Storage Structure

The application automatically saves data to localStorage with key `persist:root`:

```json
{
  "branchStatus": {
    "name": "F",
    "interval": 37425602,
    "isOpen": true,
    "message": "Welcome!"
  },
  "orderType": "GLOBAL",
  "currentCity": {
    "id": 31594,
    "name": "Karachi",
    "geofences": [...]
  },
  "currentBranchId": 54940,
  "currentLang": "en",
  "cartItems": [],
  "cartQuantity": 0,
  "paymentType": "COD"
}
```

---

## 📁 Project Structure

```
price-scrapper/
├── app/
│   ├── api/                    # API routes (for future use)
│   ├── components/
│   │   ├── Navigation.tsx      # Top navigation bar
│   │   ├── PriceComparison.tsx # Price comparison display
│   │   └── SearchProducts.tsx  # Product search component
│   ├── lib/
│   │   └── priceScraper.ts     # Mock data and price logic
│   ├── store/
│   │   └── useStore.ts         # Zustand state management
│   ├── comparison/
│   │   └── page.tsx            # Comparison page
│   ├── search/
│   │   └── page.tsx            # Search page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── public/                     # Static assets
├── .vscode/
│   └── tasks.json              # VS Code tasks for dev/build
├── .github/
│   └── copilot-instructions.md # Project instructions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── .eslintrc.json
└── README.md
```

---

## 🔧 Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

---

## 🎨 Key Features

### 1. Price Comparison
- Displays products from both websites
- Calculates price differences
- Shows percentage changes
- Color-coded for easier reading

### 2. Product Search
- Search by product name
- Real-time results
- Shows prices from all sources
- Stock availability information

### 3. State Management
- All user preferences saved to localStorage
- Branch and location information
- Shopping cart functionality
- Language preferences

### 4. Responsive Design
- Works on desktop and mobile
- Tailwind CSS for styling
- Lucide React icons

---

## 📊 Mock Data

The application comes with sample data for demonstration:

| Product | Imtiaz Price | Chase Up Price |
|---------|--------------|----------------|
| Wheat Flour 10kg | Rs. 850 | Rs. 820 |
| Rice Basmati 5kg | Rs. 1,200 | Rs. 1,150 |
| Cooking Oil 1L | Rs. 450 | Rs. 480 |
| Sugar 2kg | Rs. 380 | Rs. 400 |
| Tea Leaves 500g | Rs. 320 | Rs. 340 |
| Milk 1L (Fresh) | Rs. 180 | Rs. 200 |

---

## 🔄 Customization

### Add More Products
Edit [app/lib/priceScraper.ts](app/lib/priceScraper.ts):
```typescript
const imtiazProducts: Product[] = [
  {
    id: 'imtiaz-new',
    name: 'Your Product Name',
    price: 1000,
    website: 'Imtiaz Super Market',
    inStock: true,
    rating: 4.5,
  },
  // ... more products
]
```

### Integrate Real APIs
Replace mock data in `priceScraper.ts` with actual API calls:
```typescript
export async function fetchImtiazPrices(searchQuery?: string) {
  const response = await fetch('https://shop.imtiaz.com.pk/api/products')
  return response.json()
}
```

### Change Styling
Modify [tailwind.config.ts](tailwind.config.ts) for custom theme colors and styles.

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel
```

### Deploy to Other Platforms
- **Netlify**: Supports Next.js
- **Docker**: Create Dockerfile for containerization
- **AWS/GCP/Azure**: Use respective deployment tools

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Clear Cache
```bash
# Clear .next build cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### LocalStorage Not Persisting
- Check browser DevTools (F12 → Application → Local Storage)
- Verify `persist:root` key exists
- Clear cache and try again

---

## 📚 Dependencies

- **next** (14.0+) - React framework
- **react** (18.2+) - UI library
- **zustand** (4.4+) - State management
- **tailwindcss** (3.3+) - CSS framework
- **lucide-react** (0.263+) - Icons
- **axios** (1.6+) - HTTP client

---

## 🔒 Security Notes

- Mock data is for demonstration only
- Do not expose API keys in client-side code
- Use environment variables for sensitive data
- Validate all user inputs before processing
- Handle CORS properly when integrating real APIs

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📝 Future Enhancements

- [ ] Real API integration for live price data
- [ ] User authentication and accounts
- [ ] Price history and trend charts
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Payment gateway integration
- [ ] Order tracking system
- [ ] Mobile app version
- [ ] Discount and coupon management
- [ ] Advanced filtering and sorting

---

## 💬 Support

For issues or questions:
1. Check existing GitHub issues
2. Review documentation
3. Check console logs (F12)
4. Clear cache and restart

---

## 📄 License

Private Project - All Rights Reserved

**Created**: March 1, 2026
**Version**: 1.0.0
