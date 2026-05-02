export function LoadingSkeleton(): JSX.Element {
  return (
  <div className="p-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-4 bg-white rounded shadow animate-pulse h-36" />
      ))}
    </div>
  </div>
  )
}

export default LoadingSkeleton
