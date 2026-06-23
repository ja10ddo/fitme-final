import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from './App'
import { defaultEquipmentAccess } from './setupOptions'

describe('FitMe UI flow smoke coverage', () => {
  it('renders the primary app shell and onboarding entry points without stored data', () => {
    const html = renderToString(<App />)

    expect(html).toContain('FitMe')
    expect(html).toContain('Adaptive fitness coach')
    expect(html).toContain('Build My Plan')
    expect(html).toContain('Marathon')
    expect(html).toContain('Hyrox')
  })

  it('starts setup equipment as a deselect flow with a select-all recovery action', () => {
    const commercialGym = defaultEquipmentAccess('commercial gym')

    expect(commercialGym).toContain('barbell_rack')
    expect(commercialGym).toContain('battle_ropes')
    expect(commercialGym.length).toBeGreaterThan(20)
  })
})
