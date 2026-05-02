/**
 * Product Card Component
 * Displays individual product with category edit functionality
 * Memoized for performance optimization
 */

import React, { memo, useState } from 'react'
import type { Product } from '../../../../types'
import Select from '../../../../components/Select'
import './ProductCard.css'

const CATEGORY_OPTIONS = ["men's clothing", "women's clothing", 'jewelery', 'electronics']

type Props = {
  product: Product
  onEdit: (id: number, category: string) => void
  pending?: boolean
}

/**
 * ProductCard Component
 * Displays product info with editable category
 * Handles pending state with visual feedback
 *
 * NOTE: `dropdownOpen` state is used to lift the card's z-index above siblings
 * while the select is open — this prevents the dropdown from being painted
 * underneath the next card even when the card transform creates a new layer.
 */
const ProductCard = memo(
  ({ product: p, onEdit, pending }: Props) => {
    const [dropdownOpen, setDropdownOpen] = useState(false)

    return (
      <article
        className={`product-card ${pending ? 'pending' : ''} ${dropdownOpen ? 'dropdown-active' : ''}`}
      >
        <div className="product-card-inner">
          {/* Product Image — fills the full card height */}
          <div className="product-card-image">
            {p.image ? (
              <img src={p.image} alt={p.title} loading="lazy" />
            ) : (
              <div className="product-card-image-placeholder">
                No image
              </div>
            )}
          </div>

          {/* Product Content */}
          <div className="product-card-content">
            {/* Header: ID, Title, Price */}
            <div className="product-card-header">
              <div className="min-w-0 flex-1">
                <p className="product-id">Product #{p.id}</p>
                <h3 className="product-title">{p.title}</h3>
              </div>
              <span className="product-price">${p.price.toFixed(2)}</span>
            </div>

            {/* Category Badge + Rating */}
            <div className="product-card-meta">
              <span className="product-category-badge">{p.category}</span>
              <span className="product-rating">{p.rating?.rate ?? '-'} / 5</span>
            </div>

            {/* Spacer to push actions to bottom */}
            <div className="flex-1" />

            {/* Change Category — dropdown open state lifts z-index */}
            <div className="product-card-actions">
              <span className="change-label">Change Category</span>
              <div className="select-wrapper">
                <Select
                  options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
                  value={p.category}
                  onChange={(v) => onEdit(p.id, v)}
                  disabled={!!pending}
                  ariaLabel="Change product category"
                  size="sm"
                  onOpenChange={setDropdownOpen}
                />
              </div>
            </div>

            {/* Pending indicator */}
            {pending && (
              <div className="flex justify-end">
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                  Saving...
                </span>
              </div>
            )}
          </div>
        </div>
      </article>
    )
  }
)

ProductCard.displayName = 'ProductCard'

export default ProductCard
