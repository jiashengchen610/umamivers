/**
 * Umami Level System based on Biological and Culinary Limits
 * All values in mg/100g
 */

export type UmamiLevel = 
  | 'sub-threshold'
  | 'biological'
  | 'culinary-optimal'
  | 'strong'
  | 'overlimit'
  | 'theoretical-max'

export interface UmamiLevelInfo {
  level: UmamiLevel
  name: string
  range: string
  color: string
  textColor: string
  suggestion: string
}

/**
 * Determine umami level based on concentration in mg/100g
 */
export function getUmamiLevel(mgPer100g: number): UmamiLevelInfo {
  if (mgPer100g < 10) {
    return {
      level: 'sub-threshold',
      name: 'Sub-threshold',
      range: '< 10 mg/100g',
      color: 'text-gray-500',
      textColor: 'text-gray-500',
      suggestion: 'Umami is barely perceptible. Consider adding umami-rich ingredients such as mushrooms, tomatoes, or seaweed.'
    }
  }
  
  if (mgPer100g >= 10 && mgPer100g < 80) {
    return {
      level: 'biological',
      name: 'Biological Range',
      range: '10-80 mg/100g',
      color: 'text-gray-900',
      textColor: 'text-gray-900',
      suggestion: 'Natural umami perception. Add mild umami boosters for better balance.'
    }
  }
  
  if (mgPer100g >= 80 && mgPer100g < 300) {
    return {
      level: 'culinary-optimal',
      name: 'Culinary Optimal',
      range: '80-300 mg/100g',
      color: 'text-gray-900',
      textColor: 'text-gray-900',
      suggestion: 'Ideal balanced flavor zone. Maintain the current balance for best results.'
    }
  }
  
  if (mgPer100g >= 300 && mgPer100g < 500) {
    return {
      level: 'strong',
      name: 'Strong Umami',
      range: '300-500 mg/100g',
      color: 'text-red-600',
      textColor: 'text-red-600',
      suggestion: 'Very rich flavor near the practical upper culinary limit. Consider slightly reducing umami-heavy ingredients.'
    }
  }
  
  if (mgPer100g >= 500 && mgPer100g < 2600) {
    return {
      level: 'overlimit',
      name: 'Overlimit Zone',
      range: '500-2600 mg/100g',
      color: 'text-red-600',
      textColor: 'text-red-600',
      suggestion: 'Exceeding normal culinary range. Reduce umami-rich ingredients significantly to restore balance.'
    }
  }
  
  // >= 2600
  return {
    level: 'theoretical-max',
    name: 'Theoretical Maximum',
    range: '2600-3300 mg/100g',
    color: 'text-red-600',
    textColor: 'text-red-600',
    suggestion: 'Deep umami saturation. Use dilution or add contrasting flavors for better harmony and complexity.'
  }
}

/**
 * Backend already stores values in mg/100g, so this is just a pass-through
 * for backwards compatibility
 */
export function gToMg(mgValue: number): number {
  return mgValue
}

/**
 * Format umami value for display in mg/100g
 */
export function formatUmamiMg(mgPer100g: number): string {
  if (mgPer100g < 1) {
    return mgPer100g.toFixed(2)
  }
  if (mgPer100g < 10) {
    return mgPer100g.toFixed(1)
  }
  return Math.round(mgPer100g).toString()
}

/**
 * Get color class for umami value based on level
 */
export function getUmamiColor(mgPer100g: number): string {
  const level = getUmamiLevel(mgPer100g)
  return level.textColor
}
