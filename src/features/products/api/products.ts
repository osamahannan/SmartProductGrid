/**
 * Products API Layer
 * Handles all product-related API calls and simulations
 */

import axios from 'axios'
import type { Product } from '../../../types'

const API_BASE = 'https://fakestoreapi.com'

/**
 * Fetch all products from the API
 * Adds version metadata for conflict resolution
 */
export async function fetchProducts(): Promise<Product[]> {
  const res = await axios.get<Product[]>(`${API_BASE}/products`)
  // Add version metadata (timestamp when fetched)
  return res.data.map((p) => ({ ...p, _version: Date.now() }))
}

/**
 * Mock update category with simulated delay and failure rate
 * Simulates network latency (500-1500ms) and 25% failure rate
 */
export async function mockUpdateCategory(
  id: number,
  category: string,
  currentVersion: number
): Promise<{ success: boolean; product?: Product }> {
  const delay = 500 + Math.floor(Math.random() * 1000)
  await new Promise((r) => setTimeout(r, delay))
  
  // 25% chance of failure
  const fail = Math.random() < 0.25
  if (fail) return { success: false }

  // Simulate server-side update with new version
  const updated: Product = {
    id,
    title: `(server) updated ${id}`,
    price: 0,
    category,
    description: '',
    image: '',
    rating: { rate: 0, count: 0 },
    _version: Date.now()
  }
  return { success: true, product: updated }
}

/**
 * Subscribe to simulated server updates
 * Randomly updates price or rating every 5-10 seconds
 * Returns unsubscribe function for cleanup
 */
export function subscribeServerUpdates(
  onUpdate: (partial: Partial<Product> & { id: number; _version: number }) => void
) {
  const timer = setInterval(() => {
    const id = Math.floor(Math.random() * 20) + 1
    const changePrice = Math.random() > 0.5
    const partial: any = { id, _version: Date.now() }
    
    if (changePrice) {
      partial.price = +(Math.random() * 200).toFixed(2)
    } else {
      partial.rating = {
        rate: +(Math.random() * 5).toFixed(2),
        count: Math.floor(Math.random() * 500)
      }
    }
    
    onUpdate(partial)
  }, 5000 + Math.floor(Math.random() * 5000))

  return () => clearInterval(timer)
}
