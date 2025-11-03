/**
 * 6-Level Umami Classification System
 * Uses specific ranges for AA, Nuc, and Synergy
 */

export interface UmamiLevel6 {
  level: 1 | 2 | 3 | 4 | 5 | 6
  label: string
  color: string
}

// Color system
export const COLORS = {
  AA: '#619C5C',   // Green
  NUC: '#C47E08',  // Orange
  SYN: '#E4ABF3'   // Purple
}

/**
 * Get AA level (1-6) based on mg/100g
 */
export function getAALevel(mg: number): UmamiLevel6 {
  if (mg <= 10) return { level: 1, label: 'Very Low', color: '#E8F5E6' }
  if (mg <= 30) return { level: 2, label: 'Low', color: '#C5E8C0' }
  if (mg <= 80) return { level: 3, label: 'Moderate', color: '#9DD696' }
  if (mg <= 150) return { level: 4, label: 'High', color: '#7BC474' }
  if (mg <= 300) return { level: 5, label: 'Very High', color: '#619C5C' }
  return { level: 6, label: 'Exceptional', color: '#4A7A47' }
}

/**
 * Get Nuc level (1-6) based on mg/100g
 */
export function getNucLevel(mg: number): UmamiLevel6 {
  if (mg <= 5) return { level: 1, label: 'Very Low', color: '#FFF3E0' }
  if (mg <= 15) return { level: 2, label: 'Low', color: '#FFE0B2' }
  if (mg <= 40) return { level: 3, label: 'Moderate', color: '#FFCC80' }
  if (mg <= 80) return { level: 4, label: 'High', color: '#FFB74D' }
  if (mg <= 150) return { level: 5, label: 'Very High', color: '#FFA726' }
  return { level: 6, label: 'Exceptional', color: '#C47E08' }
}

/**
 * Get Synergy level (1-6) based on EUC value
 * Using formula: U = 8([AA] + 1218 × [AA] × [NUC])
 */
export function getSynergyLevel(euc: number): UmamiLevel6 {
  if (euc <= 100) return { level: 1, label: 'Very Low', color: '#F9E5FF' }
  if (euc <= 400) return { level: 2, label: 'Low', color: '#F3D4FF' }
  if (euc <= 1000) return { level: 3, label: 'Moderate', color: '#ECC3FF' }
  if (euc <= 3000) return { level: 4, label: 'High', color: '#E4ABF3' }
  if (euc <= 8000) return { level: 5, label: 'Very High', color: '#D996E8' }
  return { level: 6, label: 'Exceptional', color: '#C47AD6' }
}

/**
 * Format value for display
 */
export function formatValue(value: number): string {
  if (value < 1) return value.toFixed(2)
  if (value < 10) return value.toFixed(1)
  return Math.round(value).toString()
}

/**
 * Calculate AA:Nuc ratio
 */
export function calculateRatio(aa: number, nuc: number): { aa: number; nuc: number; text: string } {
  const total = aa + nuc
  if (total === 0) return { aa: 50, nuc: 50, text: '50:50' }
  
  const aaPercent = Math.round((aa / total) * 100)
  const nucPercent = 100 - aaPercent
  
  return {
    aa: aaPercent,
    nuc: nucPercent,
    text: `${aaPercent}:${nucPercent}`
  }
}
