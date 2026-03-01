import PriceComparison from '@/app/components/PriceComparison'
import SearchProducts from '@/app/components/SearchProducts'
import PopularProducts from '@/app/components/PopularProducts'

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Price Scraper</h1>
        <p className="text-lg opacity-90">
          Compare product prices across multiple grocery websites and find the best deals
        </p>
        <div className="mt-6 flex gap-4">
          <div className="bg-blue-500 bg-opacity-30 rounded-lg p-4">
            <div className="text-2xl font-bold">2</div>
            <div className="text-sm">Websites Compared</div>
          </div>
          <div className="bg-blue-500 bg-opacity-30 rounded-lg p-4">
            <div className="text-2xl font-bold">100+</div>
            <div className="text-sm">Products</div>
          </div>
        </div>
      </div>

      {/* Popular Products Section */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Products</h2>
        <PopularProducts />
      </div>

      {/* Quick Search */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Search</h2>
        <SearchProducts />
      </div>

      {/* Price Comparison Section */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare Milk Prices</h2>
        <PriceComparison />
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="text-3xl mb-3">🏪</div>
          <h3 className="font-bold text-lg mb-2">Imtiaz Super Market</h3>
          <p className="text-gray-600 text-sm">
            Shop.imtiaz.com.pk &mdash; One of Pakistan&apos;s largest grocery chains
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="text-3xl mb-3">🛒</div>
          <h3 className="font-bold text-lg mb-2">Chase Up Grocery</h3>
          <p className="text-gray-600 text-sm">
            Chaseupgrocery.com &mdash; Online grocery delivery service
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="text-3xl mb-3">💡</div>
          <h3 className="font-bold text-lg mb-2">Save Money</h3>
          <p className="text-gray-600 text-sm">
            Find the best prices and save on your grocery shopping
          </p>
        </div>
      </div>
    </div>
  )
}
