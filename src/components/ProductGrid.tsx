import { useEffect, useMemo, useRef, useState } from 'react'
import useStore from '../store/useProductsStore'
import { Product } from '../types'
import SearchBar from './SearchBar'
import Controls from './Controls'
import Select from './Select'
import { subscribeServerUpdates } from '../api/products'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LoadingSkeleton from './LoadingSkeleton'

const CATEGORY_OPTIONS = ["men's clothing", "women's clothing", 'jewelery', 'electronics']

function ProductCard({ p, onEdit, pending }: { p: Product; onEdit: (id: number, category: string) => void; pending?: boolean }): JSX.Element {
  return (
    <article className={`group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${pending ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {p.image && <img src={p.image} alt={p.title} className="h-16 w-16 flex-none rounded-lg object-cover" />}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-slate-500">Product #{p.id}</p>
            <h3 className="mt-1 line-clamp-2 text-base font-semibold text-slate-900">{p.title}</h3>
          </div>
        </div>

        <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">${p.price.toFixed(2)}</div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{p.category}</span>
        <span className="font-medium text-slate-600">{p.rating?.rate ?? '-'} / 5</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
        <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Category</label>
        <Select options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))} value={p.category} onChange={(v) => onEdit(p.id, v)} disabled={!!pending} ariaLabel="Change category" />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>Reviews: {p.rating?.count ?? 0}</span>
        {pending ? <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Saving...</span> : null}
      </div>
    </article>
  )
}

export function ProductGrid(): JSX.Element {
  const loadProducts = useStore((s) => s.loadProducts)
  const present = useStore((s) => s.present)
  const loading = useStore((s) => s.loading)
  const searchQuery = useStore((s) => s.searchQuery)
  const setSearch = useStore((s) => s.setSearch)
  const selectedCategory = useStore((s) => s.selectedCategory)
  const setCategoryFilter = useStore((s) => s.setCategoryFilter)
  const sortOption = useStore((s) => s.sortOption)
  const setSort = useStore((s) => s.setSort)
  const editCategory = useStore((s) => s.editCategory)
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const pending = useStore((s) => s.pending)
  const applyServerPatch = useStore((s) => s.applyServerPatch)
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

  const isEmpty = !loading && filtered.length === 0

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <SearchBar value={searchQuery} onChange={setSearch} />
        <div className="flex flex-wrap items-center gap-3">
          <Controls categories={categories} selected={selectedCategory} onSelect={setCategoryFilter} onSort={setSort} />
          <div className="flex gap-2">
            <button onClick={undo} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Undo</button>
            <button onClick={redo} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Redo</button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
        <span>{filtered.length} products</span>
        <span>{liveUpdateCount > 0 ? `Live updates applied: ${liveUpdateCount}` : 'Live updates active'}</span>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : isEmpty ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No products match your search or filter.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} onEdit={(id, cat) => editCategory(id, cat)} pending={!!pending[p.id]} />
          ))}
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  )
}

export default ProductGrid
