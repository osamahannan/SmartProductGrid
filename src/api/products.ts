import axios from 'axios'
import { Product } from '../types'

const API_BASE = 'https://fakestoreapi.com'

export async function fetchProducts(): Promise<Product[]> {
  const res = await axios.get<Product[]>(`${API_BASE}/products`)
  // add version metadata
  return res.data.map((p) => ({ ...p, _version: Date.now() }))
}

// Mock update with delay and random failure
export async function mockUpdateCategory(
  id: number,
  category: string,
  currentVersion: number
): Promise<{ success: boolean; product?: Product }>
{
  const delay = 500 + Math.floor(Math.random() * 1000)
  await new Promise((r) => setTimeout(r, delay))
  const fail = Math.random() < 0.25
  if (fail) return { success: false }

  // Simulate server-side update and new version
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

// Simulated server push: random price/rating updates
export function subscribeServerUpdates(
  onUpdate: (partial: Partial<Product> & { id: number; _version: number }) => void
) {
  const timer = setInterval(() => {
    const id = Math.floor(Math.random() * 20) + 1
    const changePrice = Math.random() > 0.5
    const partial: any = { id, _version: Date.now() }
    if (changePrice) partial.price = +(Math.random() * 200).toFixed(2)
    else partial.rating = { rate: +(Math.random() * 5).toFixed(2), count: Math.floor(Math.random() * 500) }
    onUpdate(partial)
  }, 5000 + Math.floor(Math.random() * 5000))

  return () => clearInterval(timer)
}
