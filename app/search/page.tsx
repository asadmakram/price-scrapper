import SearchProducts from '@/app/components/SearchProducts'

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Products</h1>
        <SearchProducts />
      </div>
    </div>
  )
}
