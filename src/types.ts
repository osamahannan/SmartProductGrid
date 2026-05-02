export type Rating = { rate: number; count: number }

export type Product = {
  id: number
  title: string
  price: number
  category: string
  description: string
  image: string
  rating: Rating
  // local metadata
  _version?: number
  _lastLocalUpdate?: number
}

export type SortOption =
  | { key: 'price'; dir: 'asc' | 'desc' }
  | { key: 'rating'; dir: 'asc' | 'desc' }
