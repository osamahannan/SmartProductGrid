/**
 * Centralized type definitions for the Smart Product Grid application
 */

export type Rating = { rate: number; count: number }

export type Product = {
  id: number
  title: string
  price: number
  category: string
  description: string
  image: string
  rating: Rating
  _lastLocalUpdate?: number
  _version?: number
}

export type SortOption = { key: 'price' | 'rating'; dir: 'asc' | 'desc' }

export type HistoryState = {
  past: Product[][]
  present: Product[]
  future: Product[][]
}
