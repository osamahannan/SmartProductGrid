import type { ChangeEvent } from 'react'
import { SortOption } from '../types'
import Select from './Select'

type Props = {
  categories: string[]
  selected?: string | null
  onSelect: (c: string | null) => void
  onSort: (s?: SortOption) => void
}

export function Controls({ categories, selected, onSelect, onSort }: Props): JSX.Element {
  return (
    <div className="flex gap-3 flex-wrap items-center">
      <div className="w-48">
        <Select options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: c }))]} value={selected ?? ''} onChange={(v) => onSelect(v || null)} ariaLabel="Filter categories" />
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-2 bg-white border rounded" onClick={() => onSort({ key: 'price', dir: 'asc' })}>Price ↑</button>
        <button className="px-3 py-2 bg-white border rounded" onClick={() => onSort({ key: 'price', dir: 'desc' })}>Price ↓</button>
        <button className="px-3 py-2 bg-white border rounded" onClick={() => onSort({ key: 'rating', dir: 'asc' })}>Rating ↑</button>
        <button className="px-3 py-2 bg-white border rounded" onClick={() => onSort({ key: 'rating', dir: 'desc' })}>Rating ↓</button>
      </div>
    </div>
  )
}

export default Controls
