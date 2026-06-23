import { describe, expect, it } from 'vitest'
import { buildFallbackProgram, buildWeekSessions, estimateWorkoutMinutes, eventPlanMeta, parseSocialWorkout, programSignature, sessionDurationLimit, validateProfile, validateSet } from './engine'

const profile = {
  goal: ['strength'],
  equipment: 'commercial gym',
  days: 4,
  duration: '45-60 min',
  level: 'intermediate',
  limitations: '',
  sport: 'none',
  eventGoal: 'none',
}

const dateWeeksFromNow = (weeks) => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + weeks * 7)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

describe('FitMe deterministic engine', () => {
  it('generates a complete 12-week program offline', () => {
    const program = buildFallbackProgram(profile)

    expect(program.trainingPlan).toHaveLength(12)
    expect(program.workouts).toHaveLength(4)
    expect(program.weeklyWorkouts[1]).toHaveLength(4)
    expect(program.weeklyWorkouts[12][0].exercises.length).toBeGreaterThanOrEqual(6)
  })

  it('filters knee-risk lower-body movements when limitations mention knee pain', () => {
    const sessions = buildWeekSessions({ ...profile, limitations: 'knee pain, avoid squats and lunges' }, 1)
    const exerciseNames = sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name))

    expect(exerciseNames).not.toContain('Back Squat')
    expect(exerciseNames).not.toContain('Front Squat')
    expect(exerciseNames).not.toContain('Goblet Squat')
    expect(exerciseNames).not.toContain('Step-Up')
    expect(exerciseNames).not.toContain('Walking Lunge')
  })

  it('enforces logged-set bounds used by the workout logger', () => {
    expect(validateSet(185, 5)).toBe('')
    expect(validateSet(2001, 5)).toContain('Weight')
    expect(validateSet(185, 201)).toContain('Reps')
    expect(validateSet(2001, 201)).toContain('Weight')
    expect(validateSet(2001, 201)).toContain('Reps')
  })

  it('validates profile bounds before generation', () => {
    expect(validateProfile({ ...profile, age: -5, days: 999, limitations: 'x'.repeat(501) })).toEqual([
      'Age must be between 13 and 100.',
      'Training days must be between 2 and 6.',
      'Limitations must be 500 characters or less.',
    ])
  })

  it('requires free-text sport details when sport is not listed', () => {
    expect(validateProfile({ ...profile, sport: ['other'], customSport: '' })).toContain('Enter the sport that is not listed.')
    expect(validateProfile({ ...profile, sport: ['other'], customSport: 'Climbing' })).not.toContain('Enter the sport that is not listed.')
  })

  it('creates stable signatures for duplicate prevention', () => {
    expect(programSignature({ ...profile, days: '4' })).toBe(programSignature({ ...profile, days: 4 }))
  })

  it('parses simple social workout set and rep notation', () => {
    const workout = parseSocialWorkout('Bench press 3x5, Row 4x10')

    expect(workout.exercises[0].name).toBe('Bench press')
    expect(workout.exercises[0].sets).toBe(3)
    expect(workout.exercises[0].reps).toBe('5')
  })

  it('keeps beginner fat-loss knee profiles low impact', () => {
    const program = buildFallbackProgram({
      ...profile,
      age: 45,
      goal: ['fat_loss'],
      level: 'beginner',
      equipment: 'Planet Fitness',
      days: 3,
      limitations: 'bad knees and obesity',
    })
    const names = program.workouts.flatMap((session) => session.exercises.map((exercise) => exercise.name))

    expect(program.summary).toContain('Beginner load guidance')
    expect(names.join(' ')).not.toMatch(/Squat|Lunge|Step-Up|Zone 2 Run/)
    expect(names).toContain('Low-Impact Bike')
  })

  it('compresses busy executive sessions to short practical workouts', () => {
    const program = buildFallbackProgram({
      ...profile,
      age: 52,
      goal: ['health'],
      level: 'beginner',
      equipment: 'dumbbells',
      duration: '15-20 min',
      days: 5,
      limitations: 'frequent travel',
    })

    expect(program.summary).toContain('15-20 minute window')
    expect(program.workouts[0].duration).toBe(20)
    expect(program.workouts[0].exercises).toHaveLength(6)
    expect(program.workouts[0].exercises.some((exercise) => exercise.superset)).toBe(true)
  })

  it('adds older-adult balance and medical-risk coaching', () => {
    const program = buildFallbackProgram({
      ...profile,
      age: 68,
      goal: ['independence'],
      level: 'beginner',
      limitations: 'hypertension and mild arthritis',
    })
    const names = program.workouts.flatMap((session) => session.exercises.map((exercise) => exercise.name))

    expect(program.summary).toContain('Older-adult guidance')
    expect(program.summary).toContain('Medical-risk guidance')
    expect(names).toContain('Supported Single-Leg Balance')
  })

  it('protects rotator cuff return-to-training profiles from shoulder-heavy pressing', () => {
    const program = buildFallbackProgram({
      ...profile,
      age: 40,
      goal: ['health'],
      level: 'beginner',
      limitations: 'cleared rotator cuff injury, shoulder friendly',
    })
    const names = program.workouts.flatMap((session) => session.exercises.map((exercise) => exercise.name))

    expect(names.join(' ')).not.toMatch(/Bench Press|Shoulder Press|Pull-Up|Lat Pulldown/)
    expect(names).toContain('Isometric Wall Press')
  })

  it('caps teen in-season athlete training days and includes sport guidance', () => {
    const program = buildFallbackProgram({
      ...profile,
      age: 16,
      goal: ['sport_power'],
      sport: 'hockey',
      seasonPhase: 'in-season',
      days: 6,
      level: 'intermediate',
    })

    expect(program.workouts).toHaveLength(4)
    expect(program.summary).toContain('Athlete guidance')
    expect(program.summary).toContain('lateral power')
  })

  it('combines multiple goals and sports in generated program context', () => {
    const program = buildFallbackProgram({
      ...profile,
      goal: ['strength', 'fat_loss'],
      sport: ['hockey', 'soccer'],
      equipment: 'home gym',
      equipmentDetail: 'rack, adjustable dumbbells, treadmill',
    })

    expect(program.title).toContain('Hockey + Soccer')
    expect(program.goal).toBe('strength + fat_loss')
    expect(program.summary).toContain('lateral power')
    expect(program.summary).toContain('single-leg strength')
    expect(program.equipmentDetail).toBe('rack, adjustable dumbbells, treadmill')
  })

  it('varies prescriptions across mixed strength and muscle plans', () => {
    const program = buildFallbackProgram({
      ...profile,
      goal: ['strength', 'muscle'],
      split: ['body_part', 'push_pull_legs'],
      days: 4,
      exercisesPerDay: 6,
    })
    const prescriptions = new Set(program.workouts[0].exercises.map((exercise) => `${exercise.sets} x ${exercise.reps}`))

    expect(prescriptions.size).toBeGreaterThan(1)
    expect([...prescriptions]).toContain('4 x 4-6')
    expect([...prescriptions]).toContain('3 x 8-12')
  })

  it('generates volleyball-specific training qualities', () => {
    const program = buildFallbackProgram({
      ...profile,
      goal: ['sport_power'],
      sport: ['volleyball'],
      split: ['push_pull_legs'],
      exercisesPerDay: 7,
    })

    expect(program.title).toContain('Volleyball')
    expect(program.summary).toContain('landing mechanics')
    expect(program.workouts[0].title).toContain('Push')
    expect(program.workouts[0].exercises).toHaveLength(7)
    expect(program.workouts.flatMap((session) => session.exercises).some((exercise) => exercise.notes.includes('vertical power'))).toBe(true)
  })

  it('uses free-text sports and selected training setup in the program signature', () => {
    const program = buildFallbackProgram({
      ...profile,
      sport: ['other'],
      customSport: 'Pickleball',
      equipment: 'home gym',
      equipmentAccess: ['adjustable_dumbbells', 'bench', 'bands'],
      split: ['body_part', 'upper_lower'],
      exercisesPerDay: 8,
    })
    const first = programSignature({ ...profile, sport: ['other'], customSport: 'Pickleball', equipmentAccess: ['bands'], exercisesPerDay: 8 })
    const second = programSignature({ ...profile, sport: ['other'], customSport: 'Pickleball', equipmentAccess: ['rack_barbell'], exercisesPerDay: 8 })

    expect(program.title).toContain('Pickleball')
    expect(program.summary).toContain('lateral deceleration')
    expect(program.equipmentAccess).toContain('adjustable_dumbbells')
    expect(program.split).toEqual(['body_part', 'upper_lower'])
    expect(program.workouts[0].exercises).toHaveLength(8)
    expect(first).not.toBe(second)
  })

  it('includes equipment detail and multiple sports in duplicate signatures', () => {
    const first = programSignature({ ...profile, sport: ['hockey', 'soccer'], equipment: 'home gym', equipmentDetail: 'rack' })
    const second = programSignature({ ...profile, sport: ['hockey', 'soccer'], equipment: 'home gym', equipmentDetail: 'bands only' })

    expect(first).not.toBe(second)
  })

  it('respects bands-only equipment without barbell or machine prescriptions', () => {
    const program = buildFallbackProgram({
      ...profile,
      goal: ['health'],
      equipment: 'bands',
      level: 'beginner',
    })
    const names = program.workouts.flatMap((session) => session.exercises.map((exercise) => exercise.name)).join(' ')

    expect(names).not.toMatch(/Bar|Dumbbell|Machine|Cable|Leg Press|Lat Pulldown/)
    expect(names).toMatch(/Band|Push-Up|Dead Bug|Walk/)
  })

  it('builds marathon plans around the selected event date with taper and race week', () => {
    const eventDate = dateWeeksFromNow(20)
    const program = buildFallbackProgram({
      ...profile,
      goal: ['endurance'],
      eventGoal: 'marathon',
      eventDate,
      days: 5,
    })

    expect(program.trainingPlan).toHaveLength(20)
    expect(program.trainingPlan.at(-2).phase).toBe('Taper')
    expect(program.trainingPlan.at(-1).phase).toBe('Race')
    expect(program.trainingPlan.some((week) => week.longRun === 20)).toBe(true)
    expect(program.summary).toContain('A 20-week adaptive plan')
    expect(program.summary).not.toContain('A 12-week adaptive plan')
    expect(program.summary).toContain(`20 weeks to ${eventDate}`)
    expect(program.eventDate).toBe(eventDate)
    expect(program.eventGoal).toBe('marathon')
    expect(program.researchBasis.map((rule) => rule.label)).toContain('Endurance event progression')
    expect(program.workouts[2].exercises[0].notes).toContain('Evidence cue')
    expect(program.workouts.map((workout) => workout.title)).toContain('Quality Run')
    expect(program.workouts.map((workout) => workout.title)).toContain('Long Run')
    expect(program.workouts[0].rationale).toContain('race-specific speed')
    expect(program.workouts[0].exercises[0].logType).toBe('performance')
    expect(program.workouts[0].exercises[0].category).toBe('cardio')
  })

  it('generates triathlon-specific swim bike run and brick sessions', () => {
    const eventDate = dateWeeksFromNow(14)
    const program = buildFallbackProgram({
      ...profile,
      goal: ['endurance'],
      eventGoal: 'triathlon',
      eventDate,
      days: 5,
    })
    const titles = program.workouts.map((workout) => workout.title)
    const names = program.workouts.flatMap((workout) => workout.exercises.map((exercise) => exercise.name))

    expect(titles).toContain('Swim Technique')
    expect(titles).toContain('Bike Intervals')
    expect(titles).toContain('Brick Session')
    expect(names).toContain('Transition Run')
    expect(program.workouts.find((workout) => workout.title === 'Brick Session').rationale).toContain('bike-to-run transition')
  })

  it('generates Hyrox-specific compromised running and station work', () => {
    const eventDate = dateWeeksFromNow(10)
    const program = buildFallbackProgram({
      ...profile,
      goal: ['hybrid'],
      eventGoal: 'hyrox',
      eventDate,
      days: 4,
    })
    const names = program.workouts.flatMap((workout) => workout.exercises.map((exercise) => exercise.name)).join(' ')

    expect(program.workouts.map((workout) => workout.title)).toContain('Run + Station Intervals')
    expect(names).toContain('1 km Run Repeats')
    expect(names).toContain('Heavy March')
    expect(names).toContain('Bodyweight Squat to Reach')
    expect(program.workouts[0].rationale).toContain('compromised running')
  })

  it('generates CrossFit-style strength skill metcon and EMOM sessions', () => {
    const eventDate = dateWeeksFromNow(10)
    const program = buildFallbackProgram({
      ...profile,
      goal: ['sport_power'],
      eventGoal: 'crossfit',
      eventDate,
      days: 4,
    })
    const titles = program.workouts.map((workout) => workout.title)
    const names = program.workouts.flatMap((workout) => workout.exercises.map((exercise) => exercise.name))

    expect(titles).toContain('Strength + Skill')
    expect(titles).toContain('Mixed Modal Metcon')
    expect(titles).toContain('Engine EMOM')
    expect(names).toContain('AMRAP Mixed Modal Block')
    expect(names).toContain('Bodyweight Skill Practice')
    expect(program.workouts[1].exercises.find((exercise) => exercise.name === 'AMRAP Mixed Modal Block').logType).toBe('performance')
  })

  it('flags compressed event timelines while preserving a taper', () => {
    const eventDate = dateWeeksFromNow(8)
    const meta = eventPlanMeta({ ...profile, eventGoal: 'marathon', eventDate })
    const program = buildFallbackProgram({ ...profile, eventGoal: 'marathon', eventDate })

    expect(meta.readiness).toBe('compressed')
    expect(program.eventReadiness).toBe('compressed')
    expect(program.trainingPlan.at(-2).phase).toBe('Taper')
    expect(program.trainingPlan.at(-1).phase).toBe('Race')
  })

  it('blocks events that are too soon to prepare safely', () => {
    const eventDate = dateWeeksFromNow(2)
    expect(validateProfile({ ...profile, eventGoal: 'marathon', eventDate })).toContain(
      'Marathon is less than 4 weeks away. Choose a later event or generate a maintenance plan.',
    )
  })

  it('requires an event date when an event is selected', () => {
    expect(validateProfile({ ...profile, eventGoal: '10k', eventDate: '' })).toContain('Event date is required for event-specific plans.')
  })

  it('attaches guideline-based research rules to health and older-adult plans', () => {
    const program = buildFallbackProgram({
      ...profile,
      age: 70,
      goal: ['health', 'independence'],
      level: 'beginner',
      limitations: 'hypertension',
    })
    const labels = program.researchBasis.map((rule) => rule.label)

    expect(labels).toContain('HHS adult activity target')
    expect(labels).toContain('Older-adult multicomponent training')
    expect(labels).toContain('Chronic-condition safety')
    expect(program.summary).toContain('Guideline target')
  })

  it('positively selects equipment-specific gym exercises when available', () => {
    const program = buildFallbackProgram({
      ...profile,
      goal: ['strength'],
      equipment: 'commercial gym',
      equipmentAccess: ['trap_bar', 'lat_pulldown', 'leg_press', 'cables'],
      split: ['upper_lower'],
      days: 4,
    })
    const names = program.workouts.flatMap((session) => session.exercises.map((exercise) => exercise.name))

    expect(names).toContain('Cable Row')
    expect(names).toContain('Trap Bar Deadlift')
    expect(names).toContain('Leg Press')
  })

  it('uses selected Hyrox station equipment when generating race prep', () => {
    const program = buildFallbackProgram({
      ...profile,
      goal: ['hybrid'],
      eventGoal: 'hyrox',
      eventDate: dateWeeksFromNow(12),
      equipment: 'CrossFit box',
      equipmentAccess: ['ski_erg', 'sled', 'wall_ball', 'rower', 'sandbag'],
      days: 4,
      exercisesPerDay: 6,
    })
    const names = program.weeklyWorkouts[1].flatMap((session) => session.exercises.map((exercise) => exercise.name))

    expect(names).toContain('SkiErg')
    expect(names).toContain('Sled Push')
    expect(names).toContain('Sled Pull')
    expect(names).toContain('Wall Ball')
    expect(names).toContain('Rower')
    expect(names).toContain('Sandbag Carry')
  })

  it('does not treat commercial gym dumbbells as dumbbells-only equipment', () => {
    const program = buildFallbackProgram({
      ...profile,
      equipment: 'commercial gym',
      equipmentAccess: ['barbell_rack', 'dumbbells', 'machines'],
      split: ['push_pull_legs'],
      days: 4,
    })
    const names = program.workouts.flatMap((session) => session.exercises.map((exercise) => exercise.name))

    expect(names).toContain('Back Squat')
    expect(names).toContain('Bench Press')
  })

  it('keeps high-volume chest and back days varied instead of repeating the same press and row', () => {
    const program = buildFallbackProgram({
      ...profile,
      goal: ['strength', 'muscle'],
      equipment: 'commercial gym',
      equipmentAccess: ['barbell_rack', 'dumbbells', 'cables', 'machines', 'lat_pulldown', 'chest_press_machine', 'seated_row_machine'],
      split: ['body_part'],
      days: 4,
      exercisesPerDay: 10,
    })
    const chestBack = program.workouts.find((workout) => workout.title === 'Chest + Back Training')
    const names = chestBack.exercises.map((exercise) => exercise.name)
    const chestNames = names.filter((name) => /bench|press|fly|pec|push-up/i.test(name))
    const supersets = chestBack.exercises.filter((exercise) => exercise.superset)

    expect(chestBack.exercises).toHaveLength(10)
    expect(new Set(names).size).toBe(names.length)
    expect(chestNames).toEqual(expect.arrayContaining(['Bench Press', 'Incline Dumbbell Press', 'Machine Chest Press']))
    expect(chestNames.some((name) => /Fly|Pec Deck|Decline/i.test(name))).toBe(true)
    expect(chestBack.exercises.find((exercise) => /Fly|Pec Deck/i.test(exercise.name))).toMatchObject({ reps: '12-15' })
    expect(chestBack.exercises.find((exercise) => /Fly|Pec Deck/i.test(exercise.name)).sets).toBeLessThanOrEqual(3)
    expect(chestBack.exercises.find((exercise) => exercise.name === 'Incline Dumbbell Press')).toMatchObject({ reps: '8-10' })
    expect(chestBack.exercises.find((exercise) => exercise.name === 'Incline Dumbbell Press').sets).toBeLessThanOrEqual(3)
    expect(supersets.length).toBeLessThanOrEqual(4)
  })

  it('does not count mobility in every standard lifting workout and limits core to selected days', () => {
    const program = buildFallbackProgram({
      ...profile,
      goal: ['strength', 'muscle'],
      equipment: 'commercial gym',
      equipmentAccess: ['barbell_rack', 'dumbbells', 'cables', 'machines', 'lat_pulldown', 'leg_press'],
      split: ['body_part'],
      days: 4,
      exercisesPerDay: 8,
    })
    const allExercises = program.workouts.flatMap((workout) => workout.exercises)
    const mobilityCount = allExercises.filter((exercise) => exercise.category === 'mobility').length
    const coreWorkouts = program.workouts.filter((workout) => workout.exercises.some((exercise) => exercise.category === 'core'))

    expect(mobilityCount).toBe(0)
    expect(coreWorkouts.length).toBeLessThan(program.workouts.length)
    expect(coreWorkouts.length).toBeGreaterThanOrEqual(1)
  })

  it('uses direct arm work on shoulders and arms days', () => {
    const program = buildFallbackProgram({
      ...profile,
      goal: ['muscle'],
      equipment: 'commercial gym',
      equipmentAccess: ['dumbbells', 'cables', 'ez_bar', 'machines'],
      split: ['body_part'],
      days: 4,
      exercisesPerDay: 8,
    })
    const shouldersArms = program.workouts.find((workout) => workout.title === 'Shoulders + Arms Training')

    expect(shouldersArms.exercises.some((exercise) => exercise.category === 'arms')).toBe(true)
    expect(shouldersArms.exercises.map((exercise) => exercise.name).join(' ')).toMatch(/Curl|Triceps|Pressdown/)
  })

  it('keeps exercises aligned with the selected split focus and covers the major day muscles', () => {
    const program = buildFallbackProgram({
      ...profile,
      goal: ['strength', 'muscle'],
      equipment: 'commercial gym',
      equipmentAccess: ['barbell_rack', 'dumbbells', 'cables', 'machines', 'lat_pulldown', 'leg_press', 'ez_bar'],
      split: ['body_part'],
      days: 4,
      exercisesPerDay: 8,
    })
    const byTitle = Object.fromEntries(program.workouts.map((workout) => [workout.title, workout]))

    expect(byTitle['Chest + Back Training'].exercises.some((exercise) => exercise.category === 'push')).toBe(true)
    expect(byTitle['Chest + Back Training'].exercises.some((exercise) => exercise.category === 'pull')).toBe(true)
    expect(byTitle['Legs Training'].exercises.some((exercise) => exercise.category === 'squat')).toBe(true)
    expect(byTitle['Legs Training'].exercises.some((exercise) => exercise.category === 'hinge')).toBe(true)
    expect(byTitle['Legs Training'].exercises.some((exercise) => exercise.category === 'legs')).toBe(true)
    expect(byTitle['Shoulders + Arms Training'].exercises.some((exercise) => exercise.category === 'overhead')).toBe(true)
    expect(byTitle['Shoulders + Arms Training'].exercises.some((exercise) => exercise.category === 'arms')).toBe(true)
    expect(byTitle['Conditioning + Core Training'].exercises.some((exercise) => exercise.category === 'cardio')).toBe(true)
    expect(byTitle['Conditioning + Core Training'].exercises.some((exercise) => exercise.category === 'core')).toBe(true)
  })

  it('scales exercise difficulty for beginners', () => {
    const program = buildFallbackProgram({
      ...profile,
      goal: ['strength'],
      level: 'beginner',
      equipment: 'commercial gym',
      equipmentAccess: ['barbell_rack', 'dumbbells', 'cables', 'machines'],
      split: ['upper_lower'],
      days: 2,
      exercisesPerDay: 6,
    })
    const loaded = program.workouts.flatMap((workout) => workout.exercises).filter((exercise) => ['squat', 'hinge', 'push', 'pull', 'overhead', 'legs', 'arms'].includes(exercise.category))

    expect(loaded.every((exercise) => Number(exercise.sets) <= 2)).toBe(true)
    expect(loaded.some((exercise) => String(exercise.reps).includes('controlled'))).toBe(true)
    expect(loaded.every((exercise) => Number(exercise.rest) <= 90)).toBe(true)
  })

  it('keeps estimated standard workout duration within the selected session length', () => {
    const program = buildFallbackProgram({
      ...profile,
      goal: ['strength', 'muscle'],
      equipment: 'commercial gym',
      equipmentAccess: ['barbell_rack', 'dumbbells', 'cables', 'machines', 'lat_pulldown', 'leg_press', 'seated_row_machine', 'chest_press_machine'],
      split: ['body_part'],
      days: 4,
      duration: '45-60 min',
      exercisesPerDay: 10,
    })

    expect(program.workouts.every((workout) => estimateWorkoutMinutes(workout) <= sessionDurationLimit('45-60 min'))).toBe(true)
  })
})
