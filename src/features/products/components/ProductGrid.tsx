import React, { useEffect, useMemo, useRef, useState } from 'react'
import useProductsStore from '../store/useProductsStore'
import { Product } from '../../../types'
import ProductCard from './ProductCard'
import SearchBar from './SearchBar'
import Controls from './Controls'
import { subscribeServerUpdates } from '../../../api/products'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LoadingSkeleton from './LoadingSkeleton'

export default function ProductGrid() {
  const loadProducts = useProductsStore((s) => s.loadProducts)
  const present = useProductsStore((s) => s.present)
  const loading = useProductsStore((s) => s.loading)
  const searchQuery = useProductsStore((s) => s.searchQuery)
  const setSearch = useProductsStore((s) => s.setSearch)
  const selectedCategory = useProductsStore((s) => s.selectedCategory)
  const setCategoryFilter = useProductsStore((s) => s.setCategoryFilter)
  const sortOption = useProductsStore((s) => s.sortOption)
  const setSort = useProductsStore((s) => s.setSort)
  const editCategory = useProductsStore((s) => s.editCategory)
  const undo = useProductsStore((s) => s.undo)
  const redo = useProductsStore((s) => s.redo)
  const pending = useProductsStore((s) => s.pending)
  const applyServerPatch = useProductsStore((s) => s.applyServerPatch)
  const canUndo = useProductsStore((s) => s.canUndo())
  const canRedo = useProductsStore((s) => s.canRedo())

  const lastLiveToastAt = useRef(0)
  const [liveUpdateCount, setLiveUpdateCount] = useState(0)

  useEffect(() => { loadProducts() }, [loadProducts])

  useEffect(() => {
    const unsub = subscribeServerUpdates((patch) => {
      applyServerPatch(patch)
      setLiveUpdateCount((count) => count + 1)
      const now = Date.now()
      if (now - lastLiveToastAt.current > 15000) {
        lastLiveToastAt.current = now
        toast.info('Live updates are being applied in the background')
      }
    })
    return unsub
  }, [applyServerPatch])

  const categories = useMemo(() => Array.from(new Set(present.map((p) => p.category))), [present])

  const filtered = useMemo(() => {
    let list = present
    if (searchQuery) list = list.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    if (selectedCategory) list = list.filter((p) => p.category === selectedCategory)
    if (sortOption) {
      const { key, dir } = sortOption
      list = [...list].sort((a, b) => {
        const av = key === 'price' ? a.price : a.rating?.rate ?? 0
        const bv = key === 'price' ? b.price : b.rating?.rate ?? 0
        return dir === 'asc' ? av - bv : bv - av
      })
    }
    return list
  }, [present, searchQuery, selectedCategory, sortOption])

  const renderEmpty = () => {
    if (loading) return <LoadingSkeleton />
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 mt-6">
        No products match your search or filter.
      </div>
    )
  }

  const handleEditCategory = (id: number, cat: string) => {
    editCategory(id, cat)
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls Row */}
      <div className="controls-bar">
        <div className="search-section">
          <SearchBar value={searchQuery} onChange={setSearch} />
        </div>
        <Controls
          categories={categories}
          selectedCategory={selectedCategory}
          sortOption={sortOption}
          onCategoryChange={setCategoryFilter}
          onSortChange={setSort}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        renderEmpty()
      ) : (
        <div className="product-grid">
          {filtered.map((p: Product) => (
            <ProductCard
              key={p.id}
              product={p}
              onEdit={handleEditCategory}
              pending={!!pending[p.id]}
            />
          ))}
        </div>
      )}

      {/* Results counter */}
      <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-200">
        <span>
          Showing {filtered.length} of {present.length} products
        </span>
        {liveUpdateCount > 0 && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 font-medium">
            {liveUpdateCount} live updates
          </span>
        )}
      </div>

      {/* Toast container for notifications */}
      <ToastContainer position="top-right" />
    </div>
  )
}
