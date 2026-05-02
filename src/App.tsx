/**
 * Smart Product Grid - Main App
 * Root component with keyboard shortcut support for undo/redo
 */

import React, { useEffect, useCallback } from 'react'
import useProductsStore from './features/products/store/useProductsStore'
import ProductGrid from './features/products/components/ProductGrid'

/**
 * App Component
 * - Sets up keyboard shortcuts (Ctrl+Z/Ctrl+Y, Cmd+Z/Cmd+Y)
 * - Renders main ProductGrid component
 */
const App: React.FC = () => {
  const undo = useProductsStore((s) => s.undo)
  const redo = useProductsStore((s) => s.redo)
  const canUndo = useProductsStore((s) => s.canUndo())
  const canRedo = useProductsStore((s) => s.canRedo())

  /**
   * Keyboard shortcut handler
   * - Ctrl/Cmd + Z: Undo
   * - Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z: Redo
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform)
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // Undo: Ctrl+Z or Cmd+Z
      if (modifier && e.key === 'z' && !e.shiftKey) {
        if (canUndo) {
          e.preventDefault()
          undo()
        }
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      if (modifier && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        if (canRedo) {
          e.preventDefault()
          redo()
        }
      }
    },
    [undo, redo, canUndo, canRedo]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-screen-2xl px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Smart Product Grid
              </h1>
              <p className="mt-0.5 text-sm text-slate-600">
                Manage products with search, filtering, and undo/redo
              </p>
            </div>
            <div className="text-xs text-slate-500">
              <p>
                <strong>Shortcuts:</strong> Ctrl+Z (Undo) • Ctrl+Y (Redo)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-screen-2xl px-4 py-6 lg:px-6">
        <ProductGrid />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-screen-2xl px-4 lg:px-6">
          <p className="text-center text-sm text-slate-600">
            Smart Product Grid • React + TypeScript + Zustand • Feature-based Architecture
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
