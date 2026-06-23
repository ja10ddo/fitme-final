import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccount, loadData, saveData } from './storage'

const makeLocalStorage = () => {
  const store = new Map()
  return {
    get length() {
      return store.size
    },
    getItem: vi.fn((key) => store.get(key) ?? null),
    setItem: vi.fn((key, value) => {
      store.set(key, String(value))
    }),
    removeItem: vi.fn((key) => {
      store.delete(key)
    }),
    key: vi.fn((index) => Array.from(store.keys())[index] ?? null),
    dump: () => Object.fromEntries(store.entries()),
  }
}

describe('FitMe local storage resilience', () => {
  let originalLocalStorage

  beforeEach(() => {
    originalLocalStorage = globalThis.localStorage
    globalThis.localStorage = makeLocalStorage()
  })

  afterEach(() => {
    globalThis.localStorage = originalLocalStorage
    vi.restoreAllMocks()
  })

  it('returns isolated empty data when no saved data exists', () => {
    const first = loadData()
    const second = loadData()

    first.programs.push({ id: 'mutated' })

    expect(second.programs).toEqual([])
    expect(second.schemaVersion).toBe(2)
  })

  it('backs up corrupted data and returns a recovery notice', () => {
    globalThis.localStorage.setItem('fitme:data:v1', '{broken json')

    const data = loadData()
    const keys = Object.keys(globalThis.localStorage.dump())

    expect(data.programs).toEqual([])
    expect(data.recoveryNotice).toContain('Recovered from corrupted local data')
    expect(keys.some((key) => key.startsWith('fitme:data:corrupt:'))).toBe(true)
    expect(globalThis.localStorage.getItem('fitme:data:v1')).toBeNull()
  })

  it('returns a visible failure message when browser storage rejects saves', () => {
    globalThis.localStorage.setItem.mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    const result = saveData({ programs: [{ id: 'plan-1' }] })

    expect(result.ok).toBe(false)
    expect(result.message).toContain('could not save')
  })

  it('clears primary data and corrupt backup copies during account deletion', () => {
    globalThis.localStorage.setItem('fitme:data:v1', '{}')
    globalThis.localStorage.setItem('fitme:data:corrupt:2026-01-01', '{}')
    globalThis.localStorage.setItem('unrelated', 'keep')

    clearAccount()

    expect(globalThis.localStorage.getItem('fitme:data:v1')).toBeNull()
    expect(globalThis.localStorage.getItem('fitme:data:corrupt:2026-01-01')).toBeNull()
    expect(globalThis.localStorage.getItem('unrelated')).toBe('keep')
  })
})
