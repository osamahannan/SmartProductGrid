/**
 * Controls Component
 * Provides category filtering and sorting options
 * Organized and accessible control panel
 */

import React, { memo, useCallback } from 'react'
import { ArrowUp, ArrowDown, Undo2, Redo2 } from 'lucide-react'
import Select from '../../../components/Select'
import type { SortOption } from '../../../types'
import './Controls.css'

type Props = {
  categories: string[]
  selectedCategory?: string | null
  sortOption?: SortOption
  onCategoryChange: (c: string | null) => void
  onSortChange: (s?: SortOption) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

/**
 * Controls Component
 * - Category filter dropdown
 * - Sort toggle buttons (price/rating) with arrow direction icons
 * - Undo/Redo buttons with disabled states
 */
const Controls = memo(
  ({
    categories,
    selectedCategory,
    sortOption,
    onCategoryChange,
    onSortChange,
    canUndo,
    canRedo,
    onUndo,
    onRedo
  }: Props) => {
    /**
     * Toggle sort: if already sorted by this key, flip direction;
     * otherwise default to ascending.
     */
    const handleSortToggle = useCallback(
      (key: 'price' | 'rating') => {
        if (sortOption?.key === key) {
          // Same key → flip direction
          onSortChange({ key, dir: sortOption.dir === 'asc' ? 'desc' : 'asc' })
        } else {
          // New key → default asc
          onSortChange({ key, dir: 'asc' })
        }
      },
      [sortOption, onSortChange]
    )

    /** Render the appropriate arrow icon for a sort key */
    const renderSortArrow = (key: 'price' | 'rating') => {
      if (sortOption?.key === key) {
        return sortOption.dir === 'asc' ? (
          <ArrowUp size={14} strokeWidth={2.5} />
        ) : (
          <ArrowDown size={14} strokeWidth={2.5} />
        )
      }
      // Default: show up arrow when inactive
      return <ArrowUp size={14} strokeWidth={2} className="opacity-50" />
    }

    return (
      <div className="filters-section">
        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-group-label">Category</label>
          <div style={{ width: '180px' }}>
            <Select
              options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: c }))]}
              value={selectedCategory ?? ''}
              onChange={(v) => onCategoryChange(v || null)}
              ariaLabel="Filter by category"
            />
          </div>
        </div>

        {/* Sort Options — single toggle buttons */}
        <div className="filter-group">
          <label className="filter-group-label">Sort</label>
          <div className="sort-buttons-group">
            <button
              onClick={() => handleSortToggle('price')}
              className={`sort-btn ${sortOption?.key === 'price' ? 'active' : ''}`}
              aria-pressed={sortOption?.key === 'price'}
              title={`Sort by price ${sortOption?.key === 'price' ? (sortOption.dir === 'asc' ? '(ascending)' : '(descending)') : ''}`}
            >
              <span>Price</span>
              {renderSortArrow('price')}
            </button>

            <button
              onClick={() => handleSortToggle('rating')}
              className={`sort-btn ${sortOption?.key === 'rating' ? 'active' : ''}`}
              aria-pressed={sortOption?.key === 'rating'}
              title={`Sort by rating ${sortOption?.key === 'rating' ? (sortOption.dir === 'asc' ? '(ascending)' : '(descending)') : ''}`}
            >
              <span>Rating</span>
              {renderSortArrow('rating')}
            </button>
          </div>
        </div>

        {/* Undo / Redo */}
        <div className="filter-group">
          <label className="filter-group-label">History</label>
          <div className="sort-buttons-group">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`sort-btn undo-redo-btn ${!canUndo ? 'disabled-btn' : ''}`}
              aria-label="Undo last change"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={14} strokeWidth={2} />
              <span>Undo</span>
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`sort-btn undo-redo-btn ${!canRedo ? 'disabled-btn' : ''}`}
              aria-label="Redo last undone change"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={14} strokeWidth={2} />
              <span>Redo</span>
            </button>
          </div>
        </div>
      </div>
    )
  }
)

Controls.displayName = 'Controls'

export default Controls
