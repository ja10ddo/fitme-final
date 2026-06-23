const STORAGE_KEY = 'fitme:data:v1'
const CORRUPT_BACKUP_PREFIX = 'fitme:data:corrupt:'
const DATA_SCHEMA_VERSION = 2

export const initialData = {
  schemaVersion: DATA_SCHEMA_VERSION,
  profile: null,
  programs: [],
  savedWorkouts: [],
  logs: [],
  prs: [],
  measurements: [],
  achievements: [],
  unit: 'lbs',
}

const freshInitialData = (extra = {}) => ({
  ...initialData,
  programs: [],
  savedWorkouts: [],
  logs: [],
  prs: [],
  measurements: [],
  achievements: [],
  ...extra,
})

export const loadData = () => {
  if (typeof localStorage === 'undefined') return freshInitialData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshInitialData()
    const parsed = JSON.parse(raw)
    return {
      ...freshInitialData(),
      ...parsed,
      schemaVersion: DATA_SCHEMA_VERSION,
      programs: Array.isArray(parsed.programs) ? parsed.programs : [],
      savedWorkouts: Array.isArray(parsed.savedWorkouts) ? parsed.savedWorkouts : [],
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      prs: Array.isArray(parsed.prs) ? parsed.prs : [],
      measurements: Array.isArray(parsed.measurements) ? parsed.measurements : [],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
    }
  } catch (error) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) localStorage.setItem(`${CORRUPT_BACKUP_PREFIX}${new Date().toISOString()}`, raw)
      localStorage.removeItem(STORAGE_KEY)
      console.warn('FitMe recovered from corrupted local data.', error)
    } catch {
      // Ignore recovery failures and return a clean state.
    }
    return freshInitialData({ recoveryNotice: 'Recovered from corrupted local data. A backup copy was kept in localStorage when possible.' })
  }
}

export const saveData = (data) => {
  if (typeof localStorage === 'undefined') return { ok: true }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, schemaVersion: DATA_SCHEMA_VERSION }))
    return { ok: true }
  } catch (error) {
    console.warn('FitMe could not save local data.', error)
    return {
      ok: false,
      message: 'FitMe could not save on this device. Export your data, then free storage or check browser privacy settings.',
    }
  }
}

export const exportJson = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `fitme-export-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const clearAccount = () => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(CORRUPT_BACKUP_PREFIX)) localStorage.removeItem(key)
  }
}
