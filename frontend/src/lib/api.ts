import { 
  Ingredient, 
  IngredientListResponse, 
  CompositionIngredient, 
  CompositionResult,
  FilterState 
} from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000/api' : '/api')

export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'APIError'
  }
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new APIError(
      `API Error: ${response.statusText} - ${errorText}`,
      response.status
    )
  }

  return response.json()
}

export function buildSearchParams(filters: Partial<FilterState>): URLSearchParams {
  const params = new URLSearchParams()
  
  if (filters.query) {
    params.set('q', filters.query)
  }
  
  if (filters.sort && filters.sort !== 'synergy') {
    params.set('sort', filters.sort)
  }
  
  // Add array filters
  filters.umami?.forEach(value => params.append('umami[]', value))
  filters.flavor?.forEach(value => params.append('flavor[]', value))
  filters.qi?.forEach(value => params.append('qi[]', value))
  filters.flavors?.forEach(value => params.append('flavors[]', value))
  filters.meridians?.forEach(value => params.append('meridians[]', value))
  filters.allergens_include?.forEach(value => params.append('allergens_include[]', value))
  filters.allergens_exclude?.forEach(value => params.append('allergens_exclude[]', value))
  filters.dietary?.forEach(value => params.append('dietary[]', value))
  filters.category?.forEach(value => params.append('category[]', value))
  
  // Add range filters
  if (filters.ranges) {
    const { ranges } = filters
    if (ranges.aa_min !== undefined) params.set('aa_min', ranges.aa_min.toString())
    if (ranges.aa_max !== undefined) params.set('aa_max', ranges.aa_max.toString())
    if (ranges.nuc_min !== undefined) params.set('nuc_min', ranges.nuc_min.toString())
    if (ranges.nuc_max !== undefined) params.set('nuc_max', ranges.nuc_max.toString())
    if (ranges.syn_min !== undefined) params.set('syn_min', ranges.syn_min.toString())
    if (ranges.syn_max !== undefined) params.set('syn_max', ranges.syn_max.toString())
  }
  
  return params
}

export async function searchIngredients(
  filters: Partial<FilterState> = {},
  page = 1,
  pageSize = 24
): Promise<IngredientListResponse> {
  const params = buildSearchParams(filters)
  params.set('page', page.toString())
  params.set('page_size', pageSize.toString())
  
  return fetchAPI<IngredientListResponse>(`/ingredients/?${params.toString()}`)
}

export async function getIngredient(id: number): Promise<Ingredient> {
  return fetchAPI<Ingredient>(`/ingredients/${id}/`)
}

export async function composePreview(
  ingredients: CompositionIngredient[]
): Promise<CompositionResult> {
  return fetchAPI<CompositionResult>('/ingredients/compose_preview/', {
    method: 'POST',
    body: JSON.stringify(ingredients),
  })
}

// Utility functions for state management
export function encodeState(state: any): string {
  return btoa(JSON.stringify(state))
}

export function decodeState<T>(encoded: string): T | null {
  try {
    return JSON.parse(atob(encoded))
  } catch {
    return null
  }
}

export function saveToLocalStorage(key: string, data: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

export function loadFromLocalStorage<T>(key: string): T | null {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key)
    if (item) {
      try {
        return JSON.parse(item)
      } catch {
        return null
      }
    }
  }
  return null
}

// Debounce utility for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}