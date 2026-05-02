import React, { useEffect, useState } from 'react'

type Props = { value: string; onChange: (v: string) => void }

export const SearchBar: React.FC<Props> = ({ value, onChange }) => {
  const [local, setLocal] = useState(value)
  useEffect(() => setLocal(value), [value])

  useEffect(() => {
    const t = setTimeout(() => onChange(local), 300)
    return () => clearTimeout(t)
  }, [local, onChange])

  return (
    <input
      className="w-full md:w-72 px-3 py-2 border rounded"
      placeholder="Search products by title..."
      value={local}
      onChange={(e) => setLocal(e.target.value)}
    />
  )
}

export default SearchBar
