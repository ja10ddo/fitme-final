import {
  buildFallbackProgram,
  estimatedOneRepMax,
  normalizeProfile,
  parseSocialWorkout,
  programSignature,
  substituteExercise,
  validateProfile,
  validateSet,
} from './src/engine.js'

const dateWeeksFromNow = (weeks) => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + weeks * 7)
  return date.toISOString().slice(0, 10)
}

const base = {
  goal: ['strength'],
  equipment: 'commercial gym',
  equipmentAccess: ['barbell_rack', 'dumbbells', 'cables', 'machines', 'cardio_machines'],
  equipmentDetail: '',
  days: 4,
  duration: '45-60 min',
  level: 'intermediate',
  limitations: '',
  sport: ['none'],
  eventGoal: 'none',
  split: ['upper_lower'],
  exercisesPerDay: 6,
}

const personas = [
  {
    name: 'Quick-start beginner health',
    profile: { ...base, goal: ['health'], level: 'beginner', days: 3, split: ['upper_lower'] },
    expect: { weeks: 12, minDays: 3, avoid: [] },
  },
  {
    name: 'Advanced commercial gym strength',
    profile: { ...base, goal: ['strength'], level: 'advanced', equipmentAccess: ['barbell_rack', 'trap_bar', 'lat_pulldown', 'leg_press', 'cables'], days: 5 },
    expect: { contains: ['Trap Bar Deadlift', 'Cable Row', 'Leg Press'] },
  },
  {
    name: 'Home gym hypertrophy',
    profile: { ...base, goal: ['muscle'], equipment: 'home gym', equipmentAccess: ['adjustable_dumbbells', 'bench', 'bands', 'pullup_bar'], split: ['body_part'], days: 4, exercisesPerDay: 8 },
    expect: { minExercises: 8, avoid: ['Barbell'] },
  },
  {
    name: 'Dumbbells-only fat loss',
    profile: { ...base, goal: ['fat_loss'], equipment: 'dumbbells', equipmentAccess: ['adjustable_dumbbells', 'bench'], days: 4 },
    expect: { avoid: ['Barbell', 'Machine', 'Cable', 'Trap Bar'] },
  },
  {
    name: 'Bands-only travel',
    profile: { ...base, goal: ['health'], equipment: 'bands', equipmentAccess: ['loop_bands', 'handled_bands', 'door_anchor'], duration: '30-40 min', days: 3 },
    expect: { avoid: ['Barbell', 'Dumbbell', 'Machine', 'Cable'] },
  },
  {
    name: 'Bodyweight sedentary knee limitation',
    profile: { ...base, goal: ['health'], equipment: 'bodyweight', equipmentAccess: ['pullup_bar', 'yoga_mat'], level: 'beginner', limitations: 'bad knees and sedentary', days: 3 },
    expect: { contains: ['Low-Impact Bike'], avoid: ['Back Squat', 'Walking Lunge', 'Step-Up', 'Zone 2 Run'] },
  },
  {
    name: 'Older adult independence',
    profile: { ...base, age: 70, goal: ['independence', 'health'], level: 'beginner', limitations: 'hypertension and arthritis', days: 3 },
    expect: { contains: ['Supported Single-Leg Balance'], research: ['Older-adult multicomponent training'] },
  },
  {
    name: 'Teen in-season hockey athlete',
    profile: { ...base, age: 16, goal: ['sport_power'], sport: ['hockey'], seasonPhase: 'in-season', days: 6 },
    expect: { maxDays: 4, summary: ['Athlete guidance', 'lateral power'] },
  },
  {
    name: 'Volleyball off-season power',
    profile: { ...base, goal: ['sport_power'], sport: ['volleyball'], seasonPhase: 'off-season', split: ['push_pull_legs'], exercisesPerDay: 7 },
    expect: { minExercises: 7, summary: ['landing mechanics', 'vertical power'] },
  },
  {
    name: 'Custom sport pickleball',
    profile: { ...base, sport: ['other'], customSport: 'Pickleball', equipment: 'home gym', equipmentAccess: ['adjustable_dumbbells', 'bands', 'bench'] },
    expect: { title: ['Pickleball'], summary: ['lateral deceleration'] },
  },
  {
    name: 'Marathon 18-week commercial gym',
    profile: { ...base, goal: ['endurance', 'strength'], eventGoal: 'marathon', eventDate: dateWeeksFromNow(18), days: 5, equipmentAccess: ['barbell_rack', 'dumbbells', 'treadmill', 'rower'] },
    expect: { weeks: 18, titles: ['Quality Run', 'Long Run'], phases: ['Taper', 'Race'] },
  },
  {
    name: '10K compressed timeline',
    profile: { ...base, goal: ['endurance'], eventGoal: '10k', eventDate: dateWeeksFromNow(6), days: 4 },
    expect: { weeks: 6, readiness: 'compressed', phases: ['Taper', 'Race'] },
  },
  {
    name: 'Triathlon with bike and rower',
    profile: { ...base, goal: ['endurance'], eventGoal: 'triathlon', eventDate: dateWeeksFromNow(14), days: 5, equipmentAccess: ['bike', 'rower', 'dumbbells', 'lat_pulldown'] },
    expect: { titles: ['Swim Technique', 'Bike Intervals', 'Brick Session'] },
  },
  {
    name: 'Hyrox CrossFit box station equipment',
    profile: { ...base, goal: ['hybrid'], eventGoal: 'hyrox', eventDate: dateWeeksFromNow(12), equipment: 'CrossFit box', equipmentAccess: ['ski_erg', 'sled', 'wall_ball', 'rower', 'sandbag'], days: 4 },
    expect: { contains: ['SkiErg', 'Sled Push', 'Sled Pull', 'Wall Ball', 'Rower', 'Sandbag Carry'] },
  },
  {
    name: 'CrossFit box skill/power',
    profile: { ...base, goal: ['sport_power'], eventGoal: 'crossfit', eventDate: dateWeeksFromNow(10), equipment: 'CrossFit box', equipmentAccess: ['rings', 'bumper_plates', 'olympic_barbell', 'rower', 'assault_bike'], days: 4 },
    expect: { contains: ['Ring Skill Practice', 'Olympic Lift Technique'] },
  },
  {
    name: 'Planet Fitness beginner muscle',
    profile: { ...base, goal: ['muscle'], level: 'beginner', equipment: 'Planet Fitness', equipmentAccess: ['smith_machine', 'fixed_dumbbells', 'selectorized_machines', 'leg_press', 'lat_pulldown'], days: 4 },
    expect: { containsAny: ['Smith Machine Squat', 'Leg Press', 'Lat Pulldown'] },
  },
  {
    name: 'Shoulder limitation return',
    profile: { ...base, goal: ['health'], limitations: 'rotator cuff shoulder pain, avoid overhead press', level: 'beginner' },
    expect: { avoid: ['Bench Press', 'Shoulder Press', 'Pull-Up', 'Lat Pulldown'] },
  },
  {
    name: 'Back limitation home gym',
    profile: { ...base, goal: ['strength'], equipment: 'home gym', equipmentAccess: ['adjustable_dumbbells', 'bench', 'bands'], limitations: 'low back pain avoid deadlifts' },
    expect: { avoid: ['Deadlift', 'Kettlebell Swing'] },
  },
  {
    name: 'Short busy executive',
    profile: { ...base, goal: ['health'], equipment: 'dumbbells', equipmentAccess: ['adjustable_dumbbells', 'bench'], duration: '15-20 min', days: 5, level: 'beginner' },
    expect: { duration: 20, supersets: true },
  },
  {
    name: 'Outdoor track hybrid',
    profile: { ...base, goal: ['hybrid'], equipment: 'outdoor/track', equipmentAccess: ['track', 'hills', 'stairs', 'pullup_bar', 'open_space'], days: 4 },
    expect: { avoid: ['Barbell', 'Machine', 'Cable'] },
  },
]

const includesAny = (text, items = []) => items.some((item) => text.includes(item))
const includesAll = (text, items = []) => items.every((item) => text.includes(item))

const checkPersona = ({ name, profile, expect: expected = {} }) => {
  const validation = validateProfile(profile)
  if (expected.validation) {
    return {
      name,
      ok: includesAny(validation.join(' '), expected.validation),
      validation,
      notes: ['Expected validation case.'],
    }
  }
  if (validation.length) return { name, ok: false, validation, errors: ['Unexpected validation failure.'] }

  const clean = normalizeProfile(profile)
  const program = buildFallbackProgram(clean)
  const exercises = Object.values(program.weeklyWorkouts || {}).flat().flatMap((session) => session.exercises.map((exercise) => exercise.name))
  const exerciseText = exercises.join(' ')
  const titles = program.workouts.map((workout) => workout.title)
  const phases = program.trainingPlan.map((week) => week.phase)
  const research = program.researchBasis.map((rule) => rule.label)
  const errors = []

  if (expected.weeks && program.trainingPlan.length !== expected.weeks) errors.push(`Expected ${expected.weeks} weeks, got ${program.trainingPlan.length}.`)
  if (expected.minDays && program.workouts.length < expected.minDays) errors.push(`Expected at least ${expected.minDays} days, got ${program.workouts.length}.`)
  if (expected.maxDays && program.workouts.length > expected.maxDays) errors.push(`Expected at most ${expected.maxDays} days, got ${program.workouts.length}.`)
  if (expected.minExercises && !program.workouts.every((workout) => workout.exercises.length >= expected.minExercises)) errors.push(`Expected all workouts to have at least ${expected.minExercises} exercises.`)
  if (expected.duration && !program.workouts.every((workout) => workout.duration === expected.duration)) errors.push(`Expected all workout durations to be ${expected.duration}.`)
  if (expected.supersets && !program.workouts.some((workout) => workout.exercises.some((exercise) => exercise.superset))) errors.push('Expected supersets.')
  if (expected.contains && !includesAll(exerciseText, expected.contains)) errors.push(`Missing expected exercises: ${expected.contains.filter((item) => !exerciseText.includes(item)).join(', ')}.`)
  if (expected.containsAny && !includesAny(exerciseText, expected.containsAny)) errors.push(`Missing any expected exercise from: ${expected.containsAny.join(', ')}.`)
  if (expected.avoid && includesAny(exerciseText, expected.avoid)) errors.push(`Found avoided terms: ${expected.avoid.filter((item) => exerciseText.includes(item)).join(', ')}.`)
  if (expected.titles && !expected.titles.every((title) => titles.includes(title))) errors.push(`Missing expected titles: ${expected.titles.filter((title) => !titles.includes(title)).join(', ')}.`)
  if (expected.phases && !expected.phases.every((phase) => phases.includes(phase))) errors.push(`Missing expected phases: ${expected.phases.filter((phase) => !phases.includes(phase)).join(', ')}.`)
  if (expected.readiness && program.eventReadiness !== expected.readiness) errors.push(`Expected readiness ${expected.readiness}, got ${program.eventReadiness}.`)
  if (expected.research && !expected.research.every((item) => research.includes(item))) errors.push(`Missing research labels: ${expected.research.filter((item) => !research.includes(item)).join(', ')}.`)
  if (expected.summary && !includesAll(program.summary, expected.summary)) errors.push(`Summary missing: ${expected.summary.filter((item) => !program.summary.includes(item)).join(', ')}.`)
  if (expected.title && !includesAll(program.title, expected.title)) errors.push(`Title missing: ${expected.title.filter((item) => !program.title.includes(item)).join(', ')}.`)

  const persistentSwap = substituteExercise(program, program.workouts[0].exercises[0].name, 'Dead Bug', true)
  const signatureStable = programSignature(clean) === program.signature
  const validSets = validateSet(200, 5) === '' && validateSet(2001, 5).includes('Weight')
  const parsed = parseSocialWorkout('Bench press 3x5, Row 4x10')
  const calc = estimatedOneRepMax(200, 5)

  if (!persistentSwap.excludedExercises.length) errors.push('Persistent swap did not save exclusion.')
  if (!signatureStable) errors.push('Program signature mismatch.')
  if (!validSets) errors.push('Set validation failed.')
  if (parsed.exercises.length < 2) errors.push('Social workout parser failed simple input.')
  if (calc !== 233) errors.push(`Unexpected e1RM calculation ${calc}.`)

  return {
    name,
    ok: errors.length === 0,
    errors,
    summary: {
      title: program.title,
      weeks: program.trainingPlan.length,
      days: program.workouts.length,
      firstWorkout: program.workouts[0].title,
      sampleExercises: exercises.slice(0, 8),
      eventReadiness: program.eventReadiness,
    },
  }
}

const results = personas.map(checkPersona)
const passed = results.filter((result) => result.ok)
const failed = results.filter((result) => !result.ok)

console.log(JSON.stringify({
  total: results.length,
  passed: passed.length,
  failed: failed.length,
  failures: failed,
  passedNames: passed.map((result) => result.name),
}, null, 2))

if (failed.length) process.exitCode = 1
