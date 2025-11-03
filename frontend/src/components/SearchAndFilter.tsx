'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, ChevronDown, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { FilterState } from '@/types'
import { debounce } from '@/lib/api'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'synergy', label: 'Synergy' },
  { value: 'aa', label: 'Amino Acids' },
  { value: 'nuc', label: 'Nucleotides' },
  { value: 'tcm', label: 'TCM' },
  { value: 'alpha', label: 'A→Z' }
]

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder, className = '' }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  
  // Debounced search
  const debouncedOnChange = useRef(
    debounce((searchValue: string) => {
      onChange(searchValue)
    }, 200)
  ).current

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    debouncedOnChange(newValue)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder || "Search ingredients by Umami or TCM..."}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {localValue && (
          <button
            onClick={handleClear}
            className="btn-circular-sm absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

interface FilterChipProps {
  label: string
  onRemove: () => void
  className?: string
}

export function FilterChip({ label, onRemove, className = '' }: FilterChipProps) {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full ${className}`}>
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="btn-circular-sm hover:bg-blue-200 w-4 h-4"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  )
}

interface FilterDropdownProps {
  title: string
  options: Array<{ value: string, label: string }>
  selectedValues: string[]
  onChange: (values: string[]) => void
  className?: string
}

export function FilterDropdown({ title, options, selectedValues, onChange, className = '' }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const toggleOption = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value]
    onChange(newValues)
  }
  
  const handleOpen = () => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect())
    }
    setIsOpen(true)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap flex-shrink-0"
      >
        <span>{title}</span>
        {selectedValues.length > 0 && (
          <span className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
            {selectedValues.length}
          </span>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {isOpen && buttonRect && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
            style={{
              top: buttonRect.bottom + window.scrollY + 4,
              left: buttonRect.left + window.scrollX,
            }}
          >
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface FilterRowProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  resultCount: number
  compact?: boolean
  className?: string
  onClearFilters?: () => void
  showResultCount?: boolean
}

export function FilterRow({ filters, onChange, resultCount, compact = false, className = '', onClearFilters, showResultCount = true }: FilterRowProps) {
  // Filter options - these would normally come from the API or constants
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'synergy', label: 'Synergy' },
  { value: 'aa', label: 'Amino Acids' },
  { value: 'nuc', label: 'Nucleotides' },
  { value: 'tcm', label: 'TCM' },
  { value: 'alpha', label: 'A→Z' }
]

const umamiOptions = [
    { value: 'umami_aa', label: 'Umami AA' },
    { value: 'umami_nuc', label: 'Umami Nuc' }
  ]
  const flavorOptions = [
    { value: 'flavor_supporting', label: 'Flavor Supporting' },
    { value: 'flavor_carrier', label: 'Flavor Carrier' }
  ]
  
  const qiOptions = [
    { value: 'Hot', label: 'Hot' },
    { value: 'Warm', label: 'Warm' },
    { value: 'Neutral', label: 'Neutral' },
    { value: 'Cool', label: 'Cool' },
    { value: 'Cold', label: 'Cold' }
  ]
  
  const tasteOptions = [ // TCM Five Tastes
    { value: 'Sweet', label: 'Sweet' },
    { value: 'Salty', label: 'Salty' },
    { value: 'Sour', label: 'Sour' },
    { value: 'Bitter', label: 'Bitter' },
    { value: 'Pungent', label: 'Pungent' },
    { value: 'Astringent', label: 'Astringent' }
  ]
  
  const meridianOptions = [
    { value: 'Spleen', label: 'Spleen' },
    { value: 'Stomach', label: 'Stomach' },
    { value: 'Lung', label: 'Lung' },
    { value: 'Kidney', label: 'Kidney' },
    { value: 'Liver', label: 'Liver' },
    { value: 'Heart', label: 'Heart' }
  ]

  const sortOptions = SORT_OPTIONS

  // Get all active filter chips
  const getActiveChips = () => {
    const chips: Array<{ label: string, onRemove: () => void }> = []
    
    // Umami filters
    filters.umami.forEach(value => {
      const option = umamiOptions.find(opt => opt.value === value)
      if (option) {
        chips.push({
          label: option.label,
          onRemove: () => onChange({
            ...filters,
            umami: filters.umami.filter(v => v !== value)
          })
        })
      }
    })
    
    // Flavor filters
    filters.flavor.forEach(value => {
      const option = flavorOptions.find(opt => opt.value === value)
      if (option) {
        chips.push({
          label: option.label,
          onRemove: () => onChange({
            ...filters,
            flavor: filters.flavor.filter(v => v !== value)
          })
        })
      }
    })
    
    // Qi filters
    filters.qi.forEach(value => {
      const option = qiOptions.find(opt => opt.value === value)
      if (option) {
        chips.push({
          label: `Qi: ${option.label}`,
          onRemove: () => onChange({
            ...filters,
            qi: filters.qi.filter(v => v !== value)
          })
        })
      }
    })
    
    // TCM Five Tastes filters
    filters.flavors.forEach(value => {
      const option = tasteOptions.find(opt => opt.value === value)
      if (option) {
        chips.push({
          label: `Taste: ${option.label}`, // Updated label
          onRemove: () => onChange({
            ...filters,
            flavors: filters.flavors.filter(v => v !== value)
          })
        })
      }
    })
    
    // Meridian filters
    filters.meridians.forEach(value => {
      const option = meridianOptions.find(opt => opt.value === value)
      if (option) {
        chips.push({
          label: `Meridian: ${option.label}`,
          onRemove: () => onChange({
            ...filters,
            meridians: filters.meridians.filter(v => v !== value)
          })
        })
      }
    })
    
    return chips
  }

  const activeChips = getActiveChips()

  return (
    <div className={className}>
      {/* Filter dropdowns - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide whitespace-nowrap">
        <FilterDropdown
          title="Umami"
          options={umamiOptions}
          selectedValues={filters.umami}
          onChange={(values) => onChange({ ...filters, umami: values })}
        />
        
        <FilterDropdown
          title="Flavor Role"
          options={flavorOptions}
          selectedValues={filters.flavor}
          onChange={(values) => onChange({ ...filters, flavor: values })}
        />
        
        <FilterDropdown
          title="TCM Four Qi"
          options={qiOptions}
          selectedValues={filters.qi}
          onChange={(values) => onChange({ ...filters, qi: values })}
        />
        
        <FilterDropdown
          title="TCM Five Tastes" // Updated label per user preference
          options={tasteOptions}
          selectedValues={filters.flavors}
          onChange={(values) => onChange({ ...filters, flavors: values })}
        />
        
        <FilterDropdown
          title="Meridians"
          options={meridianOptions}
          selectedValues={filters.meridians}
          onChange={(values) => onChange({ ...filters, meridians: values })}
        />
      </div>
      
      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="flex flex-wrap gap-1">
            {activeChips.map((chip, index) => (
              <FilterChip
                key={index}
                label={chip.label}
                onRemove={chip.onRemove}
              />
            ))}
          </div>
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-2 py-1 text-xs text-black hover:text-gray-700"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
      
      {showResultCount && (
        <div className="mt-2 text-sm text-gray-600">
          {resultCount.toLocaleString()} results
        </div>
      )}
    </div>
  )
}

interface SortSelectProps {
  value: FilterState['sort']
  onChange: (value: FilterState['sort']) => void
  className?: string
}

export function SortSelect({ value, onChange, className = '' }: SortSelectProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  if (isMobile) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setMenuOpen(prev => !prev)}
          className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:text-gray-800 hover:border-gray-400"
          aria-label="Sort ingredients"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {SORT_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value as FilterState['sort'])
                  setMenuOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                  value === option.value ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FilterState['sort'])}
      className={`px-3 py-2 border border-gray-300 rounded-lg text-sm whitespace-nowrap ${className}`}
    >
      {SORT_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>
          Sort: {option.label}
        </option>
      ))}
    </select>
  )
}
