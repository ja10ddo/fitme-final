const id = (prefix) => `${prefix}_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`

export const EVENT_META = {
  none: { label: 'None', focus: 'General performance' },
  '5k': { label: '5K', runDays: 3, longRun: 4, peak: 6, focus: 'speed endurance' },
  '10k': { label: '10K', runDays: 3, longRun: 5, peak: 8, focus: 'threshold pacing' },
  half: { label: 'Half Marathon', runDays: 4, longRun: 7, peak: 12, focus: 'aerobic durability' },
  marathon: { label: 'Marathon', runDays: 4, longRun: 9, peak: 20, focus: 'long-run progression' },
  triathlon: { label: 'Triathlon', runDays: 2, longRun: 5, peak: 10, focus: 'swim-bike-run balance' },
  hyrox: { label: 'Hyrox', runDays: 2, longRun: 4, peak: 7, focus: 'compromised running and work capacity' },
  crossfit: { label: 'CrossFit', runDays: 1, longRun: 3, peak: 5, focus: 'mixed modal power' },
}

export const RESEARCH_RULES = {
  health: {
    label: 'HHS adult activity target',
    source: 'Physical Activity Guidelines for Americans, 2nd ed.',
    prescription: 'Build toward 150-300 min/week moderate aerobic activity plus 2+ days/week major-muscle strengthening.',
  },
  olderAdult: {
    label: 'Older-adult multicomponent training',
    source: 'Physical Activity Guidelines for Americans, 2nd ed.',
    prescription: 'Include aerobic, strengthening, mobility, and balance work; scale effort to current fitness.',
  },
  chronicCondition: {
    label: 'Chronic-condition safety',
    source: 'Physical Activity Guidelines for Americans, 2nd ed.',
    prescription: 'Start low, progress gradually, choose safer activities, and stay within clinician guidance.',
  },
  strength: {
    label: 'Strength prescription heuristic',
    source: 'ACSM/NSCA-style resistance training practice',
    prescription: 'Prioritize specific compound patterns, lower reps, longer rests, and progressive overload.',
  },
  hypertrophy: {
    label: 'Hypertrophy prescription heuristic',
    source: 'ACSM/NSCA-style resistance training practice',
    prescription: 'Use moderate reps, repeated hard sets, and enough weekly volume for the target muscles.',
  },
  enduranceEvent: {
    label: 'Endurance event progression',
    source: 'Endurance coaching consensus and taper literature',
    prescription: 'Build aerobic volume progressively, protect recovery, peak before the event, then taper into race week.',
  },
  powerSport: {
    label: 'Sport power and in-season fatigue management',
    source: 'Strength and conditioning practice',
    prescription: 'Keep power work high quality, low fatigue, and capped during in-season periods.',
  },
}

export const SPORT_PROFILES = {
  none: { label: 'None', qualities: ['balanced strength', 'conditioning'] },
  basketball: { label: 'Basketball', qualities: ['vertical power', 'ankle stiffness', 'repeat sprint ability'] },
  volleyball: { label: 'Volleyball', qualities: ['vertical power', 'landing mechanics', 'shoulder durability', 'lateral quickness'] },
  soccer: { label: 'Soccer', qualities: ['single-leg strength', 'hamstring resilience', 'aerobic repeatability'] },
  hockey: { label: 'Hockey', qualities: ['lateral power', 'adductor resilience', 'trunk rotation'] },
  football: { label: 'Football', qualities: ['acceleration', 'neck and trunk strength', 'power'] },
  baseball: { label: 'Baseball', qualities: ['rotational power', 'shoulder control', 'posterior chain'] },
  tennis: { label: 'Tennis', qualities: ['lateral deceleration', 'rotational control', 'shoulder durability'] },
  golf: { label: 'Golf', qualities: ['hip rotation', 'anti-rotation strength', 'posterior chain'] },
  running: { label: 'Running', qualities: ['calf capacity', 'hip stability', 'aerobic base'] },
  cycling: { label: 'Cycling', qualities: ['quad endurance', 'hip mobility', 'trunk stamina'] },
  swimming: { label: 'Swimming', qualities: ['lat strength', 'shoulder control', 'breathing rhythm'] },
  combat: { label: 'Combat Sports', qualities: ['grip strength', 'neck strength', 'anaerobic repeatability'] },
}

const asArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  return value ? [value] : []
}

const selectedSports = (profile) => asArray(profile.sport).filter((sport) => sport && sport !== 'none')

const customSportProfile = (sportText = '') => {
  const label = sportText.trim().slice(0, 60)
  if (!label) return null
  const lower = label.toLowerCase()
  const matched =
    lower.includes('volley') ? ['vertical power', 'landing mechanics', 'shoulder durability', 'lateral quickness']
    : lower.includes('rugby') || lower.includes('lacrosse') ? ['contact resilience', 'acceleration', 'rotational power']
    : lower.includes('dance') || lower.includes('gymnast') || lower.includes('cheer') ? ['single-leg control', 'mobility', 'core stiffness']
    : lower.includes('martial') || lower.includes('boxing') || lower.includes('wrestling') ? ['grip strength', 'neck strength', 'anaerobic repeatability']
    : lower.includes('track') || lower.includes('sprint') ? ['acceleration', 'posterior chain power', 'elastic stiffness']
    : lower.includes('pickle') || lower.includes('badminton') || lower.includes('racquet') ? ['lateral deceleration', 'rotational control', 'shoulder durability']
    : ['balanced strength', 'joint resilience', 'conditioning']
  return { label, qualities: matched }
}

const sportDetails = (profile) => {
  const sports = selectedSports(profile).filter((sport) => sport !== 'other')
  const custom = customSportProfile(profile.customSport || profile.sportOther || '')
  if (!sports.length && !custom) return { label: 'None', qualities: ['balanced strength', 'conditioning'] }
  const profiles = sports.map((sport) => SPORT_PROFILES[sport]).filter(Boolean)
  if (custom) profiles.push(custom)
  return {
    label: profiles.map((sport) => sport.label).join(' + '),
    qualities: [...new Set(profiles.flatMap((sport) => sport.qualities))],
  }
}

const EX_POOL = {
  squat: [
    'Back Squat',
    'Front Squat',
    'Goblet Squat',
    'Chair Squat',
    'Assisted Squat',
    'Box Squat',
    'Safety Bar Squat',
    'Rear-Foot Elevated Split Squat',
  ],
  hinge: ['Romanian Deadlift', 'Trap Bar Deadlift', 'Hip Thrust', 'Cable Pull-Through', 'Kettlebell Swing', 'Banded Glute Bridge'],
  push: [
    'Bench Press',
    'Incline Dumbbell Press',
    'Machine Chest Press',
    'Cable Fly',
    'Pec Deck',
    'Decline Push-Up',
    'Push-Up',
    'Landmine Press',
    'Band Chest Press',
    'Low-to-High Band Fly',
  ],
  pull: ['Pull-Up', 'Lat Pulldown', 'Chest-Supported Row', 'Cable Row', 'Single-Arm Dumbbell Row', 'Seated Machine Row', 'Face Pull', 'Band Row'],
  overhead: ['Dumbbell Shoulder Press', 'Half-Kneeling Landmine Press', 'Machine Shoulder Press', 'Pike Push-Up', 'Band Face Pull'],
  arms: ['Cable Triceps Pressdown', 'Dumbbell Curl', 'Hammer Curl', 'Overhead Triceps Extension', 'EZ-Bar Curl', 'Band Curl', 'Band Triceps Pressdown'],
  core: ['Dead Bug', 'Pallof Press', 'Side Plank', 'Cable Chop', 'Farmer Carry'],
  legs: ['Walking Lunge', 'Step-Up', 'Leg Press', 'Hamstring Curl', 'Calf Raise', 'Banded Lateral Walk'],
  cardio: ['Zone 2 Run', 'Low-Impact Bike', 'Bike Intervals', 'Rower Intervals', 'Incline Walk', 'SkiErg Intervals', 'Brisk Walk Intervals'],
  mobility: ['Couch Stretch', 'Hip Airplane', 'Thoracic Rotation', 'Ankle Rocks', 'Banded Shoulder External Rotation'],
  balance: ['Sit-to-Stand', 'Supported Single-Leg Balance', 'Heel-to-Toe Walk', 'Farmer Carry March', 'Step-Down Control'],
}

const LIMITATION_RULES = {
  shoulder: ['bench', 'press', 'fly', 'pec deck', 'pull-up', 'pulldown', 'shoulder', 'pike', 'push-up', 'external rotation'],
  knee: ['squat', 'lunge', 'step-up', 'leg press', 'box squat', 'safety bar', 'split squat'],
  back: ['back squat', 'deadlift', 'romanian deadlift', 'kettlebell swing', 'good morning'],
  wrist: ['push-up', 'front squat', 'bench press', 'farmer carry'],
  ankle: ['run', 'jump', 'lunge', 'step-up', 'calf raise'],
  arthritis: ['jump', 'run', 'burpee'],
  obesity: ['jump', 'burpee', 'zone 2 run'],
  sedentary: ['jump', 'burpee', 'sprint'],
  rotator: ['bench', 'press', 'fly', 'pec deck', 'pull-up', 'pulldown', 'push-up', 'shoulder press', 'pike', 'overhead'],
}

const AVOID_KEYWORDS = {
  squat: ['squat'],
  squats: ['squat'],
  lunge: ['lunge'],
  lunges: ['lunge'],
  running: ['run', 'zone 2 run'],
  run: ['run', 'zone 2 run'],
  jumping: ['jump'],
  pressing: ['press'],
  press: ['press'],
  deadlift: ['deadlift'],
  deadlifts: ['deadlift'],
}

const EQUIPMENT_BLOCKS = {
  bands: ['barbell', 'bench press', 'dumbbell', 'machine', 'cable', 'trap bar', 'lat pulldown', 'leg press', 'ski', 'rower'],
  bodyweight: ['barbell', 'bench press', 'dumbbell', 'machine', 'cable', 'trap bar', 'lat pulldown', 'leg press', 'band', 'ski', 'rower'],
  dumbbells: ['barbell', 'machine', 'cable', 'trap bar', 'lat pulldown', 'leg press', 'ski', 'rower'],
  'apartment/minimal': ['barbell', 'machine', 'cable', 'trap bar', 'lat pulldown', 'leg press', 'ski', 'rower', 'sled'],
  'hotel/travel': ['barbell', 'trap bar', 'sled', 'ski'],
  'outdoor/track': ['barbell', 'bench press', 'dumbbell', 'machine', 'cable', 'trap bar', 'lat pulldown', 'leg press', 'ski', 'rower'],
}

const EQUIPMENT_PREFERENCES = {
  squat: [
    { keys: ['hack_squat'], name: 'Hack Squat' },
    { keys: ['leg_press'], name: 'Leg Press' },
    { keys: ['barbell_rack', 'rack_barbell', 'squat_stands', 'olympic_barbell'], name: 'Back Squat' },
    { keys: ['smith_machine'], name: 'Smith Machine Squat' },
    { keys: ['adjustable_dumbbells', 'fixed_dumbbells', 'dumbbells', 'hotel_dumbbells'], name: 'Goblet Squat' },
  ],
  hinge: [
    { keys: ['trap_bar'], name: 'Trap Bar Deadlift' },
    { keys: ['barbell_rack', 'rack_barbell', 'olympic_barbell'], name: 'Romanian Deadlift' },
    { keys: ['kettlebells'], name: 'Kettlebell Swing' },
    { keys: ['cables'], name: 'Cable Pull-Through' },
    { keys: ['bands', 'loop_bands', 'long_resistance_band'], name: 'Banded Glute Bridge' },
  ],
  push: [
    { keys: ['barbell_rack', 'rack_barbell', 'olympic_barbell'], name: 'Bench Press' },
    { keys: ['adjustable_dumbbells', 'fixed_dumbbells', 'dumbbells', 'hotel_dumbbells'], name: 'Incline Dumbbell Press' },
    { keys: ['chest_press_machine', 'machines', 'selectorized_machines'], name: 'Machine Chest Press' },
    { keys: ['cables'], name: 'Cable Fly' },
    { keys: ['machines', 'selectorized_machines'], name: 'Pec Deck' },
    { keys: ['bench', 'incline_bench'], name: 'Decline Push-Up' },
    { keys: ['adjustable_dumbbells', 'fixed_dumbbells', 'dumbbells'], name: 'Dumbbell Fly' },
    { keys: ['landmine'], name: 'Landmine Press' },
    { keys: ['bands', 'handled_bands'], name: 'Band Chest Press' },
    { keys: ['bands', 'handled_bands'], name: 'Low-to-High Band Fly' },
  ],
  pull: [
    { keys: ['lat_pulldown'], name: 'Lat Pulldown' },
    { keys: ['seated_row_machine', 'cables'], name: 'Cable Row' },
    { keys: ['machines', 'selectorized_machines'], name: 'Seated Machine Row' },
    { keys: ['cables', 'bands', 'handled_bands'], name: 'Face Pull' },
    { keys: ['pullup_bar', 'rig'], name: 'Pull-Up' },
    { keys: ['rings', 'trx', 'suspension_trainer'], name: 'Ring Row' },
    { keys: ['adjustable_dumbbells', 'fixed_dumbbells', 'dumbbells'], name: 'Single-Arm Dumbbell Row' },
    { keys: ['bands', 'handled_bands'], name: 'Band Row' },
  ],
  overhead: [
    { keys: ['shoulder_press_machine', 'machines'], name: 'Machine Shoulder Press' },
    { keys: ['adjustable_dumbbells', 'fixed_dumbbells', 'dumbbells'], name: 'Dumbbell Shoulder Press' },
    { keys: ['landmine'], name: 'Half-Kneeling Landmine Press' },
    { keys: ['bands', 'mini_bands', 'handled_bands'], name: 'Band Face Pull' },
  ],
  arms: [
    { keys: ['cables'], name: 'Cable Triceps Pressdown' },
    { keys: ['ez_bar'], name: 'EZ-Bar Curl' },
    { keys: ['adjustable_dumbbells', 'fixed_dumbbells', 'dumbbells', 'hotel_dumbbells'], name: 'Dumbbell Curl' },
    { keys: ['adjustable_dumbbells', 'fixed_dumbbells', 'dumbbells', 'hotel_dumbbells'], name: 'Hammer Curl' },
    { keys: ['bands', 'handled_bands'], name: 'Band Curl' },
    { keys: ['bands', 'handled_bands'], name: 'Band Triceps Pressdown' },
  ],
  core: [
    { keys: ['sled'], name: 'Sled Drag' },
    { keys: ['sandbag'], name: 'Sandbag Bear-Hug Carry' },
    { keys: ['kettlebells', 'dumbbells', 'adjustable_dumbbells'], name: 'Farmer Carry' },
    { keys: ['cables'], name: 'Cable Chop' },
    { keys: ['bands', 'handled_bands'], name: 'Pallof Press' },
  ],
  legs: [
    { keys: ['leg_extension'], name: 'Leg Extension' },
    { keys: ['hamstring_curl'], name: 'Hamstring Curl' },
    { keys: ['plyo_box'], name: 'Step-Up' },
    { keys: ['leg_press'], name: 'Leg Press' },
    { keys: ['bands', 'mini_bands', 'hip_circle'], name: 'Banded Lateral Walk' },
  ],
  cardio: [
    { keys: ['ski_erg'], name: 'SkiErg Intervals' },
    { keys: ['rower'], name: 'Rower Intervals' },
    { keys: ['assault_bike', 'bike'], name: 'Bike Intervals' },
    { keys: ['treadmill'], name: 'Incline Walk' },
    { keys: ['track', 'open_space'], name: 'Brisk Walk Intervals' },
  ],
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

const parseDateInput = (date) => {
  if (!date) return null
  if (date instanceof Date) return Number.isNaN(date.getTime()) ? null : new Date(date)
  const parts = String(date).split('-').map(Number)
  if (parts.length === 3 && parts.every(Number.isFinite)) return new Date(parts[0], parts[1] - 1, parts[2])
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const weeksUntil = (date, now = new Date()) => {
  const target = parseDateInput(date)
  if (!target) return null
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate())
  const exactWeeks = (targetUtc - todayUtc) / MS_PER_WEEK
  const roundedWeeks = Math.round(exactWeeks)
  return Math.max(0, Math.abs(exactWeeks - roundedWeeks) < 0.001 ? roundedWeeks : Math.ceil(exactWeeks))
}

export const eventPlanMeta = (profile, now = new Date()) => {
  const event = EVENT_META[profile.eventGoal || 'none']
  const hasEvent = Boolean(profile.eventGoal && profile.eventGoal !== 'none')
  const weeksToEvent = hasEvent ? weeksUntil(profile.eventDate, now) : null
  const minWeeks = profile.eventGoal === 'marathon' ? 16 : profile.eventGoal === 'half' || profile.eventGoal === 'triathlon' ? 12 : 8
  const planWeeks = hasEvent && weeksToEvent ? Math.max(4, Math.min(weeksToEvent, 32)) : 12
  let readiness = 'standard'
  if (hasEvent && weeksToEvent !== null && weeksToEvent < 4) readiness = 'too-soon'
  else if (hasEvent && weeksToEvent !== null && weeksToEvent < minWeeks) readiness = 'compressed'
  return {
    event,
    hasEvent,
    weeksToEvent,
    minWeeks,
    planWeeks,
    readiness,
    eventDate: profile.eventDate || '',
  }
}

const phaseForWeek = (week) => {
  if (week <= 3) return { name: 'Base', color: '#60A5FA', intensity: 0.9, volume: 1 }
  if (week === 4) return { name: 'Deload', color: '#22C55E', intensity: 0.75, volume: 0.65 }
  if (week <= 7) return { name: 'Build', color: '#A78BFA', intensity: 1, volume: 1.1 }
  if (week === 8) return { name: 'Deload', color: '#22C55E', intensity: 0.78, volume: 0.7 }
  if (week <= 11) return { name: 'Peak', color: '#F472B6', intensity: 1.08, volume: 0.9 }
  return { name: 'Test', color: '#FB923C', intensity: 0.95, volume: 0.6 }
}

const eventPhaseForWeek = (week, totalWeeks) => {
  if (week === totalWeeks) return { name: 'Race', color: '#C8FF00', intensity: 0.35, volume: 0.25 }
  if (week >= totalWeeks - 1) return { name: 'Taper', color: '#22C55E', intensity: 0.6, volume: 0.5 }
  if (week >= Math.max(1, totalWeeks - 4)) return { name: 'Peak', color: '#F472B6', intensity: 1.05, volume: 0.95 }
  if (week <= Math.ceil(totalWeeks * 0.35)) return { name: 'Base', color: '#60A5FA', intensity: 0.85, volume: 0.9 }
  return { name: 'Build', color: '#A78BFA', intensity: 0.95, volume: 1.05 }
}

const unsafeForLimitations = (name, limitations = '') => {
  const lower = limitations.toLowerCase()
  const exerciseName = name.toLowerCase()
  const injuryBlocked = Object.entries(LIMITATION_RULES).some(([key, blocked]) => {
    return lower.includes(key) && blocked.some((term) => exerciseName.includes(term))
  })
  const explicitAvoid = Object.entries(AVOID_KEYWORDS).some(([word, blocked]) => {
    return lower.includes(`avoid ${word}`) && blocked.some((term) => exerciseName.includes(term))
  })
  return injuryBlocked || explicitAvoid
}

const equipmentText = (profile) => `${profile.equipment || ''} ${asArray(profile.equipmentAccess).join(' ')} ${profile.equipmentDetail || ''}`.toLowerCase()

const hasEquipment = (profile, keys) => {
  const text = equipmentText(profile)
  return keys.some((key) => text.includes(key.replaceAll('_', ' ')) || text.includes(key.toLowerCase()))
}

const unavailableForEquipment = (name, profile = {}) => {
  const lowerEquipment = typeof profile === 'string' ? profile.toLowerCase() : (profile.equipment || '').toLowerCase()
  const exerciseName = name.toLowerCase()
  const blocked = Object.entries(EQUIPMENT_BLOCKS).find(([key]) => lowerEquipment.includes(key))?.[1] ?? []
  return blocked.some((term) => exerciseName.includes(term))
}

const preferredEquipmentExercise = (category, profile, shift = 0, excluded = []) => {
  const preferences = EQUIPMENT_PREFERENCES[category] ?? []
  const available = preferences.filter((item) => hasEquipment(profile, item.keys))
  if (!available.length) return null
  const blocked = new Set(excluded.map((name) => name.toLowerCase()))
  for (let index = 0; index < available.length; index += 1) {
    const candidate = available[(index + shift) % available.length].name
    if (!blocked.has(candidate.toLowerCase()) && !unsafeForLimitations(candidate, profile.limitations) && !unavailableForEquipment(candidate, profile)) return candidate
  }
  return null
}

const fallbackExercise = (category, profile) => {
  const lower = (profile.limitations || '').toLowerCase()
  if (category === 'cardio') return lower.includes('knee') || lower.includes('obesity') ? 'Low-Impact Bike' : 'Brisk Walk Intervals'
  if (category === 'squat' || category === 'legs') return lower.includes('knee') ? 'Seated Hamstring Curl' : 'Sit-to-Stand'
  if (category === 'push' || category === 'overhead') return lower.includes('shoulder') || lower.includes('rotator') ? 'Isometric Wall Press' : 'Incline Push-Up'
  if (category === 'pull') return lower.includes('shoulder') || lower.includes('rotator') ? 'Band Row to Ribs' : 'Band Row'
  if (category === 'hinge') return lower.includes('back') ? 'Glute Bridge' : 'Hip Hinge Drill'
  if (category === 'balance') return 'Supported Single-Leg Balance'
  return 'Dead Bug'
}

const profileFlags = (profile) => {
  const text = `${profile.limitations || ''} ${profile.goal || ''} ${profile.focus || ''}`.toLowerCase()
  const age = Number(profile.age)
  return {
    beginner: profile.level === 'beginner',
    olderAdult: Number.isFinite(age) && age >= 60,
    teen: Number.isFinite(age) && age < 18,
    shortSession: /15|20/.test(profile.duration || ''),
    medicalRisk: ['hypertension', 'diabetes', 'obesity', 'sedentary', 'arthritis'].some((term) => text.includes(term)),
    inSeason: profile.seasonPhase === 'in-season',
    powerGoal: String(profile.goal || '').includes('power') || String(profile.goal || '').includes('sport_power'),
    healthGoal: String(profile.goal || '').includes('health') || String(profile.goal || '').includes('fat_loss') || String(profile.goal || '').includes('independence'),
  }
}

const goalText = (profile) => (Array.isArray(profile.goal) ? profile.goal.join(' ') : profile.goal || '')

const researchTagsForProfile = (profile) => {
  const flags = profileFlags(profile)
  const goal = goalText(profile)
  const tags = new Set()
  if (goal.includes('health') || goal.includes('fat_loss') || goal.includes('independence')) tags.add('health')
  if (goal.includes('strength')) tags.add('strength')
  if (goal.includes('muscle')) tags.add('hypertrophy')
  if (goal.includes('endurance') || (profile.eventGoal && profile.eventGoal !== 'none')) tags.add('enduranceEvent')
  if (goal.includes('power') || goal.includes('sport_power')) tags.add('powerSport')
  if (flags.olderAdult) tags.add('olderAdult')
  if (flags.medicalRisk || flags.beginner) tags.add('chronicCondition')
  return [...tags]
}

export const safeExercise = (category, profile, shift = 0, excluded = []) => {
  if (category === 'cardio' && /knee|obesity|arthritis|sedentary/i.test(profile.limitations || '')) return 'Low-Impact Bike'
  const preferred = preferredEquipmentExercise(category, profile, shift, excluded)
  if (preferred) return preferred
  const pool = EX_POOL[category] ?? EX_POOL.core
  const blocked = new Set(excluded.map((name) => name.toLowerCase()))
  for (let index = 0; index < pool.length; index += 1) {
    const candidate = pool[(index + shift) % pool.length]
    if (!blocked.has(candidate.toLowerCase()) && !unsafeForLimitations(candidate, profile.limitations) && !unavailableForEquipment(candidate, profile)) {
      return candidate
    }
  }
  return fallbackExercise(category, profile)
}

const safeUniqueExercise = (category, profile, shift = 0, excluded = [], used = new Set()) => {
  const usedNames = [...used]
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = safeExercise(category, profile, shift + attempt, [...excluded, ...usedNames])
    if (!used.has(candidate)) return candidate
  }
  return safeExercise(category, profile, shift, excluded)
}

export const validateProfile = (profile) => {
  const errors = []
  if (profile.age !== undefined && profile.age !== '' && (Number(profile.age) < 13 || Number(profile.age) > 100)) {
    errors.push('Age must be between 13 and 100.')
  }
  if (asArray(profile.sport).includes('other') && !(profile.customSport || profile.sportOther || '').trim()) {
    errors.push('Enter the sport that is not listed.')
  }
  if (!Number.isFinite(Number(profile.days)) || Number(profile.days) < 2 || Number(profile.days) > 6) {
    errors.push('Training days must be between 2 and 6.')
  }
  if (profile.exercisesPerDay !== undefined && profile.exercisesPerDay !== '' && (Number(profile.exercisesPerDay) < 6 || Number(profile.exercisesPerDay) > 12)) {
    errors.push('Exercises per day must be between 6 and 12.')
  }
  if ((profile.limitations || '').length > 500) {
    errors.push('Limitations must be 500 characters or less.')
  }
  if (profile.duration === '5 min/week') {
    errors.push('Five minutes per week is below the minimum effective dose. Choose 15-20 min and start with two short sessions.')
  }
  if (profile.eventDate) {
    const eventDate = parseDateInput(profile.eventDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (!eventDate || eventDate < today) {
      errors.push('Event date must be today or later.')
    }
  }
  const meta = eventPlanMeta(profile)
  if (meta.hasEvent && !profile.eventDate) {
    errors.push('Event date is required for event-specific plans.')
  }
  if (meta.hasEvent && meta.readiness === 'too-soon') {
    errors.push(`${meta.event.label} is less than 4 weeks away. Choose a later event or generate a maintenance plan.`)
  }
  return errors
}

export const normalizeProfile = (profile) => ({
  ...profile,
  goal: asArray(profile.goal).length ? asArray(profile.goal) : ['health'],
  sport: selectedSports(profile).length ? selectedSports(profile) : ['none'],
  customSport: (profile.customSport || profile.sportOther || '').trim().slice(0, 60),
  age: profile.age === undefined || profile.age === '' ? undefined : Number(profile.age),
  gender: profile.gender || 'prefer not to say',
  bodyType: profile.bodyType || 'average',
  days: Math.max(2, Math.min(Number(profile.days) || 4, profile.seasonPhase === 'in-season' || Number(profile.age) < 18 ? 4 : 6)),
  exercisesPerDay: Math.max(6, Math.min(Number(profile.exercisesPerDay) || 6, 12)),
  split: asArray(profile.split).length ? asArray(profile.split) : ['upper_lower'],
  equipmentAccess: asArray(profile.equipmentAccess).slice(0, 24),
  equipmentDetail: (profile.equipmentDetail || '').trim().slice(0, 500),
  limitations: (profile.limitations || '').trim().slice(0, 500),
})

export const programSignature = (profile) => {
  const clean = normalizeProfile(profile)
  return [
    Array.isArray(clean.goal) ? clean.goal.join('+') : clean.goal,
    asArray(clean.sport).join('+'),
    clean.customSport.toLowerCase(),
    clean.eventGoal,
    clean.equipment,
    asArray(clean.equipmentAccess).join('+').toLowerCase(),
    clean.equipmentDetail.toLowerCase(),
    clean.days,
    clean.duration,
    asArray(clean.split).join('+'),
    clean.exercisesPerDay,
    clean.level,
    clean.limitations.toLowerCase(),
  ].join('|')
}

const repScheme = (profile, week) => {
  const phase = phaseForWeek(week)
  const goal = goalText(profile)
  const flags = profileFlags(profile)
  let scheme = { sets: 3, reps: '6-10', rest: 120 }
  if (goal.includes('strength')) scheme = phase.name === 'Peak' && !flags.medicalRisk ? { sets: 4, reps: '3-5', rest: 180 } : { sets: 4, reps: '5-8', rest: 150 }
  if (goal.includes('muscle')) scheme = { sets: phase.name === 'Deload' ? 2 : 3, reps: '8-12', rest: 90 }
  if (goal.includes('endurance') || goal.includes('fat_loss') || goal.includes('health')) scheme = { sets: 2, reps: '10-15', rest: 60 }
  if (goal.includes('power') || goal.includes('sport_power')) scheme = { sets: flags.inSeason ? 2 : 3, reps: '3-6 fast', rest: 120 }
  if (goal.includes('independence')) scheme = { sets: 2, reps: '8-12 controlled', rest: 75 }
  if (flags.beginner || flags.olderAdult || flags.medicalRisk || flags.shortSession) {
    scheme = { ...scheme, sets: Math.max(1, scheme.sets - 1), rest: Math.min(scheme.rest, 90) }
  }
  return scheme
}

const goalFlags = (profile) => {
  const goal = goalText(profile)
  return {
    strength: goal.includes('strength'),
    muscle: goal.includes('muscle'),
    endurance: goal.includes('endurance'),
    fatLoss: goal.includes('fat_loss'),
    health: goal.includes('health'),
    power: goal.includes('power') || goal.includes('sport_power'),
    independence: goal.includes('independence'),
  }
}

const exercise = (name, scheme, notes = '', category = 'general', logType = 'sets') => ({
  id: id('ex'),
  name,
  category,
  logType,
  sets: scheme.sets,
  reps: scheme.reps,
  rest: scheme.rest,
  notes,
})

const eventExercise = (name, prescription, notes = '', category = 'event') => exercise(name, { sets: prescription.sets ?? 1, reps: prescription.reps, rest: prescription.rest ?? 0 }, notes, category, prescription.logType ?? 'performance')

export const sessionDurationLimit = (duration = '') => {
  if (/15|20/.test(duration)) return 20
  if (/30|40/.test(duration)) return 40
  if (/60/.test(duration)) return 60
  return 50
}

const minutesFromRepText = (reps = '') => {
  const text = String(reps).toLowerCase()
  const range = text.match(/(\d+)\s*-\s*(\d+)\s*min/)
  if (range) return Number(range[2])
  const single = text.match(/(\d+)\s*min/)
  if (single) return Number(single[1])
  return null
}

export const estimateWorkoutMinutes = (workout) => Math.ceil((workout.exercises || []).reduce((total, item) => {
  const repMinutes = minutesFromRepText(item.reps)
  if (repMinutes !== null) return total + repMinutes + 1
  const sets = Math.max(1, Number(item.sets) || 1)
  const rest = Math.max(0, Number(item.rest) || 0)
  const workMinutes = /sec/.test(String(item.reps).toLowerCase()) ? 0.75 : 0.65
  return total + (sets * workMinutes) + (Math.max(0, sets - 1) * rest / 60) + 0.75
}, 0))

const fitWorkoutToDuration = (items, profile, preserveFirst = 2) => {
  const limit = sessionDurationLimit(profile.duration)
  let fitted = items
  const estimate = () => estimateWorkoutMinutes({ exercises: fitted })
  const compress = (predicate, update) => {
    if (estimate() <= limit) return
    fitted = fitted.map((item, index) => (index >= preserveFirst && predicate(item) ? update(item) : item))
  }

  compress(
    (item) => !['cardio', 'mobility', 'balance'].includes(item.category) && Number(item.sets) > 2,
    (item) => ({ ...item, sets: Math.max(2, Number(item.sets) - 1), rest: Math.min(Number(item.rest) || 60, 90) }),
  )
  compress(
    (item) => !['cardio', 'mobility', 'balance'].includes(item.category) && Number(item.rest) > 75,
    (item) => ({ ...item, rest: 75 }),
  )
  compress(
    (item) => item.category === 'cardio' && minutesFromRepText(item.reps) !== null,
    (item) => ({ ...item, reps: profileFlags(profile).shortSession ? '6-8 min' : '8-12 min' }),
  )
  compress(
    (item) => item.category === 'cardio' && minutesFromRepText(item.reps) !== null,
    (item) => ({ ...item, reps: profileFlags(profile).shortSession ? '5-6 min' : '6-8 min' }),
  )
  if (estimate() > limit) {
    fitted = fitted.map((item, index) => (index >= preserveFirst && !['cardio', 'mobility', 'balance'].includes(item.category)
      ? { ...item, sets: Math.min(Number(item.sets) || 2, 2), rest: Math.min(Number(item.rest) || 60, 60) }
      : item))
  }
  if (estimate() > limit) {
    fitted = fitted.map((item) => (item.category === 'cardio' && minutesFromRepText(item.reps) !== null
      ? { ...item, reps: profileFlags(profile).shortSession ? '5-6 min' : '6-8 min' }
      : item))
  }
  return fitted
}

const equipmentStation = (profile, station) => {
  const choices = {
    ski: [
      { keys: ['ski_erg'], name: 'SkiErg' },
      { keys: ['bands', 'handled_bands', 'long_resistance_band'], name: 'Band Ski Pull' },
      { keys: ['cables'], name: 'Cable Ski Pull' },
    ],
    sledPush: [
      { keys: ['sled'], name: 'Sled Push' },
      { keys: ['treadmill'], name: 'Treadmill Push' },
      { keys: ['weighted_vest'], name: 'Weighted Vest March' },
    ],
    sledPull: [
      { keys: ['sled'], name: 'Sled Pull' },
      { keys: ['sandbag'], name: 'Sandbag Drag' },
      { keys: ['cables'], name: 'Heavy Cable Row Drag' },
    ],
    wallBall: [
      { keys: ['wall_ball', 'medicine_balls'], name: 'Wall Ball' },
      { keys: ['dumbbells', 'adjustable_dumbbells', 'fixed_dumbbells'], name: 'Dumbbell Thruster' },
      { keys: ['kettlebells'], name: 'Kettlebell Thruster' },
    ],
    erg: [
      { keys: ['rower'], name: 'Rower' },
      { keys: ['ski_erg'], name: 'SkiErg' },
      { keys: ['assault_bike', 'bike'], name: 'BikeErg / Bike' },
      { keys: ['treadmill', 'track'], name: 'Run' },
    ],
    carry: [
      { keys: ['sandbag'], name: 'Sandbag Carry' },
      { keys: ['kettlebells', 'dumbbells', 'adjustable_dumbbells'], name: 'Farmer Carry' },
      { keys: ['weighted_vest'], name: 'Weighted Vest Carry' },
    ],
    gymnastics: [
      { keys: ['rings'], name: 'Ring Skill Practice' },
      { keys: ['pullup_bar', 'rig'], name: 'Pull-Up Skill Practice' },
      { keys: ['trx', 'suspension_trainer'], name: 'Suspension Row Skill Practice' },
    ],
    power: [
      { keys: ['bumper_plates', 'olympic_barbell'], name: 'Olympic Lift Technique' },
      { keys: ['dumbbells', 'adjustable_dumbbells'], name: 'Dumbbell Power Complex' },
      { keys: ['kettlebells'], name: 'Kettlebell Power Complex' },
    ],
    bike: [
      { keys: ['assault_bike'], name: 'Assault Bike' },
      { keys: ['bike'], name: 'Bike' },
      { keys: ['treadmill'], name: 'Treadmill Incline Ride Substitute' },
    ],
  }
  return choices[station]?.find((choice) => hasEquipment(profile, choice.keys))?.name
}

const sessionRationale = (title, focus, eventLabel = '') => {
  if (/Quality Run/i.test(title)) return 'Build race-specific speed and threshold control while keeping the rest of the week recoverable.'
  if (/Easy Run/i.test(title)) return 'Accumulate aerobic volume and supportive strength without adding excessive fatigue.'
  if (/Long Run/i.test(title)) return 'Extend event durability, pacing discipline, and fueling practice.'
  if (/Swim/i.test(title)) return 'Improve swim efficiency and shoulder durability so race-day effort costs less.'
  if (/Bike/i.test(title)) return 'Build bike power and cadence control without compromising run quality.'
  if (/Brick/i.test(title)) return 'Practice the bike-to-run transition so the first minutes off the bike feel controlled.'
  if (/Hyrox|Station|Run \+ Station|Simulation/i.test(title)) return 'Rehearse compromised running and station transitions under manageable fatigue.'
  if (/Metcon|EMOM|Strength \+ Skill/i.test(title)) return 'Blend skill, strength, and repeatable conditioning without turning every day into a max test.'
  return eventLabel ? `Support ${eventLabel} preparation with ${focus}.` : `Build ${focus} while matching your goal, equipment, and limitations.`
}

const preferredSplit = (profile, day) => {
  const splits = asArray(profile.split)
  if (splits.includes('push_pull_legs')) return ['Push', 'Pull', 'Legs', 'Athletic'][day % 4]
  if (splits.includes('body_part')) return ['Chest + Back', 'Legs', 'Shoulders + Arms', 'Conditioning + Core'][day % 4]
  return ['Upper', 'Lower'][day % 2]
}

const eventSessionTemplate = (profile, day, week, excluded = []) => {
  const eventKey = profile.eventGoal || 'none'
  if (!['marathon', 'half', '10k', '5k', 'triathlon', 'hyrox', 'crossfit'].includes(eventKey)) return null
  const meta = eventPlanMeta(profile)
  const weekPlan = buildTrainingPlan(profile)[week - 1]
  const phase = meta.hasEvent ? eventPhaseForWeek(week, meta.planWeeks) : phaseForWeek(week)
  const flags = profileFlags(profile)
  const targetExercises = Math.max(6, Math.min(Number(profile.exercisesPerDay) || 6, 12))
  const longRun = weekPlan?.longRun ?? EVENT_META[eventKey]?.longRun ?? 4
  const taper = phase.name === 'Taper' || phase.name === 'Race'
  const easyCardio = safeExercise('cardio', profile, week + day, excluded)
  const buildNote = `${phase.name} week. ${weekPlan?.note ?? 'Progress event-specific capacity without burying recovery.'} ${evidenceCue(profile)}`
  const strengthSupport = [
    eventExercise(safeExercise('hinge', profile, week + day, excluded), { sets: taper ? 2 : 3, reps: taper ? '6 easy' : '6-8', rest: 105 }, `Strength support for event durability. ${buildNote}`),
    eventExercise(safeExercise('legs', profile, week + day + 1, excluded), { sets: taper ? 2 : 3, reps: '8-12', rest: 75 }, `Single-leg and posterior-chain durability. ${buildNote}`),
    eventExercise(safeExercise(flags.olderAdult ? 'balance' : 'core', profile, day, excluded), { sets: 2, reps: flags.olderAdult ? '30 sec' : '10-14', rest: 45 }, `Trunk control for efficient event movement. ${buildNote}`),
    eventExercise(safeExercise('mobility', profile, day, excluded), { sets: 2, reps: '45-60 sec', rest: 20 }, `Restore range and downshift. ${buildNote}`),
  ]

  const byEvent = {
    marathon: [
      {
        title: 'Quality Run',
        muscleGroups: ['Run Speed', 'Threshold', 'Core'],
        accentColor: '#60A5FA',
        exercises: [
          eventExercise('Easy Run Warm-Up', { reps: taper ? '8-10 min' : '10-15 min' }, `Prepare for quality running. ${buildNote}`, 'cardio'),
          eventExercise('Tempo Intervals', { sets: taper ? 3 : 5, reps: taper ? '3 min @ controlled tempo' : '5 min @ threshold effort', rest: 120 }, `Runna-style quality day: controlled pace, not a race. ${buildNote}`, 'cardio'),
          eventExercise('Strides', { sets: taper ? 4 : 6, reps: '20 sec fast / relaxed', rest: 60 }, `Fast but smooth leg turnover. ${buildNote}`, 'cardio'),
          ...strengthSupport.slice(1),
        ],
      },
      {
        title: 'Easy Run + Strength',
        muscleGroups: ['Aerobic Base', 'Strength'],
        accentColor: '#C8FF00',
        exercises: [
          eventExercise(easyCardio, { reps: taper ? '15-25 min easy' : '30-45 min Zone 2' }, `Aerobic base without stress accumulation. ${buildNote}`, 'cardio'),
          ...strengthSupport,
        ],
      },
      {
        title: 'Long Run',
        muscleGroups: ['Aerobic Durability', 'Fueling'],
        accentColor: '#F472B6',
        exercises: [
          eventExercise('Long Run', { reps: taper ? `${Math.max(4, Math.round(longRun * 0.6))} mi easy` : `${longRun} mi progressive easy` }, `Practice fueling, pacing, and relaxed form. ${buildNote}`, 'cardio'),
          eventExercise('Post-Run Walkdown', { reps: '5-10 min' }, `Downshift heart rate before mobility. ${buildNote}`, 'mobility'),
          ...strengthSupport.slice(2),
        ],
      },
    ],
    half: null,
    '10k': null,
    '5k': null,
    triathlon: [
      {
        title: 'Swim Technique',
        muscleGroups: ['Swim', 'Shoulders', 'Core'],
        accentColor: '#60A5FA',
        exercises: [
          eventExercise('Swim Drill Set', { sets: taper ? 4 : 6, reps: '50 m technique', rest: 30 }, `Balance catch, body position, and calm breathing. ${buildNote}`, 'cardio'),
          eventExercise('Steady Swim', { reps: taper ? '400-800 m easy' : '800-1600 m aerobic' }, `Triathlon-specific low-impact aerobic work. ${buildNote}`, 'cardio'),
          eventExercise(safeExercise('pull', profile, week, excluded), { sets: taper ? 2 : 3, reps: '8-12', rest: 75, logType: 'sets' }, `Lat and upper-back support for swim mechanics. ${buildNote}`, 'pull'),
          ...strengthSupport.slice(2),
        ],
      },
      {
        title: 'Bike Intervals',
        muscleGroups: ['Bike Power', 'Threshold'],
        accentColor: '#A78BFA',
        exercises: [
          eventExercise('Bike Warm-Up', { reps: '10 min easy spin' }, `Build cadence before work. ${buildNote}`, 'cardio'),
          eventExercise(`${equipmentStation(profile, 'bike') || 'Bike'} Threshold Repeats`, { sets: taper ? 3 : 5, reps: taper ? '3 min firm' : '6 min firm', rest: 120 }, `Build bike power without compromising the run. ${buildNote}`, 'cardio'),
          eventExercise('High-Cadence Spin-Ups', { sets: 5, reps: '30 sec fast feet', rest: 45 }, `Cadence skill and neuromuscular sharpness. ${buildNote}`, 'cardio'),
          ...strengthSupport.slice(1),
        ],
      },
      {
        title: 'Brick Session',
        muscleGroups: ['Bike', 'Run', 'Transition'],
        accentColor: '#FB923C',
        exercises: [
          eventExercise('Steady Bike', { reps: taper ? '25-40 min easy' : '45-75 min aerobic' }, `Practice race-position rhythm. ${buildNote}`, 'cardio'),
          eventExercise('Transition Run', { reps: taper ? '8-12 min easy' : '15-25 min controlled' }, `Run off the bike with short, quick cadence. ${buildNote}`, 'cardio'),
          eventExercise('Transition Practice', { sets: 4, reps: 'smooth mount / shoes / first minute', rest: 60 }, `Make race execution automatic. ${buildNote}`, 'mobility'),
          ...strengthSupport.slice(2),
        ],
      },
      {
        title: 'Tri Strength',
        muscleGroups: ['Durability', 'Core'],
        accentColor: '#C8FF00',
        exercises: strengthSupport,
      },
    ],
    hyrox: [
      {
        title: 'Run + Station Intervals',
        muscleGroups: ['Compromised Running', 'Stations'],
        accentColor: '#C8FF00',
        exercises: [
          eventExercise('1 km Run Repeats', { sets: taper ? 3 : 5, reps: 'controlled race pace', rest: 90 }, `Roxfit-style compromised running dose. ${buildNote}`, 'cardio'),
          eventExercise(equipmentStation(profile, 'ski') || 'Band Ski Pull', { sets: taper ? 2 : 4, reps: '500 m or 2 min', rest: 75 }, `Station-specific pulling capacity matched to available equipment. ${buildNote}`, 'cardio'),
          eventExercise(equipmentStation(profile, 'sledPush') || 'Heavy March', { sets: taper ? 2 : 4, reps: '20-30 m', rest: 90 }, `Station-specific drive matched to available equipment. ${buildNote}`, 'legs'),
          eventExercise(equipmentStation(profile, 'sledPull') || 'Heavy Row Drag', { sets: taper ? 2 : 4, reps: '20-30 m', rest: 90 }, `Posterior-chain station strength matched to available equipment. ${buildNote}`, 'hinge'),
          eventExercise('Burpee Broad Jump / Step Burpee', { sets: taper ? 2 : 3, reps: '8-12', rest: 75 }, `Scale impact for knees or wrists. ${buildNote}`, 'cardio'),
          eventExercise(equipmentStation(profile, 'wallBall') || 'Bodyweight Squat to Reach', { sets: taper ? 2 : 4, reps: '12-20', rest: 75 }, `Finish strong under fatigue with selected equipment. ${buildNote}`, 'squat'),
        ],
      },
      {
        title: 'Station Strength',
        muscleGroups: ['Sled', 'Carries', 'Lunges'],
        accentColor: '#A78BFA',
        exercises: [
          eventExercise(safeExercise('squat', profile, week, excluded), { sets: taper ? 2 : 4, reps: '5-8', rest: 120, logType: 'sets' }, `Leg strength for sleds and lunges. ${buildNote}`, 'squat'),
          eventExercise('Farmer Carry', { sets: taper ? 2 : 4, reps: '40-60 m', rest: 75 }, `Grip and trunk stiffness for carry stations. ${buildNote}`, 'core'),
          eventExercise('Walking Lunge / Reverse Lunge', { sets: taper ? 2 : 3, reps: '12-20 steps', rest: 90 }, `Lunge station capacity. ${buildNote}`, 'legs'),
          ...strengthSupport.slice(1),
        ],
      },
      {
        title: 'Hyrox Simulation',
        muscleGroups: ['Race Rehearsal', 'Engine'],
        accentColor: '#F472B6',
        exercises: [
          eventExercise('Compromised Run Blocks', { sets: taper ? 3 : 6, reps: '500 m run + station', rest: 90 }, `Rehearse switching from running to work. ${buildNote}`, 'cardio'),
          eventExercise(equipmentStation(profile, 'erg') || 'Run', { sets: taper ? 2 : 4, reps: '500 m or 2 min', rest: 75 }, `Station engine without excessive impact. ${buildNote}`, 'cardio'),
          eventExercise(equipmentStation(profile, 'carry') || 'Bear-Hug Carry', { sets: taper ? 2 : 4, reps: '40-80 m', rest: 75 }, `Race-specific bracing and breathing. ${buildNote}`, 'core'),
          ...strengthSupport.slice(2),
        ],
      },
    ],
    crossfit: [
      {
        title: 'Strength + Skill',
        muscleGroups: ['Strength', 'Gymnastics'],
        accentColor: '#C8FF00',
        exercises: [
          eventExercise(safeExercise('squat', profile, week, excluded), { sets: taper ? 3 : 5, reps: taper ? '3 easy' : '3-5', rest: 150, logType: 'sets' }, `Build the strength base before intensity. ${buildNote}`, 'squat'),
          eventExercise(equipmentStation(profile, 'gymnastics') || 'Bodyweight Skill Practice', { sets: taper ? 3 : 6, reps: 'quality sets, stop before failure', rest: 60 }, `Gymnastics skill matched to selected equipment. ${buildNote}`, 'pull'),
          eventExercise(equipmentStation(profile, 'power') || 'Jump and Landing Power Complex', { sets: taper ? 3 : 5, reps: '2-3 crisp reps', rest: 90 }, `Technique under control before speed. ${buildNote}`, 'power'),
          ...strengthSupport.slice(2),
        ],
      },
      {
        title: 'Mixed Modal Metcon',
        muscleGroups: ['Metcon', 'Power', 'Engine'],
        accentColor: '#FB923C',
        exercises: [
          eventExercise('AMRAP Mixed Modal Block', { sets: 1, reps: taper ? '8-10 min smooth' : '12-18 min hard sustainable' }, `CrossFit-style mixed modal work without maxing every day. ${buildNote}`, 'cardio'),
          eventExercise(`${equipmentStation(profile, 'erg') || 'Run'} Calories`, { sets: taper ? 3 : 5, reps: 'moderate calories', rest: 45 }, `Monostructural engine dose. ${buildNote}`, 'cardio'),
          eventExercise(equipmentStation(profile, 'power') || 'Dumbbell Cycling', { sets: taper ? 3 : 5, reps: '8-12 unbroken quality reps', rest: 60 }, `Cycling mechanics and breathing matched to equipment. ${buildNote}`, 'power'),
          eventExercise('Burpee / Step-Down Burpee', { sets: taper ? 2 : 4, reps: '8-12', rest: 60 }, `Gym capacity with scalable impact. ${buildNote}`, 'cardio'),
          ...strengthSupport.slice(2),
        ],
      },
      {
        title: 'Engine EMOM',
        muscleGroups: ['Engine', 'Repeatability'],
        accentColor: '#60A5FA',
        exercises: [
          eventExercise('EMOM Engine', { sets: 1, reps: taper ? '10 min alternating easy stations' : '16-24 min alternating stations' }, `Practice repeatable output and transitions. ${buildNote}`, 'cardio'),
          eventExercise(equipmentStation(profile, 'carry') || equipmentStation(profile, 'sledPush') || 'Loaded Carry Substitute', { sets: taper ? 3 : 5, reps: '30-45 sec', rest: 30 }, `Loaded conditioning without technical breakdown. ${buildNote}`, 'core'),
          eventExercise('Midline Density', { sets: taper ? 2 : 4, reps: '30-45 sec', rest: 30 }, `Brace under breathing pressure. ${buildNote}`, 'core'),
          ...strengthSupport.slice(2),
        ],
      },
    ],
  }

  byEvent.half = byEvent.marathon
  byEvent['10k'] = byEvent.marathon
  byEvent['5k'] = byEvent.marathon

  const sessions = byEvent[eventKey]
  if (!sessions) return null
  const session = sessions[day % sessions.length]
  const fillCategories = ['core', 'mobility', 'balance', 'pull', 'hinge']
  const filled = [...session.exercises]
  while (filled.length < targetExercises) {
    const category = fillCategories[filled.length % fillCategories.length]
    filled.push(eventExercise(safeExercise(category, profile, week + filled.length, excluded), { ...schemeForCategory(category, profile, repScheme(profile, week), flags, EVENT_META[eventKey], weekPlan, week), logType: 'sets' }, `Support work for ${EVENT_META[eventKey].label}. ${buildNote}`, category))
  }
  return {
    ...session,
    dayLabel: `Day ${day + 1}`,
    rationale: sessionRationale(session.title, EVENT_META[eventKey].focus, EVENT_META[eventKey].label),
    duration: flags.shortSession ? 20 : eventKey === 'hyrox' || eventKey === 'crossfit' ? 55 : 60,
    exercises: applySupersets(filled.slice(0, targetExercises), profile),
  }
}

const insertWithinWorkout = (categories, category, targetExercises) => {
  if (categories.includes(category)) return categories
  const next = [...categories]
  next.splice(Math.max(0, Math.min(targetExercises - 1, next.length)), 0, category)
  return next
}

const categoriesForSplit = (split, profile, day, targetExercises = 6) => {
  const flags = profileFlags(profile)
  const eventActive = profile.eventGoal && profile.eventGoal !== 'none' && day % Math.max(3, Number(profile.days) || 4) === 2
  if (eventActive) return ['cardio', 'hinge', 'legs', 'core', 'mobility', flags.olderAdult ? 'balance' : 'cardio']
  const base =
    split === 'Push' ? ['push', 'overhead', 'push', 'arms', 'push', 'overhead']
    : split === 'Pull' ? ['pull', 'hinge', 'pull', 'pull', 'arms', 'hinge']
    : split === 'Legs' ? ['squat', 'hinge', 'legs', 'legs', 'squat', 'legs']
    : split === 'Chest + Back' ? ['push', 'pull', 'push', 'pull', 'push', 'pull', 'push', 'pull']
    : split === 'Shoulders + Arms' ? ['overhead', 'arms', 'overhead', 'arms', 'pull', 'push']
    : split === 'Conditioning + Core' || split === 'Athletic' ? ['cardio', 'core', 'legs', 'pull', 'hinge', 'core']
    : split === 'Lower' ? ['squat', 'hinge', 'legs', 'legs', 'squat', 'legs']
    : ['push', 'pull', 'overhead', 'pull', 'push', 'arms']

  let categories = [...base]
  const hasDedicatedCoreDay = split === 'Conditioning + Core' || split === 'Athletic'
  if (!hasDedicatedCoreDay && day % 2 === 0) categories = insertWithinWorkout(categories, 'core', targetExercises)
  if (flags.healthGoal) categories = insertWithinWorkout(categories, 'cardio', targetExercises)
  if (flags.olderAdult) categories = insertWithinWorkout(categories, 'balance', targetExercises)
  else if (flags.medicalRisk && !flags.healthGoal) categories = insertWithinWorkout(categories, 'mobility', targetExercises)
  return categories
}

const schemeForCategory = (category, profile, baseScheme, flags, event, weekPlan, week) => {
  const phase = phaseForWeek(week)
  const goals = goalFlags(profile)
  const primaryStrength = ['squat', 'hinge', 'push', 'pull'].includes(category)
  const accessory = ['legs', 'overhead', 'arms'].includes(category)
  if (category === 'cardio') {
    return { sets: 1, reps: flags.shortSession ? '8-12 min' : event?.peak ? `Long session: ${weekPlan?.longRun ?? 'race'} mi / event-specific equivalent` : '20-30 min', rest: 0 }
  }
  if (category === 'mobility') return { sets: 2, reps: '45-60 sec', rest: 20 }
  if (category === 'balance') return { sets: 2, reps: '30 sec', rest: 30 }
  if (category === 'core') return { sets: flags.olderAdult ? 2 : 3, reps: flags.olderAdult ? '30 sec' : '10-14', rest: 45 }
  if (goals.power && primaryStrength) return { sets: flags.inSeason || flags.shortSession ? 2 : 3, reps: '3-6 fast', rest: 120 }
  if (goals.strength && primaryStrength) {
    if (phase.name === 'Deload') return { sets: 2, reps: '5-6', rest: 120 }
    if (phase.name === 'Peak' && !flags.medicalRisk) return { sets: flags.shortSession ? 2 : 4, reps: '3-5', rest: 180 }
    return { sets: flags.shortSession || flags.medicalRisk || flags.beginner ? 2 : 4, reps: flags.beginner ? '6-8 controlled' : '4-6', rest: flags.beginner ? 90 : 150 }
  }
  if (goals.strength && goals.muscle && accessory) return { sets: flags.shortSession ? 2 : 3, reps: '8-12', rest: 75 }
  if (goals.muscle && primaryStrength) return { sets: phase.name === 'Deload' || flags.shortSession ? 2 : 3, reps: '6-10', rest: 105 }
  if (goals.muscle || accessory) return { sets: phase.name === 'Deload' || flags.shortSession ? 2 : 3, reps: '10-15', rest: 75 }
  if (goals.endurance || goals.fatLoss || goals.health) return { sets: flags.shortSession ? 1 : 2, reps: '12-15', rest: 60 }
  if (goals.independence) return { sets: 2, reps: '8-12 controlled', rest: 75 }
  return baseScheme
}

const refineSchemeForExercise = (name, category, scheme, index, profile) => {
  const lower = name.toLowerCase()
  const goals = goalFlags(profile)
  const flags = profileFlags(profile)
  if (flags.beginner && ['squat', 'hinge', 'push', 'pull', 'overhead', 'legs', 'arms'].includes(category)) {
    return { ...scheme, sets: Math.min(Number(scheme.sets) || 2, 2), reps: /fast|controlled/.test(String(scheme.reps)) ? scheme.reps : '8-12 controlled', rest: Math.min(Number(scheme.rest) || 75, 90) }
  }
  if (/fly|pec deck|face pull/.test(lower)) return { sets: 3, reps: '12-15', rest: 60 }
  if (/external rotation|stretch|mobility/.test(lower)) return scheme
  if (category === 'push' && goals.strength && goals.muscle && index > 1) {
    if (/incline|machine|dumbbell|landmine|band/.test(lower)) return { sets: 3, reps: '8-10', rest: 90 }
  }
  if (category === 'pull' && goals.strength && goals.muscle && index > 1) {
    if (/row|pulldown/.test(lower)) return { sets: 3, reps: '8-12', rest: 90 }
  }
  return scheme
}

const applySupersets = (items, profile) => {
  const goal = goalText(profile)
  const flags = profileFlags(profile)
  const pairs =
    flags.shortSession ? 3
    : goal.includes('fat_loss') || goal.includes('health') ? 2
    : goal.includes('muscle') && !goal.includes('strength') && items.length >= 9 ? 2
    : 0
  if (!pairs) return items
  const startIndex = Math.max(2, items.length - pairs * 2)
  return items.map((item, index) => {
    if (index < startIndex) return item
    const pair = Math.floor((index - startIndex) / 2)
    const side = (index - startIndex) % 2 === 0 ? 'A' : 'B'
    const superset = `S${pair + 1}${side}`
    const partner = items[index + (side === 'A' ? 1 : -1)]?.name
    return {
      ...item,
      superset,
      notes: `${item.notes} Superset ${superset}${partner ? ` with ${partner}` : ''} when time or conditioning demand it.`,
    }
  })
}

const evidenceCue = (profile) => {
  const tags = researchTagsForProfile(profile)
  if (tags.includes('chronicCondition')) return 'Evidence cue: start low, progress gradually, and keep reps smooth.'
  if (tags.includes('enduranceEvent')) return 'Evidence cue: aerobic build with protected taper and recovery.'
  if (tags.includes('strength')) return 'Evidence cue: specific movement pattern, progressive overload, full recovery between hard sets.'
  if (tags.includes('hypertrophy')) return 'Evidence cue: moderate reps and repeatable weekly volume.'
  if (tags.includes('olderAdult')) return 'Evidence cue: balance plus controlled strength supports daily function.'
  return 'Evidence cue: major movement pattern matched to goal and equipment.'
}

export const buildTrainingPlan = (profile) => {
  const meta = eventPlanMeta(profile)
  const totalWeeks = meta.planWeeks
  return Array.from({ length: totalWeeks }, (_, index) => {
    const week = index + 1
    const phase = meta.hasEvent ? eventPhaseForWeek(week, totalWeeks) : phaseForWeek(week)
    const event = meta.event
    const progressionWeeks = Math.max(totalWeeks - 2, 1)
    const longRunProgress = Math.min(index, progressionWeeks - 1) / Math.max(progressionWeeks - 1, 1)
    const longRun = event?.peak ? Math.round(event.longRun + ((event.peak - event.longRun) * longRunProgress)) : null
    return {
      week,
      phase: phase.name,
      color: phase.color,
      focus: event?.focus ?? 'progressive overload',
      longRun: phase.name === 'Race' ? null : phase.name === 'Taper' && longRun ? Math.max(event.longRun, Math.round(longRun * 0.6)) : longRun,
      note:
        phase.name === 'Race'
          ? `${event.label} week. Keep strength work light, prioritize sleep, hydration, and race execution.`
          : phase.name === 'Taper'
            ? `${event.label} taper week. Reduce volume, keep easy movement, and arrive fresh.`
            : phase.name === 'Deload'
          ? 'Volume drops automatically unless performance data asks for a harder reset.'
          : `${phase.name} week with ${Math.round(phase.volume * 100)}% volume and ${Math.round(phase.intensity * 100)}% intensity.`,
    }
  })
}

const workoutTemplate = (profile, day, week, excluded = []) => {
  const eventSession = eventSessionTemplate(profile, day, week, excluded)
  if (eventSession) return eventSession
  const scheme = repScheme(profile, week)
  const rotation = Math.floor((week - 1) / 4)
  const sport = sportDetails(profile)
  const event = EVENT_META[profile.eventGoal || 'none']
  const weekPlan = buildTrainingPlan(profile)[week - 1]
  const focusCue = sport?.qualities?.[day % sport.qualities.length] ?? 'balanced training'
  const flags = profileFlags(profile)
  const split = preferredSplit(profile, day)
  const targetExercises = Math.max(6, Math.min(Number(profile.exercisesPerDay) || 6, 12))
  const coachingNote = flags.medicalRisk
    ? 'Medical-risk profile: keep effort conversational, avoid breath-holding, and stop for dizziness, chest pain, or unusual symptoms.'
    : flags.beginner
      ? 'Beginner progression: leave 3 reps in reserve and build consistency before load.'
      : flags.inSeason
        ? 'In-season dose: speed quality without fatigue spillover.'
        : `Sport layer: ${focusCue}.`
  const categories = categoriesForSplit(split, profile, day, targetExercises)
  const accentColors = ['#C8FF00', '#A78BFA', '#60A5FA', '#FB923C']
  const title = event?.label && event.label !== 'None' && categories[0] === 'cardio' ? `${event.label} Engine` : flags.healthGoal && split === 'Lower' ? 'Low-Impact Lower' : `${split} Training`
  const muscleGroupsBySplit = {
    Push: ['Chest', 'Shoulders', 'Triceps'],
    Pull: ['Back', 'Posterior Chain', 'Core'],
    Legs: ['Quads', 'Glutes', 'Hamstrings'],
    Athletic: ['Full Body', 'Power', 'Core'],
    Upper: ['Chest', 'Back', 'Shoulders'],
    Lower: ['Quads', 'Glutes', 'Core'],
    'Chest + Back': ['Chest', 'Back', 'Core'],
    'Shoulders + Arms': ['Shoulders', 'Arms', 'Core'],
    'Conditioning + Core': ['Cardio', 'Core', 'Mobility'],
  }
  const usedExercises = new Set()
  const exerciseItems = []
  for (let index = 0; index < targetExercises; index += 1) {
    const category = categories[index % categories.length]
    const cue = index === 0 ? `Primary pattern. Keep 2 reps in reserve during ${phaseForWeek(week).name}.` : category === 'cardio' ? (flags.medicalRisk ? coachingNote : event?.focus ?? 'Nasal breathing Zone 2.') : coachingNote
    const selectedExercise = safeUniqueExercise(category, profile, rotation + day + index, excluded, usedExercises)
    usedExercises.add(selectedExercise)
    exerciseItems.push(exercise(
      selectedExercise,
      refineSchemeForExercise(selectedExercise, category, schemeForCategory(category, profile, scheme, flags, event, weekPlan, week), index, profile),
      `${cue} ${coachingNote.startsWith('Sport layer') ? '' : `Sport layer: ${focusCue}. `}${evidenceCue(profile)}`.replace(/\s+/g, ' ').trim(),
      category,
    ))
  }
  const fittedExercises = fitWorkoutToDuration(exerciseItems.map((item) => ({
    ...item,
    sets: flags.shortSession ? Math.min(item.sets, 2) : item.sets,
  })), profile)
  return {
    title,
    dayLabel: `Day ${day + 1}`,
    muscleGroups: muscleGroupsBySplit[split] ?? ['Full Body', 'Core'],
    accentColor: accentColors[day % accentColors.length],
    rationale: sessionRationale(title, focusCue),
    duration: sessionDurationLimit(profile.duration),
    exercises: applySupersets(fittedExercises, profile),
  }
}

const coachingSummary = (profile) => {
  const flags = profileFlags(profile)
  const meta = eventPlanMeta(profile)
  const notes = []
  if (meta.hasEvent) {
    notes.push(`${meta.event.label} plan is date-aware: ${meta.planWeeks} weeks to ${meta.eventDate}.`)
    if (meta.readiness === 'compressed') notes.push(`Compressed timeline: ideal prep is about ${meta.minWeeks}+ weeks, so progression is conservative and taper is protected.`)
  }
  if (researchTagsForProfile(profile).includes('health')) notes.push('Guideline target: build toward 150-300 weekly moderate aerobic minutes and at least 2 strengthening days as capacity allows.')
  if (flags.shortSession) notes.push('Sessions are compressed to the highest-value movements for a 15-20 minute window.')
  if (flags.beginner) notes.push('Beginner load guidance: use conservative weights, stop well before failure, and prioritize habit formation.')
  if (flags.olderAdult) notes.push('Older-adult guidance: balance, mobility, and controlled functional strength are built into the plan.')
  if (flags.medicalRisk) notes.push('Medical-risk guidance: keep intensity moderate, avoid breath-holding, monitor symptoms, and follow clinician advice.')
  if (flags.inSeason || flags.teen) notes.push('Athlete guidance: training volume is capped to protect sport performance and recovery.')
  return notes.join(' ')
}

export const buildWeekSessions = (profile, week = 1, excluded = []) => {
  const days = Math.max(2, Math.min(Number(profile.days) || 4, 6))
  return Array.from({ length: days }, (_, index) => workoutTemplate(profile, index, week, excluded))
}

export const buildFallbackProgram = (profile) => {
  const cleanProfile = normalizeProfile(profile)
  const goalLabel = Array.isArray(cleanProfile.goal) ? cleanProfile.goal.join(' + ') : cleanProfile.goal || 'balanced'
  const event = EVENT_META[cleanProfile.eventGoal || 'none']
  const sport = sportDetails(cleanProfile)
  const trainingPlan = buildTrainingPlan(cleanProfile)
  const weeklyWorkouts = Object.fromEntries(trainingPlan.map((week) => [week.week, buildWeekSessions(cleanProfile, week.week)]))
  const planSubject = event?.label && event.label !== 'None' ? event.label : sport?.label && sport.label !== 'None' ? sport.label : 'FitMe'
  const planWeeks = eventPlanMeta(cleanProfile).planWeeks
  return {
    id: id('program'),
    schemaVersion: 4,
    signature: programSignature(cleanProfile),
    title: `${planSubject} ${goalLabel} Plan`,
    summary: `A ${planWeeks}-week adaptive plan for ${cleanProfile.level || 'intermediate'} training using the ${cleanProfile.equipment || 'gym'} training setup. ${sport?.label !== 'None' ? `Sport layer: ${sport.qualities.join(', ')}.` : ''} ${coachingSummary(cleanProfile)}`.trim(),
    splitType: `${planWeeks}-week ${cleanProfile.days || 4}-day adaptive split`,
    goal: goalLabel,
    level: cleanProfile.level || 'intermediate',
    age: cleanProfile.age,
    gender: cleanProfile.gender,
    bodyType: cleanProfile.bodyType,
    sport: cleanProfile.sport,
    customSport: cleanProfile.customSport,
    equipment: cleanProfile.equipment || 'commercial gym',
    equipmentAccess: cleanProfile.equipmentAccess,
    equipmentDetail: cleanProfile.equipmentDetail || '',
    split: cleanProfile.split,
    exercisesPerDay: cleanProfile.exercisesPerDay,
    limitations: cleanProfile.limitations || '',
    isEventPlan: Boolean(cleanProfile.eventGoal && cleanProfile.eventGoal !== 'none'),
    eventGoal: cleanProfile.eventGoal || 'none',
    currentWeek: 1,
    workouts: buildWeekSessions(cleanProfile, 1),
    weeklyWorkouts,
    trainingPlan,
    researchBasis: researchTagsForProfile(cleanProfile).map((tag) => RESEARCH_RULES[tag]),
    eventDate: cleanProfile.eventDate || '',
    eventReadiness: eventPlanMeta(cleanProfile).readiness,
    weekFeedback: {},
    exerciseOverrides: {},
    excludedExercises: [],
    createdAt: new Date().toISOString(),
  }
}

export const validateSet = (weight, reps) => {
  const errors = []
  const w = Number(weight)
  const r = Number(reps)
  if (!Number.isFinite(w) || w < 0 || w > 2000) errors.push('Weight must be between 0 and 2000.')
  if (!Number.isFinite(r) || r < 0 || r > 200) errors.push('Reps must be between 0 and 200.')
  return errors.join(' ')
}

export const estimatedOneRepMax = (weight, reps) => Math.round(Number(weight) * (1 + Number(reps) / 30))

export const applyWorkoutAdjustment = (program, week, feedback) => {
  const updated = { ...program, weekFeedback: { ...program.weekFeedback, [week]: feedback } }
  const sessions = structuredClone(updated.weeklyWorkouts?.[week] ?? updated.workouts)
  const multiplier = feedback === 'hard' ? 0.82 : feedback === 'easy' ? 1.12 : 1
  updated.weeklyWorkouts = {
    ...updated.weeklyWorkouts,
    [week]: sessions.map((session) => ({
      ...session,
      exercises: session.exercises.map((ex) => ({
        ...ex,
        sets: Math.max(1, Math.round(ex.sets * multiplier)),
        notes: `${ex.notes} Week marked ${feedback}; remaining work adjusted.`,
      })),
    })),
  }
  return updated
}

export const substituteExercise = (program, originalName, replacementName, persistent = false) => {
  const replaceInSession = (session) => ({
    ...session,
    exercises: session.exercises.map((ex) => (ex.name === originalName ? { ...ex, name: replacementName, notes: `${ex.notes} Substituted from ${originalName}.` } : ex)),
  })
  const weeklyWorkouts = Object.fromEntries(
    Object.entries(program.weeklyWorkouts ?? {}).map(([week, sessions]) => [week, sessions.map(replaceInSession)]),
  )
  return {
    ...program,
    workouts: program.workouts.map(replaceInSession),
    weeklyWorkouts,
    exerciseOverrides: { ...program.exerciseOverrides, [originalName]: replacementName },
    excludedExercises: persistent ? Array.from(new Set([...(program.excludedExercises ?? []), originalName])) : program.excludedExercises,
  }
}

export const parseSocialWorkout = (text) => {
  const lines = text
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
  const names = lines.length ? lines : ['Imported Squat', 'Imported Press', 'Imported Row']
  const parsedExercise = (line) => {
    const cleaned = line.replace(/https?:\/\/\S+/i, 'Shared movement').replace(/\s+/g, ' ').trim()
    const match = cleaned.match(/^(.*?)(?:\s+|-)?(\d+)\s*x\s*(\d+)(?:\s*@\s*(\d+))?/i)
    if (!match) return exercise(cleaned, { sets: 3, reps: '8-12', rest: 90 }, 'Parsed locally. AI proxy can enhance this in production.')
    const [, rawName, sets, reps] = match
    return exercise(rawName.trim() || 'Imported Movement', { sets: Number(sets), reps, rest: 90 }, 'Sets and reps parsed locally.')
  }
  return {
    id: id('workout'),
    title: 'Imported Social Workout',
    duration: 45,
    accentColor: '#F472B6',
    muscleGroups: ['Imported', 'Full Body'],
    exercises: names.slice(0, 8).map(parsedExercise),
    createdAt: new Date().toISOString(),
  }
}
