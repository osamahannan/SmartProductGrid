import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import useDebounce from '../../../../hooks/useDebounce'

type Props = {
  value: string
  onChange: (v: string) => void
  debounceMs?: number
}

export default function SearchBar({ value, onChange, debounceMs = 300 }: Props) {
  const [local, setLocal] = useState<string>(value)
  const debounced = useDebounce(local, debounceMs)

  // keep local in sync when parent value changes
  useEffect(() => setLocal(value), [value])

  // notify parent only when debounced value changes
  useEffect(() => {
    if (debounced !== value) onChange(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        className="block w-full rounded-xl border border-slate-200 bg-white py-2 md:py-2.5 pl-10 pr-4 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
        placeholder="Search products by title..."
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
    </div>
  )
}
