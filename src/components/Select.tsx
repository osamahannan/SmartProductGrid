import React, { useEffect, useRef, useState } from 'react'
import './Select.css'

type Option = { value: string; label: string }

type Props = {
  options: Option[]
  value?: string | null
  onChange: (v: string) => void
  disabled?: boolean
  ariaLabel?: string
  /** Optional size variant */
  size?: 'sm' | 'md'
  /** Called whenever the dropdown opens or closes */
  onOpenChange?: (open: boolean) => void
}

export default function Select({ options, value, onChange, disabled, ariaLabel, size = 'md', onOpenChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const setOpenState = (nextOpen: boolean) => {
    setOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false)
        onOpenChange?.(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [onOpenChange])

  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''

  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-[11px]'
    : 'px-4 py-2.5 text-sm'

  return (
    <div ref={ref} className="custom-select-wrapper">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpenState(!open)}
        className={`custom-select-trigger ${sizeClasses} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="truncate">{selectedLabel || 'Select'}</span>
          <svg
            className={`custom-select-chevron ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
          >
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <ul role="listbox" tabIndex={-1} className="custom-select-dropdown">
          {options.map((o) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onClick={() => {
                onChange(o.value)
                setOpenState(false)
              }}
              className={`custom-select-option ${o.value === value ? 'selected' : ''}`}
            >
              {o.label}
              {o.value === value && (
                <svg className="custom-select-check" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
