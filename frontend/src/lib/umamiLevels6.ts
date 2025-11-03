/**
 * 6-Level Umami Classification System
 * Uses specific ranges for AA, Nuc, and Synergy
 */

export interface UmamiLevel6 {
  level: 0 | 1 | 2 | 3 | 4 | 5 | 6
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
 * Get AA level (0-6) based on weighted mg/100g
 * Thresholds based on actual data distribution (P25, P50, P75, P90, P95)
 * Pale green to deep forest green
 */
export function getAALevel(mg: number): UmamiLevel6 {
  if (mg === 0) return { level: 0, label: 'None', color: '#F3F4F6' }
  if (mg <= 13) return { level: 1, label: 'Very Low', color: '#EEF4EB' }  // ~P25
  if (mg <= 50) return { level: 2, label: 'Low', color: '#D4E5CF' }       // ~P50
  if (mg <= 260) return { level: 3, label: 'Moderate', color: '#B0D1A7' } // ~P75
  if (mg <= 740) return { level: 4, label: 'High', color: '#8AB87F' }     // ~P90
  if (mg <= 1330) return { level: 5, label: 'Very High', color: '#73A36A' } // ~P95
  return { level: 6, label: 'Exceptional', color: '#5E8756' }              // >P95
}

/**
 * Get Nuc level (0-6) based on weighted mg/100g
 * Thresholds based on actual data distribution (P25, P50, P75, P90, P95)
 * Light sand to rich caramel brown
 */
export function getNucLevel(mg: number): UmamiLevel6 {
  if (mg === 0) return { level: 0, label: 'None', color: '#F3F4F6' }
  if (mg <= 15) return { level: 1, label: 'Very Low', color: '#FAF3E8' }   // ~P25
  if (mg <= 75) return { level: 2, label: 'Low', color: '#EFD9BA' }        // ~P50
  if (mg <= 290) return { level: 3, label: 'Moderate', color: '#DBBB8A' }  // ~P75
  if (mg <= 650) return { level: 4, label: 'High', color: '#C69D5E' }      // ~P90
  if (mg <= 870) return { level: 5, label: 'Very High', color: '#B8863A' } // ~P95
  return { level: 6, label: 'Exceptional', color: '#A86D1C' }               // >P95
}

/**
 * Get Synergy level (0-6) based on EUC value (mg MSG eq/100g)
 * Thresholds based on actual data distribution (P25, P50, P75, P90, P95)
 * Soft lilac to vibrant violet
 * Using formula: EUC = weighted_AA + 1218 × weighted_AA × weighted_Nuc
 */
export function getSynergyLevel(euc: number): UmamiLevel6 {
  if (euc === 0) return { level: 0, label: 'None', color: '#F3F4F6' }
  if (euc <= 16) return { level: 1, label: 'Very Low', color: '#F9F3FC' }     // ~P25
  if (euc <= 76) return { level: 2, label: 'Low', color: '#EBD9F4' }          // ~P50
  if (euc <= 400) return { level: 3, label: 'Moderate', color: '#D5B5ED' }    // ~P75
  if (euc <= 1900) return { level: 4, label: 'High', color: '#C091E7' }       // ~P90
  if (euc <= 11800) return { level: 5, label: 'Very High', color: '#B67BE5' } // ~P95
  return { level: 6, label: 'Exceptional', color: '#A865E4' }                  // >P95 (up to 448,753!)
}

/**
 * Format value for display
 */
export function formatValue(value: number | string | null | undefined): string {
  // Handle null, undefined, or non-numeric values
  if (value == null || value === '') return '0'
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  // Handle NaN or invalid numbers
  if (isNaN(numValue)) return '0'
  
  if (numValue < 1) return numValue.toFixed(2)
  if (numValue < 10) return numValue.toFixed(1)
  return Math.round(numValue).toString()
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

/**
 * Get descriptive text for umami level
 */
export function getUmamiDescription(synergy: number): string {
  const level = getSynergyLevel(synergy)
  
  switch (level.level) {
    case 0:
      return 'No umami detected'
    case 1:
      return 'Minimal umami presence'
    case 2:
      return 'Subtle umami notes'
    case 3:
      return 'Achieves balanced umami'
    case 4:
      return 'Strong umami character'
    case 5:
      return 'Rich umami intensity'
    case 6:
      return 'Exceptional umami depth'
    default:
      return 'Balanced umami profile'
  }
}
