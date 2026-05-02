/**
 * Products Store
 * Zustand store for global state management with full undo/redo history
 * Persists state to localStorage for data persistence
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Product, SortOption } from '../../../types'
import * as api from '../api/products'
import { toast } from 'react-toastify'

/**
 * Store state interface
 */
type State = {
  // History (undo/redo support)
  past: Product[][]
  present: Product[]
  future: Product[][]
  
  // Filters & sorting
  searchQuery: string
  selectedCategory: string | null
  sortOption?: SortOption
  
  // Loading states
  loading: boolean
  error?: string
  pending: Record<number, boolean>
  
  // Actions
  loadProducts: () => Promise<void>
  setSearch: (q: string) => void
  setCategoryFilter: (c: string | null) => void
  setSort: (s?: SortOption) => void
  editCategory: (id: number, category: string) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  applyServerPatch: (patch: Partial<Product> & { id: number; _version: number }) => void
}

const STORAGE_KEY = 'spg_state_v1'

type PersistedState = Pick<State, 'past' | 'present' | 'future' | 'searchQuery' | 'selectedCategory' | 'sortOption'>

/**
 * Load persisted state from localStorage
 */
const loadSaved = (): Partial<PersistedState> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<PersistedState>
  } catch {
    return null
  }
}

/**
 * Persist state to localStorage
 */
const persistState = (state: PersistedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage failures in private/incognito modes
  }
}

const saved = typeof window !== 'undefined' ? loadSaved() : null

/**
 * Create Zustand store with devtools and persist middleware
 */
const useProductsStore = create<State>()(
  devtools((set, get) => ({
    // Initial state
    past: saved?.past ?? [],
    present: saved?.present ?? [],
    future: saved?.future ?? [],
    searchQuery: saved?.searchQuery ?? '',
    selectedCategory: saved?.selectedCategory ?? null,
    sortOption: saved?.sortOption ?? undefined,
    loading: false,
    pending: {},

    /**
     * Load products from API
     * Restores saved state if available, otherwise uses fresh data
     */
    loadProducts: async () => {
      set({ loading: true })
      try {
        const data = await api.fetchProducts()
        const present = get().present.length ? get().present : data
        set({ present, past: get().past || [], future: [], loading: false })
        
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

    /**
     * Update search query
     */
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

    /**
     * Update category filter
     */
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

    /**
     * Update sort option
     */
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

    /**
     * Edit product category with optimistic update
     * Pushes change to history, marks as pending, and calls mock API
     * On failure, automatically undoes the change
     */
    editCategory: (id, category) => {
      const { present, past } = get()
      const newPresent = present.map((p) =>
        p.id === id
          ? {
              ...p,
              category,
              _lastLocalUpdate: Date.now(),
              _version: (p._version || 0) + 1
            }
          : p
      )

      // Push current to past, clear future, mark as pending
      set({
        past: [...past, present],
        present: newPresent,
        future: [],
        pending: { ...get().pending, [id]: true }
      })

      persistState({
        past: [...past, present],
        present: newPresent,
        future: [],
        searchQuery: get().searchQuery,
        selectedCategory: get().selectedCategory,
        sortOption: get().sortOption
      })

      // Call mock API
      api.mockUpdateCategory(id, category, Date.now()).then((res) => {
        if (!res.success) {
          // Rollback to previous state
          const latestPast = get().past[get().past.length - 1] || []
          set({ present: latestPast })
          
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
          // Success: clear pending
          set((s) => ({ pending: { ...s.pending, [id]: false } }))
        }
      })
    },

    /**
     * Undo last change
     * Moves current to future, restores from past
     */
    undo: () => {
      const { past, present, future } = get()
      if (past.length === 0) return
      
      const previous = past[past.length - 1]
      const newPast = past.slice(0, -1)
      
      set({ past: newPast, present: previous, future: [present, ...future] })
      
      persistState({
        past: newPast,
        present: previous,
        future: [present, ...future],
        searchQuery: get().searchQuery,
        selectedCategory: get().selectedCategory,
        sortOption: get().sortOption
      })
      
      toast.info('Undo successful')
    },

    /**
     * Redo undone change
     * Moves current to past, restores from future
     */
    redo: () => {
      const { past, present, future } = get()
      if (future.length === 0) return
      
      const next = future[0]
      const newFuture = future.slice(1)
      
      set({ past: [...past, present], present: next, future: newFuture })
      
      persistState({
        past: [...past, present],
        present: next,
        future: newFuture,
        searchQuery: get().searchQuery,
        selectedCategory: get().selectedCategory,
        sortOption: get().sortOption
      })
      
      toast.info('Redo successful')
    },

    /**
     * Check if undo available
     */
    canUndo: () => get().past.length > 0,

    /**
     * Check if redo available
     */
    canRedo: () => get().future.length > 0,

    /**
     * Apply server-side patches
     * Conflict resolution:
     * - Respects version numbers (newer wins)
     * - Protects recent local edits (3-second grace period)
     */
    applyServerPatch: (patch) => {
      const { present } = get()
      const newPresent = present.map((p) => {
        if (p.id !== patch.id) return p
        
        // Skip if server version is older
        if (patch._version <= (p._version || 0)) return p
        
        // Skip if very recent local edit (3-second grace period)
        const localUpdated = p._lastLocalUpdate ?? 0
        if (localUpdated && Date.now() - localUpdated < 3000) return p
        
        // Apply patch
        return { ...p, ...patch }
      })
      
      set({ present: newPresent })
    }
  }))
)

export default useProductsStore
