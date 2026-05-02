import React from 'react'
import { Search } from 'lucide-react'

type Props = {
  value: string
  onChange: (v: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
        placeholder="Search products by title..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
