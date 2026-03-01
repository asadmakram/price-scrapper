# 🚀 Quick Start Guide

## 30 Second Setup

```bash
# 1. Dependencies already installed
# 2. Run the app
npm run dev

# 3. Open browser
# http://localhost:3000
```

Done! 🎉

---

## 📖 What You'll See

### Home Page (`/`)
- Welcome banner with stats
- Quick product search
- Price comparison overview
- Partner website info

### Price Comparison (`/comparison`)
- Imtiaz vs Chase Up side-by-side
- Price differences with trends
- Stock status and ratings

### Search (`/search`)
- Find products across websites
- Real-time results
- Complete pricing info

---

## 🔑 Key Features

✅ **Price Comparison** - See which store is cheaper  
✅ **Product Search** - Find items fast  
✅ **Stock Status** - Know availability  
✅ **Ratings** - See customer feedback  
✅ **Responsive** - Works on mobile & desktop  
✅ **Local Storage** - Data persists  

---

## 📁 Project Files

**Main Components** (UI):
- `app/components/Navigation.tsx` - Top menu
- `app/components/PriceComparison.tsx` - Price display
- `app/components/SearchProducts.tsx` - Search feature

**Logic**:
- `app/lib/priceScraper.ts` - Price fetching
- `app/store/useStore.ts` - State management

**Pages**:
- `app/page.tsx` - Home
- `app/comparison/page.tsx` - Comparisons
- `app/search/page.tsx` - Search

---

## 📊 Sample Data

6 products from both websites:
- Wheat Flour
- Rice Basmati
- Cooking Oil
- Sugar
- Tea Leaves
- Fresh Milk

Edit mock data in `app/lib/priceScraper.ts` to add more.

---

## 🛠️ Available Commands

```bash
npm run dev       # Development server (http://localhost:3000)
npm run build     # Build for production
npm start         # Run production build
npm run lint      # Check code quality
```

---

## 💾 LocalStorage Data

Auto-saved with key: `persist:root`

Contains:
- Branch & city info
- Shopping cart
- User preferences
- Language settings
- Payment type

Check in DevTools: `F12 → Application → Local Storage`

---

## 🔗 Next Steps

### To Add Real Data
1. Edit `app/lib/priceScraper.ts`
2. Replace mock functions with API calls
3. Update product arrays with real data
4. See `API_INTEGRATION_GUIDE.md` for details

### To Customize
- Colors: Edit `tailwind.config.ts`
- Layout: Modify component files
- Logic: Update lib files

### To Deploy
```bash
npm run build    # Build app
npm start        # Test production
# Deploy to Vercel, Netlify, or your server
```

---

## ❓ Help

- **Errors?** Check console: `F12 → Console`
- **Docs?** Read `README.md` or `SETUP_GUIDE.md`
- **Integration?** See `API_INTEGRATION_GUIDE.md`
- **Issues?** Clear cache and restart

---

**Happy coding! 🚀**

Created: March 1, 2026
