import PriceComparison from '@/app/components/PriceComparison'
import SearchProducts from '@/app/components/SearchProducts'
import PopularProducts from '@/app/components/PopularProducts'

export default function Home() {
  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600 text-white rounded-2xl p-10 shadow-2xl border-2 border-white/20">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
          Welcome to Price Scraper
        </h1>
        <p className="text-xl opacity-95 font-medium mb-6">
          Compare product prices across multiple grocery websites and find the best deals
        </p>
        <div className="mt-8 flex gap-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 border border-white/30 shadow-lg">
            <div className="text-3xl font-bold mb-1">3</div>
            <div className="text-sm font-semibold opacity-90">Websites Compared</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 border border-white/30 shadow-lg">
            <div className="text-3xl font-bold mb-1">100+</div>
            <div className="text-sm font-semibold opacity-90">Products</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 border border-white/30 shadow-lg">
            <div className="text-3xl font-bold mb-1">24/7</div>
            <div className="text-sm font-semibold opacity-90">Price Updates</div>
          </div>
        </div>
      </div>

      {/* Popular Products Section */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-6">
          Popular Products
        </h2>
        <PopularProducts />
      </div>

      {/* Quick Search */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-6">
          Quick Search
        </h2>
        <SearchProducts />
      </div>

      {/* Price Comparison Section */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-6">
          Compare Milk Prices
        </h2>
        <PriceComparison />
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="text-4xl mb-4">🏪</div>
          <h3 className="font-bold text-xl mb-3 text-blue-900">Imtiaz Super Market</h3>
          <p className="text-gray-700 text-sm font-medium leading-relaxed">
            Shop.imtiaz.com.pk &mdash; One of Pakistan&apos;s largest grocery chains with extensive product range
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 shadow-lg border-2 border-emerald-200 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="font-bold text-xl mb-3 text-emerald-900">Chase Up Grocery</h3>
          <p className="text-gray-700 text-sm font-medium leading-relaxed">
            Chaseupgrocery.com &mdash; Online grocery delivery service with competitive pricing
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="text-4xl mb-4">🏬</div>
          <h3 className="font-bold text-xl mb-3 text-purple-900">Metro Online</h3>
          <p className="text-gray-700 text-sm font-medium leading-relaxed">
            Metro-online.pk &mdash; Premium grocery shopping experience with quality products
          </p>
        </div>
      </div>
    </div>
  )
}
