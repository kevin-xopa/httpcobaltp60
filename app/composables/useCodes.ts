import { codes, getCodeByNumber, getCodesByCategory } from '~/data/codes'
import type { HTTPCode } from '~/data/codes'
import type { Category } from '~/composables/useCategories'

export function useCodes() {
  const allCodes = codes

  function searchCodes(query: string, category?: Category['id']): HTTPCode[] {
    let filtered = allCodes

    if (category) {
      filtered = getCodesByCategory(category)
    }

    if (!query.trim()) return filtered

    const q = query.toLowerCase().trim()

    return filtered.filter((c) => {
      return (
        c.code.toString().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.mexicanContext.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.mexican.toLowerCase().includes(q)
      )
    })
  }

  function getAdjacentCodes(code: number): { prev: HTTPCode | null; next: HTTPCode | null } {
    const index = allCodes.findIndex(c => c.code === code)
    return {
      prev: index > 0 ? allCodes[index - 1] : null,
      next: index < allCodes.length - 1 ? allCodes[index + 1] : null,
    }
  }

  function getFeaturedCodes(): HTTPCode[] {
    const featured = [404, 500, 200, 301, 422, 418, 503, 451]
    return featured
      .map(code => getCodeByNumber(code))
      .filter((c): c is HTTPCode => c !== undefined)
  }

  return {
    allCodes,
    searchCodes,
    getCodeByNumber,
    getCodesByCategory,
    getAdjacentCodes,
    getFeaturedCodes,
  }
}
