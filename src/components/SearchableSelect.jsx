import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchableSelect({
  items,
  value,
  onChange,
  placeholder = 'Rechercher...',
  labelKey = 'name',
  valueKey = '_id',
  disabled = false,
  allowCustom = true,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)

  const selected = items.find((i) => i[valueKey] === value)

  const displayText = selected
    ? selected[labelKey]
    : value
      ? value
      : ''

  const filtered = query
    ? items.filter((i) =>
        i[labelKey]?.toLowerCase().includes(query.toLowerCase()),
      )
    : items

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (item) => {
    onChange(item[labelKey])
    setQuery('')
    setOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setQuery('')
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (allowCustom) {
      onChange(val)
    }
    if (!open) setOpen(true)
  }

  const handleBlur = () => {
    if (allowCustom && query) {
      onChange(query)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={open ? query : displayText}
          onChange={handleInputChange}
          onFocus={() => {
            setQuery(displayText)
            setOpen(true)
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-9 pr-8 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm disabled:opacity-50"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {query && !items.some((i) => i[labelKey]?.toLowerCase() === query.toLowerCase()) && (
            <div
              className="w-full text-left px-3 py-2 text-sm text-primary-600 dark:text-primary-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              onMouseDown={() => {
                onChange(query)
                setOpen(false)
              }}
            >
              Utiliser "{query}"
            </div>
          )}
          {filtered.map((item) => (
            <button
              key={item[valueKey]}
              type="button"
              onMouseDown={() => handleSelect(item)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                value === item[labelKey]
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {item[labelKey]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
