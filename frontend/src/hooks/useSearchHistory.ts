const STORAGE_KEY = 'foodalchemy_historial'
const MAX = 8

export function getSearchHistory(): string[][] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveSearchHistory(ingredientes: string[]) {
  if (ingredientes.length === 0) return
  const hist = getSearchHistory().filter((h) => h.join('|') !== ingredientes.join('|'))
  hist.unshift([...ingredientes])
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hist.slice(0, MAX)))
}

export function clearSearchHistory() {
  localStorage.removeItem(STORAGE_KEY)
}
