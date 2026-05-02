import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Product, SortOption } from '../types'
import * as api from '../api/products'
import { toast } from 'react-toastify'

type State = {
  products: Product[]
  loading: boolean
  error?: string
  searchQuery: string
  selectedCategory: string | null
  sortOption?: SortOption
  past: Product[][]
  present: Product[]
  future: Product[][]
  pending: Record<number, boolean>
  loadProducts: () => Promise<void>
  setSearch: (q: string) => void
  setCategoryFilter: (c: string | null) => void
  setSort: (s?: SortOption) => void
  editCategory: (id: number, category: string) => void
  undo: () => void
  redo: () => void
  applyServerPatch: (patch: Partial<Product> & { id: number; _version: number }) => void
}

const STORAGE_KEY = 'spg_state_v1'

type PersistedState = Pick<State, 'past' | 'present' | 'future' | 'searchQuery' | 'selectedCategory' | 'sortOption'>

// try to load saved state (only small subset)
const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<PersistedState>
  } catch {
    return null
  }
}

const saved = typeof window !== 'undefined' ? loadSaved() : null

const persistState = (state: PersistedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage failures in private/incognito modes.
  }
}

const useProductsStore = create<State>()(
  devtools((set, get) => ({
    products: saved?.present ?? [],
    loading: false,
    searchQuery: saved?.searchQuery ?? '',
    selectedCategory: saved?.selectedCategory ?? null,
    sortOption: saved?.sortOption ?? undefined,
    past: saved?.past ?? [],
    present: saved?.present ?? [],
    future: saved?.future ?? [],
    pending: {},

    loadProducts: async () => {
      set({ loading: true })
      try {
        const data = await api.fetchProducts()
        // if we had saved present, prefer that (merge basic)
        const present = get().present.length ? get().present : data
        set({ products: data, present, past: get().past || [], future: [], loading: false })
        persistState({
          past: get().past,
          present,
          future: [],
          searchQuery: get().searchQuery,
          selectedCategory: get().selectedCategory,
          sortOption: get().sortOption
        })
      } catch (err: any) {
        set({ error: String(err), loading: false })
      }
    },

    setSearch: (q) => {
      set({ searchQuery: q })
      persistState({
        past: get().past,
        present: get().present,
        future: get().future,
        searchQuery: q,
        selectedCategory: get().selectedCategory,
        sortOption: get().sortOption
      })
    },
    setCategoryFilter: (c) => {
      set({ selectedCategory: c })
      persistState({
        past: get().past,
        present: get().present,
        future: get().future,
        searchQuery: get().searchQuery,
        selectedCategory: c,
        sortOption: get().sortOption
      })
    },
    setSort: (s) => {
      set({ sortOption: s })
      persistState({
        past: get().past,
        present: get().present,
        future: get().future,
        searchQuery: get().searchQuery,
        selectedCategory: get().selectedCategory,
        sortOption: s
      })
    },

    editCategory: (id, category) => {
      const { present, past } = get()
      const newPresent = present.map((p) => (p.id === id ? { ...p, category, _lastLocalUpdate: Date.now(), _version: (p._version || 0) + 1 } : p))
      // push current present to past, clear future
      set({ past: [...past, present], present: newPresent, future: [], pending: { ...get().pending, [id]: true } })

      // optimistic update reflected in products list too
      set((s) => ({ products: newPresent, pending: { ...s.pending } }))
      persistState({
        past: [...past, present],
        present: newPresent,
        future: [],
        searchQuery: get().searchQuery,
        selectedCategory: get().selectedCategory,
        sortOption: get().sortOption
      })

      // call mock API
      api.mockUpdateCategory(id, category, Date.now()).then((res) => {
        if (!res.success) {
          // rollback to last past
          const latestPast = get().past[get().past.length - 1] || []
          set({ present: latestPast, products: latestPast })
          persistState({
            past: get().past.slice(0, -1),
            present: latestPast,
            future: get().future,
            searchQuery: get().searchQuery,
            selectedCategory: get().selectedCategory,
            sortOption: get().sortOption
          })
          toast.error('Failed to update category — rolled back')
        } else {
          // success: unset pending for this id
          set((s) => ({ pending: { ...s.pending, [id]: false } }))
        }
      })
    },

    undo: () => {
      const { past, present, future } = get()
      if (past.length === 0) return
      const previous = past[past.length - 1]
      const newPast = past.slice(0, -1)
      set({ past: newPast, present: previous, future: [present, ...future], products: previous })
      persistState({
        past: newPast,
        present: previous,
        future: [present, ...future],
        searchQuery: get().searchQuery,
        selectedCategory: get().selectedCategory,
        sortOption: get().sortOption
      })
    },

    redo: () => {
      const { past, present, future } = get()
      if (future.length === 0) return
      const next = future[0]
      const newFuture = future.slice(1)
      set({ past: [...past, present], present: next, future: newFuture, products: next })
      persistState({
        past: [...past, present],
        present: next,
        future: newFuture,
        searchQuery: get().searchQuery,
        selectedCategory: get().selectedCategory,
        sortOption: get().sortOption
      })
    },

    applyServerPatch: (patch) => {
      const { present } = get()
      const newPresent = present.map((p) => {
        if (p.id !== patch.id) return p
        // only apply if server version is newer than local and no very recent local update
        const localUpdated = p._lastLocalUpdate ?? 0
        if (patch._version <= (p._version || 0)) return p
        if (localUpdated && Date.now() - localUpdated < 3000) return p // avoid overriding recent local edits
        return { ...p, ...patch }
      })
      set({ present: newPresent, products: newPresent })
      persistState({
        past: get().past,
        present: newPresent,
        future: get().future,
        searchQuery: get().searchQuery,
        selectedCategory: get().selectedCategory,
        sortOption: get().sortOption
      })
    }
  }))
)

export default useProductsStore
