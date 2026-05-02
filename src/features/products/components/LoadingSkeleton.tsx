import React from 'react'

export default function LoadingSkeleton() {
  return (
    <div className="product-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <article key={i} className="product-card">
          <div className="product-card-inner">
            <div className="product-card-image bg-slate-200 animate-pulse" />
            <div className="product-card-content p-4">
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse mb-4" />
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="flex-1" />
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-8 w-full bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
