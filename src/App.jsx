import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  Bell,
  Calculator,
  Check,
  ChevronRight,
  Dumbbell,
  Edit3,
  Flame,
  Home,
  Info,
  Library,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Timer,
  Trash2,
  Trophy,
  UserRoundX,
} from 'lucide-react'
import './App.css'
import {
  EVENT_META,
  SPORT_PROFILES,
  applyWorkoutAdjustment,
  buildFallbackProgram,
  estimatedOneRepMax,
  normalizeProfile,
  parseSocialWorkout,
  programSignature,
  safeExercise,
  substituteExercise,
  validateProfile,
  validateSet,
} from './engine'
import { getExerciseInstruction } from './exerciseInstructions'
import { EQUIPMENT_ACCESS_BY_SETUP, EQUIPMENT_ACCESS_LABELS, TRAINING_SETUP_OPTIONS, defaultEquipmentAccess } from './setupOptions'
import { clearAccount, exportJson, loadData, saveData } from './storage'

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'plan', label: 'Plan', icon: Sparkles },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'tools', label: 'Tools', icon: Calculator },
]

const GOAL_OPTIONS = ['strength', 'muscle', 'fat_loss', 'health', 'endurance', 'sport_power', 'independence', 'hybrid']
const GOAL_LABELS = {
  strength: 'Strength',
  muscle: 'Muscle',
  fat_loss: 'Fat loss',
  health: 'Health and energy',
  endurance: 'Endurance',
  sport_power: 'Sport speed and power',
  independence: 'Independence',
  hybrid: 'Hybrid',
}

const TRAINING_SPLIT_OPTIONS = ['push_pull_legs', 'body_part', 'upper_lower']
const TRAINING_SPLIT_LABELS = {
  push_pull_legs: 'Push / Pull / Legs',
  body_part: 'Body part split',
  upper_lower: 'Upper / Lower',
}

const ENGINE_SCHEMA_VERSION = 4
const DATA_SCHEMA_VERSION = 2

const quickDefaults = {
  goal: ['health'],
  equipment: 'commercial gym',
  equipmentAccess: defaultEquipmentAccess('commercial gym'),
  equipmentDetail: '',
  days: 3,
  duration: '45-60 min',
  level: 'beginner',
  limitations: '',
  sport: ['none'],
  customSport: '',
  eventGoal: 'none',
  exercisesPerDay: 6,
  split: ['upper_lower'],
}

const customDefaults = {
  age: 34,
  gender: 'prefer not to say',
  bodyType: 'average',
  goal: ['strength', 'muscle'],
  sport: ['none'],
  customSport: '',
  sportPosition: '',
  seasonPhase: 'off-season',
  eventGoal: 'none',
  eventDate: '',
  trainingStructure: 'hybrid',
  equipment: 'commercial gym',
  equipmentAccess: defaultEquipmentAccess('commercial gym'),
  equipmentDetail: '',
  cardio: ['zone 2'],
  days: 4,
  duration: '45-60 min',
  split: ['upper_lower'],
  exercisesPerDay: 6,
  level: 'intermediate',
  focus: ['progressive overload'],
  limitations: '',
}

const savedProfileFields = (profile = {}) => ({
  age: profile.age ?? customDefaults.age,
  gender: profile.gender || customDefaults.gender,
  bodyType: profile.bodyType || customDefaults.bodyType,
  equipment: profile.equipment || customDefaults.equipment,
  equipmentAccess: Array.isArray(profile.equipmentAccess) && profile.equipmentAccess.length
    ? profile.equipmentAccess
    : defaultEquipmentAccess(profile.equipment || customDefaults.equipment),
  equipmentDetail: profile.equipmentDetail || '',
  level: profile.level || customDefaults.level,
  limitations: profile.limitations || '',
})

const buildQuickDefaults = (savedProfile) => {
  const saved = savedProfileFields(savedProfile)
  return {
    ...quickDefaults,
    equipment: saved.equipment,
    equipmentAccess: saved.equipmentAccess,
    equipmentDetail: saved.equipmentDetail,
    level: saved.level,
    limitations: saved.limitations,
  }
}

const buildCustomDefaults = (savedProfile) => {
  const saved = savedProfileFields(savedProfile)
  return {
    ...customDefaults,
    ...saved,
    goal: customDefaults.goal,
    sport: customDefaults.sport,
    customSport: '',
    sportPosition: '',
    seasonPhase: customDefaults.seasonPhase,
    eventGoal: 'none',
    eventDate: '',
    days: customDefaults.days,
    duration: customDefaults.duration,
    split: customDefaults.split,
    exercisesPerDay: customDefaults.exercisesPerDay,
  }
}

function App() {
  const [data, setData] = useState(() => migrateData(loadData()))
  const [tab, setTab] = useState('home')
  const [selectedProgramId, setSelectedProgramId] = useState(null)
  const [activeWorkout, setActiveWorkout] = useState(null)
  const [workoutSummary, setWorkoutSummary] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const result = saveData(data)
    if (!result || result.ok) return undefined
    const timer = setTimeout(() => setToast(result.message), 0)
    return () => clearTimeout(timer)
  }, [data])
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const selectedProgram = data.programs.find((program) => program.id === selectedProgramId) ?? data.programs[0]
  const stats = useMemo(() => computeStats(data), [data])

  const upsertProgram = (program) => {
    setData((current) => ({
      ...current,
      programs: current.programs.some((item) => item.id === program.id)
        ? current.programs.map((item) => (item.id === program.id ? program : item))
        : [program, ...current.programs],
      profile: current.profile,
    }))
    setSelectedProgramId(program.id)
  }

  const saveProgramFromProfile = (profile) => {
    const cleanProfile = normalizeProfile(profile)
    const signature = programSignature(cleanProfile)
    const existing = data.programs.find((program) => program.signature === signature)
    if (existing) {
      setSelectedProgramId(existing.id)
      setTab('library')
      setToast('Matching plan already exists')
      return
    }
    const program = buildFallbackProgram(cleanProfile)
    setData((current) => ({ ...current, profile: savedProfileFields(cleanProfile), programs: [program, ...current.programs] }))
    setSelectedProgramId(program.id)
    setTab('library')
    setToast('Program auto-saved to Library')
  }

  const finishWorkout = (payload) => {
    setData((current) => {
      const logs = [payload.log, ...current.logs]
      const prs = mergePrs(current.prs, payload.log.exercisesLogged, current.unit)
      const achievements = unlockAchievements({ ...current, logs, prs })
      return { ...current, logs, prs, achievements }
    })
    setWorkoutSummary(buildWorkoutSummary(payload.log, activeWorkout?.program))
    setActiveWorkout(null)
    setTab('home')
    setToast('Workout logged')
  }

  if (activeWorkout) {
    return (
      <ActiveWorkout
        workout={activeWorkout.workout}
        program={activeWorkout.program}
        unit={data.unit}
        logs={data.logs}
        prs={data.prs}
        onCancel={() => setActiveWorkout(null)}
        onFinish={finishWorkout}
        onSwap={(original, replacement, persistent) => {
          if (!activeWorkout.program) return
          const updated = substituteExercise(activeWorkout.program, original, replacement, persistent)
          upsertProgram(updated)
          setActiveWorkout({
            ...activeWorkout,
            program: updated,
            workout: replaceExerciseInWorkout(activeWorkout.workout, original, replacement),
          })
          setToast(persistent ? 'Exercise excluded from this program' : 'Exercise swapped')
        }}
      />
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" type="button" onClick={() => setTab('home')} aria-label="Go to FitMe home">
          <span className="brand-mark">FM</span>
          <span>
            <strong>FitMe</strong>
            <small>Adaptive training</small>
          </span>
        </button>
        <button className="icon-button" type="button" aria-label="Delete account data" onClick={() => confirmDelete(setData, setToast)}>
          <UserRoundX size={19} />
        </button>
      </header>

      <main>
        {tab === 'home' && (
          <HomeScreen
            data={data}
            stats={stats}
            onPlan={() => setTab('plan')}
            onImport={() => setTab('plan')}
            onStart={(program, workout) => setActiveWorkout({ program, workout })}
          />
        )}
        {tab === 'plan' && <PlanScreen savedProfile={data.profile} onSave={saveProgramFromProfile} onSaveWorkout={(workout) => setData((current) => ({ ...current, savedWorkouts: [workout, ...current.savedWorkouts] }))} setToast={setToast} />}
        {tab === 'library' && (
          <LibraryScreen
            programs={data.programs}
            savedWorkouts={data.savedWorkouts}
            selectedProgram={selectedProgram}
            onSelect={(program) => setSelectedProgramId(program.id)}
            onDelete={(programId) => setData((current) => ({ ...current, programs: current.programs.filter((program) => program.id !== programId) }))}
            onDeleteWorkout={(workoutId) => setData((current) => ({ ...current, savedWorkouts: current.savedWorkouts.filter((workout) => workout.id !== workoutId) }))}
            onStart={(program, workout) => setActiveWorkout({ program, workout })}
            onStartSaved={(workout) => setActiveWorkout({ workout })}
            onAdjust={(program, week, feedback) => {
              upsertProgram(applyWorkoutAdjustment(program, week, feedback))
              setToast('Remaining sessions adjusted')
            }}
            onRegenerate={(program, patch) => {
              upsertProgram(regenerateFutureWeeks(program, patch))
              setToast('Future weeks regenerated')
            }}
            onWeekSelect={(program, nextWeek) => {
              upsertProgram({ ...program, currentWeek: nextWeek })
              setToast(`Showing week ${nextWeek}`)
            }}
            onSwap={(program, original, replacement, persistent) => {
              upsertProgram(substituteExercise(program, original, replacement, persistent))
              setToast(persistent ? 'Persistent exclusion saved' : 'Exercise swapped')
            }}
          />
        )}
        {tab === 'progress' && (
          <ProgressScreen
            data={data}
            stats={stats}
            onExport={() => exportJson(data)}
            onMeasurement={(measurement) => setData((current) => ({ ...current, measurements: [measurement, ...current.measurements] }))}
          />
        )}
        {tab === 'tools' && <ToolsScreen />}
      </main>

      <nav className="tabbar" aria-label="Primary navigation">
        {tabs.map((item) => {
          const Icon = item.icon
          return (
            <button key={item.id} type="button" className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)} aria-label={item.label}>
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      {data.recoveryNotice && <div className="toast">{data.recoveryNotice}</div>}
      {workoutSummary && <AdaptationSummary summary={workoutSummary} onClose={() => setWorkoutSummary(null)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function HomeScreen({ data, stats, onPlan, onImport, onStart }) {
  const next = data.programs[0]
  const nextWorkout = next?.weeklyWorkouts?.[next.currentWeek]?.[0] ?? next?.workouts?.[0]
  const brief = coachBrief(data, stats, next, nextWorkout)
  const planProof = next ? planProofPoints(next) : [
    ['1', 'Tell FitMe your goal, event, sport, setup, and limitations.'],
    ['2', 'Get a week-by-week plan with today already selected.'],
    ['3', 'Log effort so future sessions can adapt.'],
  ]
  return (
    <section className="screen stack">
      <div className="hero-band">
        <div>
          <p className="eyebrow">Adaptive fitness coach</p>
          <h1>{next ? 'Today is already planned.' : 'Your plan, built around you.'}</h1>
          <p className="hero-copy">{next ? 'FitMe is not just a tracker: it adapts training around performance, injuries, sport, event date, and equipment.' : 'Not just a tracker. Answer a few questions and get adaptive training that respects your goal, equipment, schedule, sport, event, and limitations.'}</p>
        </div>
        <ShieldCheck size={34} />
      </div>

      <section className="value-ladder" aria-label="FitMe value steps">
        {planProof.map(([label, text]) => (
          <div key={label}>
            <strong>{label}</strong>
            <span>{text}</span>
          </div>
        ))}
      </section>

      <section className="coach-brief">
        <div>
          <p className="eyebrow">{brief.kicker}</p>
          <h2>{brief.title}</h2>
          <p>{brief.body}</p>
        </div>
        {brief.action && (
          <button className="primary" type="button" onClick={brief.action === 'plan' ? onPlan : () => onStart(next, nextWorkout)}>
            {brief.action === 'plan' ? 'Build Plan' : 'Start'} <ChevronRight size={18} />
          </button>
        )}
      </section>

      <div className="stat-grid">
        <Metric icon={Flame} label="Streak" value={`${stats.streak}d`} />
        <Metric icon={Activity} label="7-day activity" value={`${stats.weekSessions}`} />
        <Metric icon={Dumbbell} label="Volume" value={`${stats.monthVolume.toLocaleString()} lb`} />
      </div>

      <div className="proof-strip">
        <span>Performance-based adaptation</span>
        <span>Injury-aware exercise choices</span>
        <span>Sport + event specificity</span>
        <span>Equipment-matched workouts</span>
      </div>

      <ReminderPanel data={data} stats={stats} program={next} nextWorkout={nextWorkout} />

      {next ? (
        <article className="card callout">
          <div>
            <p className="eyebrow">Next workout</p>
            <h2>{nextWorkout.title}</h2>
            {nextWorkout.rationale && <p className="muted">{nextWorkout.rationale}</p>}
            <p>{next.title} · Week {next.currentWeek}</p>
          </div>
          <button className="primary" type="button" onClick={() => onStart(next, nextWorkout)}>
            Start <ChevronRight size={18} />
          </button>
        </article>
      ) : (
        <article className="empty-state">
          <Dumbbell size={42} />
          <h2>No program yet</h2>
          <p>Start with a quick plan, then refine it into sport, event, equipment, and injury-aware training.</p>
          <div className="starter-grid">
            <span>Train for a marathon</span>
            <span>Build muscle at home</span>
            <span>Volleyball off-season</span>
            <span>Hyrox race prep</span>
          </div>
          <DemoPlanGrid />
          <div className="button-row">
            <button className="primary" type="button" onClick={onPlan}>
              Build My Plan
            </button>
            <button className="secondary" type="button" onClick={onImport}>
              Import from Social
            </button>
          </div>
        </article>
      )}

      <section className="card">
        <SectionTitle title="Recent PRs" action={`${data.prs.length} total`} />
        {data.prs.slice(0, 3).map((pr) => (
          <div className="list-row" key={pr.exerciseName}>
            <span>{pr.exerciseName}</span>
            <strong>{pr.weight} x {pr.reps}</strong>
          </div>
        ))}
        {!data.prs.length && <p className="muted">Finish your first workout and FitMe will start surfacing strength wins automatically.</p>}
      </section>

      <section className="card">
        <SectionTitle title="Achievements" action={`${data.achievements.length}/5`} />
        <div className="achievement-grid">
          {achievementCatalog.map((item) => (
            <div className={`achievement ${data.achievements.includes(item.id) ? 'done' : ''}`} key={item.id}>
              <Trophy size={18} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="privacy-strip">
        <ShieldCheck size={16} />
        <span>Safety note: FitMe is training guidance, not medical advice. Use clinician guidance for injuries, symptoms, or medical conditions.</span>
      </section>
    </section>
  )
}

function ReminderPanel({ data, stats, program, nextWorkout }) {
  const reminders = []
  if (program && nextWorkout) reminders.push(['Next workout ready', `${nextWorkout.title} is queued for week ${program.currentWeek}.`])
  if (program?.eventDate) reminders.push(['Event countdown', `${inferEventLabel(program)} is ${eventDaysLeft(program.eventDate)} days away.`])
  if (stats.weekSessions === 0 && data.logs.length) reminders.push(['Streak at risk', 'One short session keeps the training rhythm alive.'])
  if (program && shouldDeload(program)) reminders.push(['Deload triggered', 'Recent hard feedback suggests reducing volume.'])
  if (!reminders.length) reminders.push(['Build momentum', 'Generate a plan and FitMe will surface reminders here.'])
  return (
    <section className="card reminder-panel">
      <SectionTitle title="Re-engagement" action="local cues" />
      {reminders.map(([title, body]) => (
        <div className="reminder-row" key={title}>
          <Bell size={16} />
          <span><strong>{title}</strong><small>{body}</small></span>
        </div>
      ))}
    </section>
  )
}

function DemoPlanGrid() {
  const samples = [
    ['Marathon', 'Date-aware mileage, long runs, taper, strength support'],
    ['Hyrox', 'Compromised running, sleds, carries, wall balls, station readiness'],
    ['Volleyball', 'Vertical power, landing mechanics, shoulder durability'],
    ['Muscle Gain', 'Hypertrophy volume, supersets, equipment-matched splits'],
    ['Home Gym', 'Rack, dumbbells, bands, treadmill, or minimal setup'],
    ['Older Adult Strength', 'Balance, mobility, conservative progression, safety cues'],
  ]
  return (
    <div className="demo-grid">
      {samples.map(([title, body]) => (
        <div key={title}>
          <strong>{title}</strong>
          <span>{body}</span>
        </div>
      ))}
    </div>
  )
}

function StepHelp({ step, mode }) {
  const copy = {
    Goal: 'Not sure? Choose Health and energy. FitMe can still progress strength and conditioning safely.',
    Goals: 'You can select more than one goal. FitMe blends them instead of forcing a single template.',
    Profile: 'These details help scale recommendations. Prefer not to share? Keep the default options.',
    'Sport/Event': 'If your sport is not listed, enter it. Event dates let FitMe build, peak, and taper instead of guessing.',
    Setup: 'Select what you truly have access to most weeks. Extra notes help with ranges, limits, and shared equipment.',
    Schedule: 'Not sure? Start with 3-4 days and 45-60 minutes. Consistency beats an ambitious plan you cannot repeat.',
    Review: 'Check the plan fit before saving. You can regenerate future weeks later if your setup, event, or limitations change.',
  }
  return (
    <div className="helper-note">
      <Info size={16} />
      <span>{copy[step] || (mode === 'quick' ? 'Quick Plan uses safe defaults you can refine later.' : 'Answer only what you know; defaults are designed to be safe.')}</span>
    </div>
  )
}

function PlanScreen({ savedProfile, onSave, onSaveWorkout, setToast }) {
  const [mode, setMode] = useState('quick')
  const [quick, setQuick] = useState(() => buildQuickDefaults(savedProfile))
  const [custom, setCustom] = useState(() => buildCustomDefaults(savedProfile))
  const [socialText, setSocialText] = useState('')
  const [errors, setErrors] = useState([])
  const [step, setStep] = useState(0)
  const current = mode === 'quick' ? quick : custom
  const sportOptions = [...Object.keys(SPORT_PROFILES), 'other']
  const sportLabels = { ...Object.fromEntries(Object.entries(SPORT_PROFILES).map(([key, value]) => [key, value.label])), other: 'Sport not listed' }
  const equipmentAccessOptions = EQUIPMENT_ACCESS_BY_SETUP[current.equipment] ?? EQUIPMENT_ACCESS_BY_SETUP['commercial gym']
  const wizardSteps = mode === 'quick'
    ? ['Goal', 'Setup', 'Schedule', 'Review']
    : ['Profile', 'Goals', 'Sport/Event', 'Setup', 'Schedule', 'Review']
  const isReview = step === wizardSteps.length - 1
  const update = (patch) => {
    setErrors([])
    return mode === 'quick' ? setQuick((state) => ({ ...state, ...patch })) : setCustom((state) => ({ ...state, ...patch }))
  }
  const changeMode = (nextMode) => {
    setMode(nextMode)
    setStep(0)
    setErrors([])
  }
  const submitPlan = () => {
    const validation = validateProfile(current)
    if (validation.length) {
      setErrors(validation)
      return
    }
    onSave(current)
  }
  const nextStep = () => {
    const validation = isReview ? validateProfile(current) : stepValidation(current, wizardSteps[step])
    if (validation.length) {
      setErrors(validation)
      return
    }
    setErrors([])
    setStep((value) => Math.min(value + 1, wizardSteps.length - 1))
  }

  return (
    <section className="screen stack">
      <div className="flow-header">
        <p className="eyebrow">Build the right plan</p>
        <h1>{mode === 'quick' ? 'Start fast.' : mode === 'custom' ? 'Coach the engine.' : 'Bring a workout in.'}</h1>
        <p className="hero-copy">
          {mode === 'quick'
            ? 'Quick Plan is the lowest-friction path to a useful first week.'
            : mode === 'custom'
              ? 'Custom Program gives FitMe the context it needs for goals, sport, events, setup, split, and limitations.'
              : 'Import a social workout, save it, then run it through the same logging flow.'}
          </p>
      </div>
      <Segmented value={mode} onChange={changeMode} options={[['quick', 'Quick'], ['custom', 'Custom'], ['import', 'Import']]} />

      {mode !== 'import' ? (
        <>
          <PlanPreview profile={current} mode={mode} />
          <form
            className="card form-stack wizard-card"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              if (isReview) submitPlan()
              else nextStep()
            }}
          >
            <SectionTitle title={wizardSteps[step]} action={`${step + 1}/${wizardSteps.length}`} />
            <StepHelp step={wizardSteps[step]} mode={mode} />
            <div className="progress-track" aria-label="Onboarding progress">
              {wizardSteps.map((item, index) => (
                <button key={item} type="button" className={index === step ? 'active' : index < step ? 'done' : ''} onClick={() => setStep(index)}>
                  {item}
                </button>
              ))}
            </div>

            {mode === 'quick' && step === 0 && <CheckboxGroup label="Goals" values={current.goal} onChange={(goal) => update({ goal })} options={GOAL_OPTIONS} labels={GOAL_LABELS} />}
            {mode === 'quick' && step === 1 && (
              <>
                <Select label="Training setup" value={current.equipment} onChange={(equipment) => update({ equipment, equipmentAccess: defaultEquipmentAccess(equipment) })} options={TRAINING_SETUP_OPTIONS} />
                <EquipmentAccessGroup values={current.equipmentAccess} onChange={(equipmentAccess) => update({ equipmentAccess })} options={equipmentAccessOptions} />
                <TextInput label="Additional setup notes" value={current.equipmentDetail} onChange={(equipmentDetail) => update({ equipmentDetail })} placeholder="Dumbbell range, no rack, shared equipment..." maxLength={500} />
              </>
            )}
            {mode === 'quick' && step === 2 && (
              <>
                <NumberInput label="Days per week" value={current.days} onChange={(days) => update({ days })} min={2} max={6} />
                <Select label="Session length" value={current.duration} onChange={(duration) => update({ duration })} options={['15-20 min', '30-40 min', '45-60 min', '60-75 min', '75+ min']} />
                <Select label="Level" value={current.level} onChange={(level) => update({ level })} options={['beginner', 'intermediate', 'advanced']} />
                <TextInput label="Limitations or injuries" value={current.limitations} onChange={(limitations) => update({ limitations })} placeholder="Shoulder, knee, back, avoid squats..." maxLength={500} />
              </>
            )}

            {mode === 'custom' && step === 0 && (
              <div className="field-grid">
                <NumberInput label="Age" value={current.age} onChange={(age) => update({ age })} min={13} max={100} />
                <Select label="Gender" value={current.gender} onChange={(gender) => update({ gender })} options={['prefer not to say', 'woman', 'man', 'non-binary', 'self-describe']} />
                <Select label="Body type" value={current.bodyType} onChange={(bodyType) => update({ bodyType })} options={['lean', 'average', 'muscular', 'larger body', 'recomposition focused']} />
              </div>
            )}
            {mode === 'custom' && step === 1 && <CheckboxGroup label="Goals" values={current.goal} onChange={(goal) => update({ goal })} options={GOAL_OPTIONS} labels={GOAL_LABELS} />}
            {mode === 'custom' && step === 2 && (
              <>
                <CheckboxGroup label="Sports" values={current.sport} onChange={(sport) => update({ sport })} options={sportOptions} labels={sportLabels} exclusiveValue="none" />
                {current.sport.includes('other') && <TextInput label="Sport not listed" value={current.customSport} onChange={(customSport) => update({ customSport })} placeholder="Pickleball, rugby, dance, climbing..." maxLength={60} />}
                {!current.sport.includes('none') && <TextInput label="Position or context" value={current.sportPosition} onChange={(sportPosition) => update({ sportPosition })} placeholder="Guard, winger, striker, multi-sport..." />}
                <Select label="Season phase" value={current.seasonPhase} onChange={(seasonPhase) => update({ seasonPhase })} options={['off-season', 'pre-season', 'in-season']} />
                <Select label="Event" value={current.eventGoal} onChange={(eventGoal) => update({ eventGoal })} options={Object.keys(EVENT_META)} labels={Object.fromEntries(Object.entries(EVENT_META).map(([key, value]) => [key, value.label]))} />
                {current.eventGoal !== 'none' && <TextInput type="date" label="Event date" value={current.eventDate} onChange={(eventDate) => update({ eventDate })} />}
              </>
            )}
            {mode === 'custom' && step === 3 && (
              <>
                <Select label="Training setup" value={current.equipment} onChange={(equipment) => update({ equipment, equipmentAccess: defaultEquipmentAccess(equipment) })} options={TRAINING_SETUP_OPTIONS} />
                <EquipmentAccessGroup values={current.equipmentAccess} onChange={(equipmentAccess) => update({ equipmentAccess })} options={equipmentAccessOptions} />
                <TextInput label="Additional setup notes" value={current.equipmentDetail} onChange={(equipmentDetail) => update({ equipmentDetail })} placeholder="Dumbbell range, cable limits, treadmill, no rack, shared equipment..." maxLength={500} />
              </>
            )}
            {mode === 'custom' && step === 4 && (
              <>
                <NumberInput label="Days per week" value={current.days} onChange={(days) => update({ days })} min={2} max={6} />
                <NumberInput label="Exercises per day" value={current.exercisesPerDay} onChange={(exercisesPerDay) => update({ exercisesPerDay })} min={6} max={12} />
                <CheckboxGroup label="Training split" values={current.split} onChange={(split) => update({ split })} options={TRAINING_SPLIT_OPTIONS} labels={TRAINING_SPLIT_LABELS} />
                <Select label="Session length" value={current.duration} onChange={(duration) => update({ duration })} options={['15-20 min', '30-40 min', '45-60 min', '60-75 min', '75+ min']} />
                <Select label="Level" value={current.level} onChange={(level) => update({ level })} options={['beginner', 'intermediate', 'advanced']} />
                <TextInput label="Limitations or injuries" value={current.limitations} onChange={(limitations) => update({ limitations })} placeholder="Shoulder, knee, back, avoid squats..." maxLength={500} />
              </>
            )}
            {isReview && <PlanReview profile={current} />}

            {errors.length > 0 && <ErrorList errors={errors} />}
            <div className="wizard-actions">
              <button className="secondary" type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>
                Back
              </button>
              <button className="primary" type="submit">
                {isReview ? <><Save size={18} /> Generate and Auto-save</> : <>Continue <ChevronRight size={18} /></>}
              </button>
            </div>
          </form>
        </>
      ) : (
        <form
          className="card form-stack"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            if (!socialText.trim()) {
              setErrors(['Paste a workout link or description before importing.'])
              return
            }
            const workout = parseSocialWorkout(socialText)
            onSaveWorkout(workout)
            setSocialText('')
            setErrors([])
            setToast('Imported workout saved')
          }}
        >
          <SectionTitle title="Import from Social" action="local parser" />
          <label>
            <span>Link or description</span>
            <textarea value={socialText} onChange={(event) => { setErrors([]); setSocialText(event.target.value) }} placeholder="Paste a post, URL, or list of movements..." required maxLength={2000} />
          </label>
          {errors.length > 0 && <ErrorList errors={errors} />}
          <button className="primary full" type="submit">
            <Plus size={18} /> Parse and Save
          </button>
          <p className="fine-print">Production hook: send this text to the serverless Anthropic proxy, then validate returned JSON before saving.</p>
        </form>
      )}
    </section>
  )
}

function LibraryScreen({ programs, savedWorkouts, selectedProgram, onSelect, onDelete, onDeleteWorkout, onStart, onStartSaved, onAdjust, onRegenerate, onWeekSelect, onSwap }) {
  const [view, setView] = useState('programs')
  const [swapTarget, setSwapTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [instructionTarget, setInstructionTarget] = useState(null)
  const week = selectedProgram?.currentWeek ?? 1
  const sessions = selectedProgram?.weeklyWorkouts?.[week] ?? selectedProgram?.workouts ?? []
  const researchBasis = selectedProgram ? planResearchBasis(selectedProgram) : []

  return (
    <section className="screen stack">
      <Segmented value={view} onChange={setView} options={[['programs', 'Programs'], ['workouts', 'Saved']]} />
      {view === 'programs' ? (
        <>
          <div className="program-list">
            {programs.map((program) => (
              <button key={program.id} type="button" className={`program-pill ${selectedProgram?.id === program.id ? 'active' : ''}`} onClick={() => onSelect(program)}>
                <span>{program.title}</span>
                <small>Week {program.currentWeek}/{program.trainingPlan?.length ?? 12}</small>
              </button>
            ))}
          </div>
          {!programs.length && <EmptyMini text="Generated plans auto-save here." />}
          {selectedProgram && (
            <article className="card stack">
              <SectionTitle title={selectedProgram.title} action={selectedProgram.splitType} />
              <p>{programSummary(selectedProgram)}</p>
              <ProgramCoachSummary program={selectedProgram} week={week} sessions={sessions} />
              <PlanProfileSummary program={selectedProgram} />
              <EventReadinessPanel program={selectedProgram} week={week} sessions={sessions} />
              <div className="button-row">
                <button className="secondary" type="button" onClick={() => setEditTarget(selectedProgram)}>
                  <Edit3 size={16} /> Edit future weeks
                </button>
              </div>
              {selectedProgram.eventDate && <div className="banner subtle">Event date: {selectedProgram.eventDate} · {selectedProgram.trainingPlan.length} week build with taper.</div>}
              {selectedProgram.eventReadiness === 'compressed' && <div className="banner">Compressed event timeline. Progression is conservative and taper is protected.</div>}
              {selectedProgram.limitations && <SafetyPanel limitations={selectedProgram.limitations} />}
              {selectedProgram.weekFeedback?.[week] && <div className="banner subtle">Adapted from feedback: week {week} was marked {selectedProgram.weekFeedback[week]}, so remaining session volume is adjusted transparently.</div>}
              {researchBasis.length > 0 && (
                <div className="research-box">
                  <SectionTitle title="Why this plan" action={`${researchBasis.length} rules`} />
                  {researchBasis.map((rule) => (
                    <div className="research-rule" key={rule.label}>
                      <strong>{rule.label}</strong>
                      <span>{rule.prescription}</span>
                      <small>{rule.source}</small>
                    </div>
                  ))}
                </div>
              )}
              {shouldDeload(selectedProgram) && <div className="banner">Auto-deload recommended from recent hard feedback.</div>}
              <GroupedRoadmap program={selectedProgram} activeWeek={week} onWeekSelect={onWeekSelect} />
              <div className="banner subtle">Showing week {week}: {selectedProgram.trainingPlan[week - 1]?.note}</div>
              <div className="button-row">
                {['hard', 'normal', 'easy'].map((feedback) => (
                  <button key={feedback} className="secondary" type="button" onClick={() => onAdjust(selectedProgram, week, feedback)}>
                    {feedback === 'hard' ? 'Too Hard' : feedback === 'easy' ? 'Too Easy' : 'Just Right'}
                  </button>
                ))}
              </div>
              {sessions.map((session) => (
                <WorkoutCard key={session.title} workout={session} onStart={() => onStart(selectedProgram, session)} onSwap={(exercise) => setSwapTarget({ program: selectedProgram, exercise })} onInstruction={setInstructionTarget} />
              ))}
              <button className="danger-link" type="button" onClick={() => window.confirm('Delete this program?') && onDelete(selectedProgram.id)}>
                <Trash2 size={17} /> Delete program
              </button>
            </article>
          )}
        </>
      ) : (
        <article className="card stack">
          <SectionTitle title="Saved Workouts" action={`${savedWorkouts.length}`} />
          {savedWorkouts.map((workout) => (
            <div className="saved-workout" key={workout.id}>
              <button type="button" onClick={() => onStartSaved(workout)}>
                <strong>{workout.title}</strong>
                <small>{workout.exercises.length} exercises</small>
              </button>
              <button className="icon-button" type="button" aria-label={`Delete ${workout.title}`} onClick={() => onDeleteWorkout(workout.id)}>
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          {!savedWorkouts.length && <EmptyMini text="Imported social workouts appear here." />}
        </article>
      )}
      {swapTarget && (
        <SwapDialog
          target={swapTarget}
          onClose={() => setSwapTarget(null)}
          onSave={(replacement, persistent) => {
            onSwap(swapTarget.program, swapTarget.exercise.name, replacement, persistent)
            setSwapTarget(null)
          }}
        />
      )}
      {editTarget && (
        <ProgramEditDialog
          program={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(patch) => {
            onRegenerate(editTarget, patch)
            setEditTarget(null)
          }}
        />
      )}
      {instructionTarget && <InstructionDialog exercise={instructionTarget} onClose={() => setInstructionTarget(null)} />}
    </section>
  )
}

function ActiveWorkout({ workout, program, unit, logs, prs, onCancel, onFinish, onSwap }) {
  const [entries, setEntries] = useState(() => Object.fromEntries(workout.exercises.map((ex) => [ex.id, [{ weight: '', reps: '' }]])))
  const [effort, setEffort] = useState('just right')
  const [error, setError] = useState('')
  const [rest, setRest] = useState(0)
  const [instructionTarget, setInstructionTarget] = useState(null)

  useEffect(() => {
    if (!rest) return undefined
    const timer = setInterval(() => setRest((value) => Math.max(0, value - 1)), 1000)
    return () => clearInterval(timer)
  }, [rest])

  const logSet = (exercise, index, patch) => {
    setEntries((current) => ({
      ...current,
      [exercise.id]: current[exercise.id].map((set, setIndex) => (setIndex === index ? { ...set, ...patch } : set)),
    }))
  }
  const addSet = (exercise, seed = { weight: '', reps: '' }) => {
    setEntries((current) => ({ ...current, [exercise.id]: [...current[exercise.id], seed] }))
  }
  const copyPreviousSet = (exercise) => {
    const previous = entries[exercise.id]?.at(-1) ?? { weight: '', reps: '' }
    addSet(exercise, { weight: previous.weight, reps: previous.reps })
  }
  const copyLastLoggedSet = (exercise) => {
    const history = exerciseHistory(exercise.name, logs, prs)
    if (history.lastSet) addSet(exercise, { weight: String(history.lastSet.weight || ''), reps: String(history.lastSet.reps || '') })
  }
  const fillPrescribed = (exercise) => {
    const reps = suggestedReps(exercise.reps)
    setEntries((current) => ({
      ...current,
      [exercise.id]: Array.from({ length: Number(exercise.sets) || 1 }, () => ({ weight: '', reps })),
    }))
  }
  const markPerformanceDone = (exercise) => {
    setEntries((current) => ({ ...current, [exercise.id]: [{ result: current[exercise.id]?.[0]?.result || 'completed as prescribed' }] }))
    setRest(exercise.rest)
  }

  return (
    <div className="app-shell workout-mode">
      <header className="app-header">
        <button className="secondary" type="button" onClick={onCancel}>Close</button>
        <div className="timer"><Timer size={17} /> {rest}s</div>
      </header>
      <main className="screen stack">
        <div className="hero-band compact">
          <div>
            <p className="eyebrow">{program ? `Week ${program.currentWeek}` : 'Saved workout'}</p>
            <h1>{workout.title}</h1>
          </div>
        </div>
        {workout.exercises.map((exercise) => (
          <article className="card exercise-log" key={exercise.id}>
            <SectionTitle title={exercise.name} action={`${exercise.sets} x ${exercise.reps}`} />
            {exercise.superset && <span className="superset-badge">{exercise.superset}</span>}
            <ExerciseInstruction exercise={exercise} />
            <button className="secondary full" type="button" onClick={() => setInstructionTarget(exercise)}>
              <Info size={16} /> How to do this
            </button>
            <ExerciseHistoryPanel history={exerciseHistory(exercise.name, logs, prs)} unit={unit} />
            <p className="muted">{exercise.notes}</p>
            <div className="quick-log-row">
              {!isPerformanceExercise(exercise) && <button className="secondary" type="button" onClick={() => fillPrescribed(exercise)}>Fill prescribed</button>}
              {!isPerformanceExercise(exercise) && <button className="secondary" type="button" onClick={() => copyLastLoggedSet(exercise)}>Copy last logged</button>}
              {isPerformanceExercise(exercise) && <button className="secondary" type="button" onClick={() => markPerformanceDone(exercise)}>Mark prescribed</button>}
            </div>
            {isPerformanceExercise(exercise) ? (
              <div className="performance-row">
                <input aria-label={`${exercise.name} result`} placeholder="time, pace, distance, rounds, notes..." value={entries[exercise.id][0]?.result || ''} onChange={(event) => logSet(exercise, 0, { result: event.target.value })} />
                <button className="icon-button" type="button" aria-label="Mark result done" onClick={() => setRest(exercise.rest)}>
                  <Check size={18} />
                </button>
              </div>
            ) : entries[exercise.id].map((set, index) => (
                <div className="set-row" key={`${exercise.id}-${index}`}>
                  <span>Set {index + 1}</span>
                  <input aria-label={`${exercise.name} set ${index + 1} weight`} inputMode="decimal" placeholder={unit} value={set.weight} onChange={(event) => logSet(exercise, index, { weight: event.target.value })} />
                  <input aria-label={`${exercise.name} set ${index + 1} reps`} inputMode="numeric" placeholder="reps" value={set.reps} onChange={(event) => logSet(exercise, index, { reps: event.target.value })} />
                  <button className="icon-button" type="button" aria-label="Mark set done" onClick={() => setRest(exercise.rest)}>
                    <Check size={18} />
                  </button>
                </div>
              ))}
            <div className="button-row">
              {!isPerformanceExercise(exercise) && <button className="secondary" type="button" onClick={() => addSet(exercise)}>Add set</button>}
              {!isPerformanceExercise(exercise) && <button className="secondary" type="button" onClick={() => copyPreviousSet(exercise)}>Copy previous</button>}
              {program && <button className="secondary" type="button" onClick={() => onSwap(exercise.name, safeExercise(exercise.category || 'core', program, 2), false)}><RefreshCw size={16} /> Quick swap</button>}
            </div>
          </article>
        ))}
        <label>
          <span>Readiness / effort</span>
          <select value={effort} onChange={(event) => setEffort(event.target.value)}>
            <option>too hard</option>
            <option>just right</option>
            <option>too easy</option>
          </select>
        </label>
        {error && <div className="error">{error}</div>}
        <button
          className="primary full"
          type="button"
          onClick={() => {
            const logged = workout.exercises.map((exercise) => ({
              name: exercise.name,
              sets: isPerformanceExercise(exercise)
                ? entries[exercise.id].filter((set) => set.result).map((set) => ({ weight: 0, reps: 1, result: set.result }))
                : entries[exercise.id].filter((set) => set.weight !== '' || set.reps !== '').map((set) => ({ weight: Number(set.weight || 0), reps: Number(set.reps || 0) })),
            }))
            const invalid = [...new Set(logged.flatMap((exercise) => exercise.sets.map((set) => validateSet(set.weight, set.reps))).filter(Boolean))]
            if (invalid.length) {
              setError(invalid.join(' '))
              return
            }
            setError('')
            const volume = logged.reduce((total, exercise) => total + exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0), 0)
            onFinish({
              log: {
                id: crypto.randomUUID(),
                workoutId: workout.id,
                workoutTitle: workout.title,
                duration: workout.duration ?? 45,
                volume,
                unit,
                effortRating: effort,
                note: effort === 'too hard' ? 'Recovery tip: reduce next session volume and keep sleep priority high.' : 'Recovery tip: keep protein and hydration steady.',
                exercisesLogged: logged,
                date: new Date().toISOString(),
              },
            })
          }}
        >
          Finish Workout
        </button>
        {instructionTarget && <InstructionDialog exercise={instructionTarget} onClose={() => setInstructionTarget(null)} />}
      </main>
    </div>
  )
}

function ProgressScreen({ data, stats, onExport, onMeasurement }) {
  const [field, setField] = useState('weight')
  const [value, setValue] = useState('')
  const volumes = data.logs.slice(0, 4).reverse()
  return (
    <section className="screen stack">
      <div className="stat-grid">
        <Metric icon={Activity} label="Sessions" value={data.logs.length} />
        <Metric icon={Trophy} label="PRs" value={data.prs.length} />
        <Metric icon={Flame} label="Streak" value={`${stats.streak}d`} />
      </div>
      <article className="coach-card">
        <p className="eyebrow">Progress insight</p>
        <h2>{data.logs.length ? 'Your trend is starting to form.' : 'Log one workout to unlock insights.'}</h2>
        <p>{progressInsight(data, stats)}</p>
      </article>
      <ProgressInsightGrid data={data} stats={stats} />
      <LongRangeAnalytics data={data} />
      <StrengthBalance data={data} />
      <EventTrend programs={data.programs} logs={data.logs} />
      <DeloadHistory programs={data.programs} />
      <article className="card">
        <SectionTitle title="4-week Volume" action="logged" />
        <div className="bar-chart">
          {volumes.map((log) => (
            <div key={log.id} className="bar" style={{ height: `${Math.max(8, Math.min(100, log.volume / Math.max(stats.maxVolume, 1) * 100))}%` }}>
              <span>{Math.round(log.volume)}</span>
            </div>
          ))}
        </div>
      </article>
      <article className="card">
        <SectionTitle title="Activity Heatmap" action="5 weeks" />
        <div className="heatmap">
          {Array.from({ length: 35 }, (_, index) => {
            const date = new Date()
            date.setDate(date.getDate() - (34 - index))
            const active = data.logs.some((log) => new Date(log.date).toDateString() === date.toDateString())
            return <span className={active ? 'hot' : ''} key={date.toISOString()} title={date.toDateString()} />
          })}
        </div>
      </article>
      <article className="card stack">
        <SectionTitle title="Body" action={`${data.measurements.length} logs`} />
        <div className="inline-form">
          <select value={field} onChange={(event) => setField(event.target.value)} aria-label="Measurement field">
            {['weight', 'waist', 'chest', 'hips', 'arm', 'thigh', 'body fat'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input inputMode="decimal" placeholder="value" value={value} onChange={(event) => setValue(event.target.value)} aria-label="Measurement value" />
          <button className="primary" type="button" onClick={() => {
            const numericValue = Number(value)
            if (!Number.isFinite(numericValue) || numericValue <= 0 || numericValue > 2000) return
            onMeasurement({ id: crypto.randomUUID(), field, value: numericValue, loggedAt: new Date().toISOString() })
            setValue('')
          }}>Log</button>
        </div>
      </article>
      <article className="card stack">
        <SectionTitle title="Personal Records" action="est. 1RM" />
        {data.prs.map((pr) => <div className="list-row" key={pr.exerciseName}><span>{pr.exerciseName}</span><strong>{estimatedOneRepMax(pr.weight, pr.reps)} {pr.unit}</strong></div>)}
        {!data.prs.length && <p className="muted">PRs unlock from workout logs.</p>}
      </article>
      <button className="secondary full" type="button" onClick={onExport}>Export JSON</button>
    </section>
  )
}

function ToolsScreen() {
  const [weight, setWeight] = useState(185)
  const [reps, setReps] = useState(5)
  const [target, setTarget] = useState(225)
  const plates = calculatePlates(target)
  return (
    <section className="screen stack">
      <article className="card form-stack">
        <SectionTitle title="1RM Calculator" action="Epley" />
        <NumberInput label="Weight" value={weight} onChange={setWeight} min={0} max={2000} />
        <NumberInput label="Reps" value={reps} onChange={setReps} min={1} max={200} />
        <div className="result">{estimatedOneRepMax(weight, reps)} lb</div>
      </article>
      <article className="card form-stack">
        <SectionTitle title="Plate Calculator" action="45 lb bar" />
        <NumberInput label="Target weight" value={target} onChange={setTarget} min={45} max={2000} />
        <div className="plate-row">{plates.map(([plate, count]) => <span key={plate}>{count} x {plate}</span>)}</div>
      </article>
      <article className="card">
        <SectionTitle title="Production Notes" action="MVP" />
        <p className="fine-print">Supabase Auth, Postgres schema constraints, and the Anthropic proxy are intentionally isolated as deployment work. This local build keeps the deterministic engine offline and persists data in localStorage.</p>
      </article>
      <article className="card stack">
        <SectionTitle title="Launch Readiness" action="QA" />
        <div className="readiness-list">
          <span><Check size={15} /> Offline generation fallback</span>
          <span><Check size={15} /> Persona simulation coverage</span>
          <span><Check size={15} /> Save recovery and export path</span>
          <span><Info size={15} /> Production auth, database, AI proxy, and push delivery still require deployment wiring.</span>
        </div>
      </article>
    </section>
  )
}

function PlanPreview({ profile, mode }) {
  const normalized = useMemo(() => normalizeProfile(profile), [profile])
  const goals = normalized.goal.map((goal) => GOAL_LABELS[goal] ?? goal).join(' + ')
  const event = EVENT_META[normalized.eventGoal]?.label ?? 'None'
  const sports = displayProfileSports(normalized)
  const equipment = (normalized.equipmentAccess || [])
    .slice(0, 3)
    .map((item) => EQUIPMENT_ACCESS_LABELS[item] ?? item)
    .join(', ')
  const split = (normalized.split || [])
    .map((item) => TRAINING_SPLIT_LABELS[item] ?? item)
    .join(', ')
  const details = [
    ['Outcome', goals || 'Health and energy'],
    ['Sport layer', sports || 'General training'],
    ['Event', normalized.eventGoal === 'none' ? 'None selected' : `${event}${normalized.eventDate ? ` on ${normalized.eventDate}` : ''}`],
    ['Setup', `${normalized.equipment}${equipment ? ` | ${equipment}` : ''}`],
    ['Week shape', `${normalized.days} days/week | ${normalized.exercisesPerDay || 6}+ exercises/day`],
    ['Split', split || 'Adaptive split'],
  ]
  return (
    <aside className="plan-preview card">
      <SectionTitle title="Plan Preview" action={mode === 'quick' ? 'fast path' : 'live fit'} />
      <p className="muted">FitMe will turn these answers into a dated, injury-aware, progressive plan and save it automatically.</p>
      <div className="preview-grid">
        {details.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </aside>
  )
}

function PlanReview({ profile }) {
  const normalized = useMemo(() => normalizeProfile(profile), [profile])
  const validation = validateProfile(normalized)
  const previewProgram = useMemo(() => (validation.length ? null : buildFallbackProgram(normalized)), [normalized, validation.length])
  const firstWeek = previewProgram?.weeklyWorkouts?.[1] ?? previewProgram?.workouts ?? []
  return (
    <section className="review-panel">
      <SectionTitle title="Review before saving" action={validation.length ? 'needs attention' : 'ready'} />
      {validation.length ? (
        <ErrorList errors={validation} />
      ) : (
        <>
          <div className="review-hero">
            <div>
              <p className="eyebrow">Generated preview</p>
              <h2>{previewProgram.title}</h2>
              <p>{programSummary(previewProgram)}</p>
            </div>
          </div>
          <div className="review-grid">
            <div><span>Schedule</span><strong>{normalized.days} days/week</strong></div>
            <div><span>Plan length</span><strong>{previewProgram.trainingPlan.length} weeks</strong></div>
            <div><span>Event</span><strong>{normalized.eventGoal === 'none' ? 'None' : `${EVENT_META[normalized.eventGoal]?.label}${normalized.eventDate ? ` on ${normalized.eventDate}` : ''}`}</strong></div>
            <div><span>Safety</span><strong>{normalized.limitations || 'No limitations listed'}</strong></div>
          </div>
          <div className="review-week">
            <SectionTitle title="First week preview" action={`${firstWeek.length} sessions`} />
            {firstWeek.slice(0, 4).map((session) => (
              <div className="list-row compact" key={session.title}>
                <span>{session.dayLabel}: {session.title}</span>
                <strong>{session.exercises.length} moves</strong>
              </div>
            ))}
          </div>
          <div className="trust-grid">
            <span><ShieldCheck size={15} /> Injury text checked before generation</span>
            <span><Save size={15} /> Auto-saves to Library</span>
            <span><RefreshCw size={15} /> Feedback can adapt future sessions</span>
          </div>
        </>
      )}
    </section>
  )
}

function ProgressInsightGrid({ data, stats }) {
  const hardCount = data.logs.filter((log) => log.effortRating === 'too hard').length
  const easyCount = data.logs.filter((log) => log.effortRating === 'too easy').length
  const items = [
    ['Consistency', stats.weekSessions ? `${stats.weekSessions} this week` : 'needs a session'],
    ['Volume trend', stats.monthVolume ? `${stats.monthVolume.toLocaleString()} lb in 28d` : 'no volume yet'],
    ['PR trend', data.prs.length ? `${data.prs.length} lifts tracked` : 'no PR yet'],
    ['Readiness', hardCount > easyCount ? 'manage fatigue' : easyCount > hardCount ? 'room to progress' : 'steady'],
  ]
  return (
    <section className="insight-grid" aria-label="Progress coaching signals">
      {items.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  )
}

function LongRangeAnalytics({ data }) {
  const ranges = [90, 180, 365].map((days) => {
    const logs = logsWithinDays(data.logs, days)
    return [`${Math.round(days / 30)} mo`, `${Math.round(logs.reduce((sum, log) => sum + log.volume, 0)).toLocaleString()} lb`, `${logs.length} sessions`]
  })
  return (
    <article className="card">
      <SectionTitle title="Long-range trend" action="3/6/12 mo" />
      <div className="analytics-grid">
        {ranges.map(([label, volume, sessions]) => (
          <div key={label}><span>{label}</span><strong>{volume}</strong><small>{sessions}</small></div>
        ))}
      </div>
    </article>
  )
}

function StrengthBalance({ data }) {
  const buckets = data.logs.flatMap((log) => log.exercisesLogged || []).reduce((map, exercise) => {
    const bucket = movementBucket(exercise.name)
    const volume = exercise.sets.reduce((sum, set) => sum + Number(set.weight || 0) * Number(set.reps || 0), 0)
    map[bucket] = (map[bucket] || 0) + volume
    return map
  }, {})
  const entries = ['Push', 'Pull', 'Lower', 'Core'].map((label) => [label, Math.round(buckets[label] || 0)])
  return (
    <article className="card">
      <SectionTitle title="Strength balance" action="logged volume" />
      <div className="analytics-grid">
        {entries.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value.toLocaleString()} lb</strong></div>)}
      </div>
    </article>
  )
}

function EventTrend({ programs, logs }) {
  const eventProgram = programs.find((program) => program.isEventPlan)
  if (!eventProgram) return null
  const longRuns = logs.flatMap((log) => log.exercisesLogged || [])
    .filter((exercise) => /run|bike|swim|row|ski|erg|station|metcon/i.test(exercise.name))
    .slice(0, 6)
  const week = eventProgram.currentWeek
  const phase = eventProgram.trainingPlan?.[week - 1]?.phase || 'Build'
  return (
    <article className="card">
      <SectionTitle title="Event readiness trend" action={inferEventLabel(eventProgram)} />
      <div className="analytics-grid">
        <div><span>Current phase</span><strong>{phase}</strong></div>
        <div><span>Weeks tracked</span><strong>{longRuns.length}</strong></div>
        <div><span>Event date</span><strong>{eventProgram.eventDate || 'not set'}</strong></div>
        <div><span>Readiness</span><strong>{eventProgram.eventReadiness || 'standard'}</strong></div>
      </div>
    </article>
  )
}

function DeloadHistory({ programs }) {
  const deloads = programs.flatMap((program) => Object.entries(program.weekFeedback || {})
    .filter(([, value]) => value === 'hard')
    .map(([week]) => `${program.title}: week ${week}`))
  return (
    <article className="card">
      <SectionTitle title="Deload history" action={`${deloads.length} signals`} />
      {deloads.slice(0, 4).map((item) => <div className="list-row compact" key={item}><span>{item}</span><strong>hard</strong></div>)}
      {!deloads.length && <p className="muted">No deload signals yet. Mark weeks too hard to let FitMe protect recovery.</p>}
    </article>
  )
}

function PlanProfileSummary({ program }) {
  const sportNames = displaySports(program)
  const splitNames = displaySplits(program)
  const equipmentNames = displayEquipmentAccess(program)
  const items = [
    ['Sport', sportNames || 'General training'],
    ['Setup', program.equipment || 'commercial gym'],
    ['Access', equipmentNames || program.equipmentDetail || 'standard equipment'],
    ['Split', splitNames || 'adaptive split'],
    ['Volume', `${program.exercisesPerDay || program.workouts?.[0]?.exercises?.length || 6} exercises/day`],
  ]
  return (
    <div className="profile-fit">
      {items.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  )
}

function ProgramCoachSummary({ program, week, sessions }) {
  const weekItem = program.trainingPlan?.[week - 1]
  const nextSession = sessions[0]
  const eventText = program.isEventPlan
    ? `${inferEventLabel(program)} prep is in ${weekItem?.phase || 'build'} phase.`
    : 'This plan balances strength, conditioning, and recovery.'
  return (
    <section className="coach-card">
      <p className="eyebrow">Coach summary</p>
      <h2>{weekItem ? `Week ${week}: ${weekItem.phase}` : 'Plan ready'}</h2>
      <p>{eventText} {weekItem?.note || 'Use feedback after each workout so the next week can adjust.'}</p>
      {nextSession && <small>Next best action: start {nextSession.title}.</small>}
    </section>
  )
}

function EventReadinessPanel({ program, week, sessions }) {
  if (!program.isEventPlan) return null
  const eventName = inferEventLabel(program)
  const longWork = sessions.flatMap((session) => session.exercises).find((exercise) => /long run|brick|simulation|metcon|emom|1 km|threshold/i.test(`${exercise.name} ${exercise.reps}`))
  const qualityCount = sessions.filter((session) => /quality|interval|metcon|station|brick|simulation|skill|engine/i.test(session.title)).length
  const weekItem = program.trainingPlan?.[week - 1]
  const specific = eventSpecificMetrics(program, sessions, week)
  const items = [
    ['Event', eventName],
    ['Week focus', weekItem?.focus || 'event prep'],
    ['Key session', longWork ? `${longWork.name}: ${longWork.reps}` : sessions[0]?.title || 'session build'],
    ['Specific days', `${qualityCount}/${sessions.length}`],
  ]
  return (
    <div className="event-dashboard">
      <SectionTitle title="Event Readiness" action={`Week ${week}`} />
      <div>
        {[...items, ...specific].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupedRoadmap({ program, activeWeek, onWeekSelect }) {
  const groups = program.trainingPlan.reduce((map, weekItem) => {
    const key = weekItem.phase
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(weekItem)
    return map
  }, new Map())
  return (
    <div className="roadmap-groups">
      {[...groups.entries()].map(([phase, weeks]) => (
        <section key={phase} className="roadmap-group">
          <div className="roadmap-label">
            <strong>{phase}</strong>
            <span>{weeks[0].week}-{weeks.at(-1).week}</span>
          </div>
          <div className="roadmap">
            {weeks.map((weekItem) => (
              <button
                className={`week-dot ${weekItem.week === activeWeek ? 'active' : ''}`}
                style={{ '--phase': weekItem.color }}
                key={weekItem.week}
                type="button"
                onClick={() => onWeekSelect(program, weekItem.week)}
                aria-label={`Show week ${weekItem.week} ${weekItem.phase} workouts`}
              >
                <span>{weekItem.week}</span>
                <small>{weekItem.phase}</small>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function SafetyPanel({ limitations }) {
  const avoided = avoidedForLimitations(limitations)
  return (
    <div className="safety-panel">
      <SectionTitle title="Safety Filter" action="active" />
      <p>Limitations honored: {limitations}</p>
      {avoided && <small>Avoiding or scaling: {avoided}</small>}
    </div>
  )
}

function ExerciseInstruction({ exercise }) {
  return (
    <div className="instruction-card">
      <span>{exercise.category || 'movement'}</span>
      <strong>{formCue(exercise)}</strong>
      <small>{substitutionCue(exercise)}</small>
    </div>
  )
}

function ExerciseHistoryPanel({ history, unit }) {
  if (!history.lastSet && !history.best) return <p className="fine-print">No prior history for this movement yet.</p>
  return (
    <div className="history-strip">
      <span>Last: {history.lastSet ? `${history.lastSet.weight} x ${history.lastSet.reps} ${unit}` : 'none'}</span>
      <span>Best: {history.best ? `${history.best.weight} x ${history.best.reps} (${estimatedOneRepMax(history.best.weight, history.best.reps)} e1RM)` : 'none'}</span>
      {history.note && <span>Note: {history.note}</span>}
    </div>
  )
}

function WorkoutCard({ workout, onStart, onSwap, onInstruction }) {
  return (
    <details className="workout-card" style={{ '--accent-card': workout.accentColor }}>
      <summary>
        <span>
          <strong>{workout.dayLabel}: {workout.title}</strong>
        <small>{workout.muscleGroups.join(' · ')} · {workout.exercises.length} moves</small>
        </span>
        <button className="primary mini" type="button" onClick={(event) => { event.preventDefault(); onStart() }}>
          Start
        </button>
      </summary>
      {workout.rationale && <p className="session-rationale">{workout.rationale}</p>}
      {workout.exercises.map((exercise) => (
        <div className="exercise-preview" key={exercise.id}>
          <div>
            <span>{exercise.superset ? `${exercise.superset} · ${exercise.name}` : exercise.name}</span>
            <small>{exercise.sets} x {exercise.reps}</small>
          </div>
          <div className="exercise-preview-actions">
            <button className="text-button" type="button" onClick={() => onInstruction(exercise)}>Instructions</button>
            <button className="text-button" type="button" onClick={() => onSwap(exercise)}>Swap</button>
          </div>
        </div>
      ))}
    </details>
  )
}

function InstructionDialog({ exercise, onClose }) {
  const [status, setStatus] = useState('loading')
  const [instruction, setInstruction] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const nextInstruction = getExerciseInstruction(exercise)
        setInstruction(nextInstruction)
        setStatus(nextInstruction.status === 'empty' ? 'empty' : 'ready')
      } catch {
        setInstruction(null)
        setStatus('error')
      }
    }, 120)

    return () => window.clearTimeout(timer)
  }, [exercise])

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog card stack instruction-dialog" role="dialog" aria-modal="true" aria-label={`${exercise?.name || 'Exercise'} instructions`}>
        <SectionTitle title="Instructions" action={exercise?.category || 'movement'} />
        {status === 'loading' && <EmptyMini text="Loading exercise instructions..." />}
        {status === 'empty' && <EmptyMini text={instruction?.message || 'No exercise selected.'} />}
        {status === 'error' && <div className="error">Instructions could not load. Close this panel and try again.</div>}
        {status === 'ready' && instruction && (
          <>
            <div className="instruction-hero">
              <p className="eyebrow">Exercise</p>
              <h2>{instruction.name}</h2>
              {instruction.isDefault && <small>Safe default guidance based on this movement type.</small>}
            </div>
            <InstructionMedia media={instruction.media} exerciseName={instruction.name} />
            <div className="instruction-meta">
              <div>
                <span>Primary muscles</span>
                <strong>{instruction.primaryMuscles.join(', ')}</strong>
              </div>
              <div>
                <span>Equipment</span>
                <strong>{instruction.equipment}</strong>
              </div>
            </div>
            <InstructionBlock title="Starting position" items={[instruction.startingPosition]} />
            <InstructionBlock title="How to do it" items={instruction.steps} ordered />
            <InstructionBlock title="Breathing" items={[instruction.breathing]} />
            <InstructionBlock title="Common mistakes" items={instruction.mistakes} />
            <InstructionBlock title="Safety tips" items={instruction.safety} />
            <InstructionBlock title="Modification" items={instruction.modifications} />
            <div className="safety-callout">
              <ShieldCheck size={17} />
              <span>{instruction.stopGuidance}</span>
            </div>
          </>
        )}
        <button className="primary full" type="button" onClick={onClose}>Back to workout</button>
      </section>
    </div>
  )
}

function InstructionMedia({ media, exerciseName }) {
  if (!media?.src || media.type === 'placeholder') {
    return (
      <div className="instruction-media instruction-media-placeholder">
        <div className="demo-icon"><Dumbbell size={30} /></div>
        <div>
          <p className="eyebrow">Video demo slot</p>
          <strong>Demo coming soon</strong>
          <span>{media?.label || `${exerciseName} demo coming soon`}</span>
        </div>
      </div>
    )
  }

  if (media.type === 'video') {
    return (
      <figure className="instruction-media">
        <video src={media.src} poster={media.poster} aria-label={media.label || `${exerciseName} demonstration`} muted loop playsInline controls preload="metadata" />
        <figcaption>{media.label || 'Short movement demo'}</figcaption>
      </figure>
    )
  }

  return (
    <figure className="instruction-media">
      <img src={media.src} alt={media.label || `${exerciseName} demonstration`} loading="lazy" />
      <figcaption>{media.type === 'placeholder' ? 'Video demo slot ready' : media.label || 'Movement demo'}</figcaption>
    </figure>
  )
}

function InstructionBlock({ title, items, ordered = false }) {
  const List = ordered ? 'ol' : 'ul'
  return (
    <section className="instruction-block">
      <h3>{title}</h3>
      <List>
        {items.map((item) => <li key={item}>{item}</li>)}
      </List>
    </section>
  )
}

function SwapDialog({ target, onSave, onClose }) {
  const [replacement, setReplacement] = useState(safeExercise(target.exercise.category || 'core', target.program, 3, target.program.excludedExercises))
  const [persistent, setPersistent] = useState(true)
  return (
    <div className="dialog-backdrop" role="presentation">
      <form className="dialog card" onSubmit={(event) => { event.preventDefault(); onSave(replacement, persistent) }}>
        <SectionTitle title="Swap exercise" action={target.exercise.name} />
        <TextInput label="Replacement" value={replacement} onChange={setReplacement} />
        <label className="check-row"><input type="checkbox" checked={persistent} onChange={(event) => setPersistent(event.target.checked)} /> Exclude original for this program</label>
        <div className="button-row">
          <button className="secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="primary" type="submit">Save</button>
        </div>
      </form>
    </div>
  )
}

function ProgramEditDialog({ program, onSave, onClose }) {
  const [draft, setDraft] = useState(() => profileFromProgram(program))
  const equipmentAccessOptions = EQUIPMENT_ACCESS_BY_SETUP[draft.equipment] ?? EQUIPMENT_ACCESS_BY_SETUP['commercial gym']
  const update = (patch) => setDraft((state) => ({ ...state, ...patch }))
  return (
    <div className="dialog-backdrop" role="presentation">
      <form
        className="dialog card form-stack"
        onSubmit={(event) => {
          event.preventDefault()
          onSave(normalizeProfile(draft))
        }}
      >
        <SectionTitle title="Edit future weeks" action={`from week ${program.currentWeek}`} />
        <p className="fine-print">Past weeks stay intact. FitMe regenerates this week onward with the new setup, schedule, event, and limitations.</p>
        <CheckboxGroup label="Goals" values={draft.goal} onChange={(goal) => update({ goal })} options={GOAL_OPTIONS} labels={GOAL_LABELS} />
        <Select label="Event" value={draft.eventGoal} onChange={(eventGoal) => update({ eventGoal })} options={Object.keys(EVENT_META)} labels={Object.fromEntries(Object.entries(EVENT_META).map(([key, value]) => [key, value.label]))} />
        {draft.eventGoal !== 'none' && <TextInput type="date" label="Event date" value={draft.eventDate} onChange={(eventDate) => update({ eventDate })} />}
        <Select label="Training setup" value={draft.equipment} onChange={(equipment) => update({ equipment, equipmentAccess: defaultEquipmentAccess(equipment) })} options={TRAINING_SETUP_OPTIONS} />
        <EquipmentAccessGroup values={draft.equipmentAccess} onChange={(equipmentAccess) => update({ equipmentAccess })} options={equipmentAccessOptions} />
        <div className="field-grid">
          <NumberInput label="Days per week" value={draft.days} onChange={(days) => update({ days })} min={2} max={6} />
          <NumberInput label="Exercises per day" value={draft.exercisesPerDay} onChange={(exercisesPerDay) => update({ exercisesPerDay })} min={6} max={12} />
        </div>
        <TextInput label="Limitations or injuries" value={draft.limitations} onChange={(limitations) => update({ limitations })} placeholder="Shoulder, knee, back, avoid squats..." maxLength={500} />
        <div className="button-row">
          <button className="secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="primary" type="submit">Regenerate future weeks</button>
        </div>
      </form>
    </div>
  )
}

function AdaptationSummary({ summary, onClose }) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog card stack" role="dialog" aria-modal="true" aria-label="Workout adaptation summary">
        <SectionTitle title="What FitMe Learned" action={summary.effort} />
        <div className="coach-card">
          <p className="eyebrow">Next adjustment</p>
          <h2>{summary.headline}</h2>
          <p>{summary.body}</p>
        </div>
        <div className="preview-grid">
          {summary.metrics.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <p className="fine-print">{summary.tip}</p>
        <button className="primary full" type="button" onClick={onClose}>Back to Home</button>
      </section>
    </div>
  )
}

function Metric({ icon: Icon, label, value }) {
  return <div className="metric"><Icon size={19} /><span>{label}</span><strong>{value}</strong></div>
}

function SectionTitle({ title, action }) {
  return <div className="section-title"><h2>{title}</h2><span>{action}</span></div>
}

function Segmented({ value, onChange, options }) {
  return <div className="segmented">{options.map(([id, label]) => <button key={id} type="button" className={value === id ? 'active' : ''} onClick={() => onChange(id)}>{label}</button>)}</div>
}

function Select({ label, value, onChange, options, labels = {} }) {
  return <label><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option} key={option}>{labels[option] ?? option}</option>)}</select></label>
}

function CheckboxGroup({ label, values, onChange, options, labels = {}, exclusiveValue }) {
  const selected = Array.isArray(values) ? values : values ? [values] : []
  const toggle = (option) => {
    if (exclusiveValue && option === exclusiveValue) {
      onChange([exclusiveValue])
      return
    }
    const withoutExclusive = selected.filter((item) => item !== exclusiveValue)
    const next = withoutExclusive.includes(option)
      ? withoutExclusive.filter((item) => item !== option)
      : [...withoutExclusive, option]
    onChange(next.length ? next : exclusiveValue ? [exclusiveValue] : [options[0]])
  }
  return (
    <fieldset className="check-group">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <label className="check-chip" key={option}>
            <input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} />
            <span>{labels[option] ?? option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function EquipmentAccessGroup({ values, onChange, options }) {
  return (
    <div className="field-with-action">
      <div className="field-action-row">
        <span>Equipment access</span>
        <button className="text-button" type="button" onClick={() => onChange([...options])}>
          Select all
        </button>
      </div>
      <CheckboxGroup label="Equipment access" values={values} onChange={onChange} options={options} labels={EQUIPMENT_ACCESS_LABELS} />
    </div>
  )
}

function TextInput({ label, value, onChange, placeholder = '', type = 'text', maxLength }) {
  return <label><span>{label}</span><input type={type} value={value} placeholder={placeholder} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} /></label>
}

function NumberInput({ label, value, onChange, min, max }) {
  return <label><span>{label}</span><input type="number" min={min} max={max} value={value} onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))} /></label>
}

function EmptyMini({ text }) {
  return <div className="empty-mini">{text}</div>
}

function ErrorList({ errors }) {
  return (
    <div className="error" role="alert">
      {errors.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  )
}

const achievementCatalog = [
  { id: 'first_program', label: 'First plan' },
  { id: 'first_log', label: 'First log' },
  { id: 'three_sessions', label: '3 sessions' },
  { id: 'first_pr', label: 'First PR' },
  { id: 'volume_10k', label: '10k volume' },
]

function unlockAchievements(data) {
  const unlocked = new Set(data.achievements)
  if (data.programs.length) unlocked.add('first_program')
  if (data.logs.length) unlocked.add('first_log')
  if (data.logs.length >= 3) unlocked.add('three_sessions')
  if (data.prs.length) unlocked.add('first_pr')
  if (data.logs.reduce((sum, log) => sum + log.volume, 0) >= 10000) unlocked.add('volume_10k')
  return [...unlocked]
}

function computeStats(data) {
  const now = Date.now()
  const weekSessions = data.logs.filter((log) => now - new Date(log.date).getTime() < 7 * 86400000).length
  const monthLogs = data.logs.filter((log) => now - new Date(log.date).getTime() < 28 * 86400000)
  const monthVolume = Math.round(monthLogs.reduce((sum, log) => sum + log.volume, 0))
  const maxVolume = Math.max(...data.logs.map((log) => log.volume), 1)
  const days = new Set(data.logs.map((log) => new Date(log.date).toDateString()))
  let streak = 0
  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date()
    date.setDate(date.getDate() - offset)
    if (days.has(date.toDateString())) streak += 1
    else if (offset > 0) break
  }
  return { weekSessions, monthVolume, maxVolume, streak }
}

function progressInsight(data, stats) {
  if (!data.logs.length) return 'Finish a session and FitMe will begin tracking volume, PRs, streaks, and adaptation signals.'
  if (stats.weekSessions === 0) return 'No sessions are logged this week yet. Start the next planned workout to keep the program calibrated.'
  if (stats.weekSessions >= 3) return 'You have enough recent activity for meaningful feedback. Keep logging effort so deload and progression decisions stay grounded.'
  return 'A few more logged sessions will make trends clearer. Prioritize completion and accurate effort ratings before chasing volume.'
}

function logsWithinDays(logs, days) {
  const cutoff = Date.now() - days * 86400000
  return logs.filter((log) => new Date(log.date).getTime() >= cutoff)
}

function eventDaysLeft(eventDate) {
  const target = new Date(eventDate)
  if (Number.isNaN(target.getTime())) return '?'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / 86400000))
}

function movementBucket(name = '') {
  const lower = name.toLowerCase()
  if (/bench|press|push|thruster/.test(lower)) return 'Push'
  if (/row|pull|pulldown|ski/.test(lower)) return 'Pull'
  if (/squat|deadlift|lunge|leg|sled|step|run|bike/.test(lower)) return 'Lower'
  return 'Core'
}

function buildWorkoutSummary(log, program) {
  const completedSets = log.exercisesLogged.reduce((sum, exercise) => sum + exercise.sets.length, 0)
  const effort = log.effortRating
  const isHard = effort === 'too hard'
  const isEasy = effort === 'too easy'
  const headline = isHard ? 'Recovery gets priority next.' : isEasy ? 'Progression is available.' : 'This was the right training dose.'
  const body = isHard
    ? 'FitMe will treat this as a fatigue signal. Keep the next session conservative and prioritize sleep, food, hydration, and joint feedback.'
    : isEasy
      ? 'FitMe will treat this as a readiness signal. If the next session also feels easy, the plan can tolerate more load, volume, or pace demand.'
      : 'FitMe will keep the plan steady. Consistent just-right sessions are the best signal for sustainable progression.'
  const event = program?.isEventPlan ? inferEventLabel(program) : 'General'
  return {
    effort,
    headline,
    body,
    tip: log.note || 'Recovery tip: keep hydration, protein, and sleep steady.',
    metrics: [
      ['Session', log.workoutTitle],
      ['Event layer', event],
      ['Logged sets', completedSets],
      ['Volume', `${Math.round(log.volume).toLocaleString()} ${log.unit}`],
    ],
  }
}

function exerciseHistory(name, logs, prs) {
  const normalized = name.toLowerCase()
  const entries = logs
    .flatMap((log) => (log.exercisesLogged || [])
      .filter((exercise) => exercise.name?.toLowerCase() === normalized)
      .flatMap((exercise) => exercise.sets.map((set) => ({ ...set, note: log.note, date: log.date }))))
    .filter((set) => Number.isFinite(Number(set.weight)) && Number.isFinite(Number(set.reps)) && Number(set.reps) > 0)
  const lastSet = entries[0]
  const best = entries.reduce((bestSet, set) => {
    if (!bestSet) return set
    return estimatedOneRepMax(Number(set.weight), Number(set.reps)) > estimatedOneRepMax(Number(bestSet.weight), Number(bestSet.reps)) ? set : bestSet
  }, null)
  const pr = prs.find((item) => item.exerciseName?.toLowerCase() === normalized)
  return {
    lastSet,
    best: pr || best,
    note: lastSet?.note,
  }
}

function formCue(exercise) {
  const name = exercise.name.toLowerCase()
  if (/squat|leg press|wall ball|thruster/.test(name)) return 'Brace first, knees track over toes, keep reps smooth.'
  if (/deadlift|hinge|swing|pull-through/.test(name)) return 'Hips move back, spine stays long, finish with glutes.'
  if (/press|push-up/.test(name)) return 'Ribs down, shoulder blades controlled, stop before painful range.'
  if (/row|pull-up|pulldown|ski/.test(name)) return 'Lead with elbows, keep neck relaxed, pause with control.'
  if (/run|bike|rower|erg|walk/.test(name)) return 'Start easier than you think; finish able to repeat the effort.'
  if (/carry|sled|sandbag/.test(name)) return 'Brace, breathe behind the shield, and keep steps deliberate.'
  return 'Use controlled reps, full-body tension, and stop if pain changes your mechanics.'
}

function substitutionCue(exercise) {
  const category = exercise.category || 'movement'
  return `Swap for pain, missing equipment, or poor fit. FitMe will keep the replacement in the ${category} pattern.`
}

function eventSpecificMetrics(program, sessions, week) {
  const key = program.eventGoal || inferEventGoal(program)
  const allText = sessions.flatMap((session) => session.exercises.map((exercise) => `${exercise.name} ${exercise.reps}`)).join(' ')
  const weeksLeft = Math.max(0, (program.trainingPlan?.length ?? week) - week)
  if (['5k', '10k', 'half', 'marathon'].includes(key)) {
    const longest = [...allText.matchAll(/(\d+(?:\.\d+)?)\s*(?:mi|miles)/gi)].map((match) => Number(match[1])).sort((a, b) => b - a)[0]
    return [
      ['Run focus', key === 'marathon' ? 'long-run durability' : EVENT_META[key]?.focus || 'pace control'],
      ['Longest run', longest ? `${longest} mi` : 'not listed'],
      ['Weeks left', weeksLeft],
      ['Taper', weeksLeft <= 2 ? 'active soon' : 'protected'],
    ]
  }
  if (key === 'triathlon') {
    return [
      ['Swim/Bike/Run', `${/swim/i.test(allText) ? 'S' : '-'}${/bike/i.test(allText) ? 'B' : '-'}${/run/i.test(allText) ? 'R' : '-'}`],
      ['Brick exposure', /brick/i.test(allText) ? 'included' : 'upcoming'],
      ['Weeks left', weeksLeft],
      ['Taper', weeksLeft <= 2 ? 'active soon' : 'protected'],
    ]
  }
  if (key === 'hyrox') {
    return [
      ['Station work', /sled|farmer|wall ball|ski|row/i.test(allText) ? 'included' : 'upcoming'],
      ['Compromised run', /1 km|run/i.test(allText) ? 'included' : 'upcoming'],
      ['Simulation', /simulation/i.test(allText) ? 'this week' : 'building'],
      ['Weeks left', weeksLeft],
    ]
  }
  if (key === 'crossfit') {
    return [
      ['Skill work', /skill|emom/i.test(allText) ? 'included' : 'upcoming'],
      ['Metcon', /metcon|amrap|rounds/i.test(allText) ? 'included' : 'building'],
      ['Strength touch', /squat|press|deadlift|pull/i.test(allText) ? 'included' : 'upcoming'],
      ['Weeks left', weeksLeft],
    ]
  }
  return [['Weeks left', weeksLeft]]
}

function suggestedReps(reps) {
  const match = String(reps).match(/\d+/)
  return match ? match[0] : '8'
}

function stepValidation(profile, stepName) {
  const errors = []
  if (stepName === 'Profile') {
    if (profile.age !== '' && (Number(profile.age) < 13 || Number(profile.age) > 100)) errors.push('Age must be between 13 and 100.')
  }
  if (stepName === 'Goal' || stepName === 'Goals') {
    if (!asUiArray(profile.goal).length) errors.push('Select at least one goal.')
  }
  if (stepName === 'Sport/Event') {
    if (asUiArray(profile.sport).includes('other') && !profile.customSport?.trim()) errors.push('Enter the sport that is not listed.')
    if (profile.eventGoal && profile.eventGoal !== 'none' && !profile.eventDate) errors.push('Choose the event date so the plan can taper correctly.')
  }
  if (stepName === 'Setup') {
    if (!profile.equipment) errors.push('Choose a training setup.')
    if (!asUiArray(profile.equipmentAccess).length) errors.push('Select at least one equipment option.')
  }
  if (stepName === 'Schedule') {
    if (Number(profile.days) < 2 || Number(profile.days) > 6) errors.push('Training days must be between 2 and 6.')
    if (profile.exercisesPerDay !== undefined && (Number(profile.exercisesPerDay) < 6 || Number(profile.exercisesPerDay) > 12)) errors.push('Exercises per day must be between 6 and 12.')
    if (profile.limitations && profile.limitations.length > 500) errors.push('Limitations must be 500 characters or less.')
  }
  return errors
}

function asUiArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []
}

function coachBrief(data, stats, next, nextWorkout) {
  if (!next) {
    return {
      kicker: 'First win',
      title: 'Get a plan before motivation cools off.',
      body: 'Quick Plan gets you moving fast; Custom Program adds the deeper sport, event, split, equipment, and limitation details.',
      action: 'plan',
    }
  }
  if (!data.logs.length) {
    return {
      kicker: 'Activation',
      title: 'Your first logged session unlocks feedback.',
      body: `${nextWorkout?.title || 'Today'} is ready. Finish it once and FitMe starts tracking PRs, streaks, and adaptation signals.`,
      action: 'start',
    }
  }
  if (shouldDeload(next)) {
    return {
      kicker: 'Recovery signal',
      title: 'Back off before progress stalls.',
      body: 'Recent hard feedback points to a deload. FitMe is already lowering the cost of staying consistent.',
      action: 'start',
    }
  }
  if (stats.weekSessions === 0) {
    return {
      kicker: 'Streak at risk',
      title: 'One session restarts momentum.',
      body: `${nextWorkout?.title || 'Your next workout'} is the shortest path back into rhythm.`,
      action: 'start',
    }
  }
  return {
    kicker: 'Today’s brief',
    title: nextWorkout?.title || 'Next session ready',
    body: nextWorkout?.rationale || 'Follow the next planned session and log effort so the program can keep adapting.',
    action: 'start',
  }
}

function planProofPoints(program) {
  const weeks = program.trainingPlan?.length ?? 12
  const currentPhase = program.trainingPlan?.[program.currentWeek - 1]?.phase || 'Adaptive'
  return [
    [`${weeks}w`, `${currentPhase} block with week ${program.currentWeek} selected.`],
    ['Safe', program.limitations ? `Filtering around: ${program.limitations}` : 'Exercise swaps and exclusions stay with the plan.'],
    ['Coach', 'Feedback can reshape the remaining sessions.'],
  ]
}

function mergePrs(existing, exercisesLogged, unit) {
  const map = new Map(existing.map((pr) => [pr.exerciseName, pr]))
  exercisesLogged.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      const current = map.get(exercise.name)
      const currentMax = current ? estimatedOneRepMax(current.weight, current.reps) : 0
      const nextMax = estimatedOneRepMax(set.weight, set.reps)
      if (nextMax > currentMax) {
        map.set(exercise.name, { exerciseName: exercise.name, weight: set.weight, reps: set.reps, unit, achievedAt: new Date().toISOString() })
      }
    })
  })
  return [...map.values()].sort((a, b) => estimatedOneRepMax(b.weight, b.reps) - estimatedOneRepMax(a.weight, a.reps))
}

function shouldDeload(program) {
  const values = Object.values(program.weekFeedback ?? {}).slice(-2)
  return values.length >= 2 && values.every((value) => value === 'hard')
}

function isPerformanceExercise(exercise) {
  return exercise.logType === 'performance' || /\b(min|mi|km|m |AMRAP|EMOM|calories|rounds|pace|transition|station)\b/i.test(`${exercise.reps} ${exercise.name}`)
}

function replaceExerciseInWorkout(workout, original, replacement) {
  return { ...workout, exercises: workout.exercises.map((exercise) => (exercise.name === original ? { ...exercise, name: replacement } : exercise)) }
}

function calculatePlates(target) {
  let remaining = Math.max(0, target - 45) / 2
  const plates = [45, 35, 25, 10, 5, 2.5]
  return plates.map((plate) => {
    const count = Math.floor(remaining / plate)
    remaining -= count * plate
    return [plate, count]
  }).filter(([, count]) => count > 0)
}

function migrateData(data) {
  return {
    ...data,
    schemaVersion: DATA_SCHEMA_VERSION,
    profile: data.profile ? savedProfileFields(data.profile) : null,
    logs: (data.logs ?? []).filter((log) => log && log.id && log.workoutTitle),
    prs: data.prs ?? [],
    measurements: data.measurements ?? [],
    achievements: data.achievements ?? [],
    programs: (data.programs ?? []).map(migrateProgram),
  }
}

function regenerateFutureWeeks(program, patch) {
  const profile = normalizeProfile({ ...profileFromProgram(program), ...patch })
  const rebuilt = buildFallbackProgram(profile)
  const currentWeek = Math.max(1, Math.min(program.currentWeek ?? 1, rebuilt.trainingPlan.length))
  const preservedWeeks = Object.fromEntries(
    Object.entries(program.weeklyWorkouts ?? {}).filter(([week]) => Number(week) < currentWeek),
  )
  return {
    ...rebuilt,
    id: program.id,
    createdAt: program.createdAt,
    currentWeek,
    weeklyWorkouts: { ...rebuilt.weeklyWorkouts, ...preservedWeeks },
    weekFeedback: program.weekFeedback ?? {},
    exerciseOverrides: program.exerciseOverrides ?? {},
    excludedExercises: program.excludedExercises ?? [],
  }
}

function migrateProgram(program) {
  if (program.schemaVersion >= ENGINE_SCHEMA_VERSION) return program
  const rebuilt = buildFallbackProgram(profileFromProgram(program))
  return {
    ...rebuilt,
    id: program.id,
    createdAt: program.createdAt ?? rebuilt.createdAt,
    currentWeek: Math.max(1, Math.min(program.currentWeek ?? 1, rebuilt.trainingPlan.length)),
    weekFeedback: program.weekFeedback ?? {},
    exerciseOverrides: program.exerciseOverrides ?? {},
    excludedExercises: program.excludedExercises ?? [],
    schemaVersion: ENGINE_SCHEMA_VERSION,
  }
}

function profileFromProgram(program) {
  return {
    age: program.age,
    gender: program.gender,
    bodyType: program.bodyType,
    goal: parseGoal(program.goal),
    sport: program.sport ?? ['none'],
    customSport: program.customSport ?? '',
    eventGoal: inferEventGoal(program),
    eventDate: program.eventDate ?? '',
    equipment: program.equipment ?? 'commercial gym',
    equipmentAccess: program.equipmentAccess ?? [],
    equipmentDetail: program.equipmentDetail ?? '',
    days: program.workouts?.length ?? daysFromSplitType(program.splitType),
    duration: durationFromWorkout(program.workouts?.[0]),
    split: program.split ?? ['upper_lower'],
    exercisesPerDay: program.exercisesPerDay ?? program.workouts?.[0]?.exercises?.length ?? 6,
    level: program.level ?? 'intermediate',
    limitations: program.limitations ?? '',
  }
}

function parseGoal(goal) {
  if (Array.isArray(goal)) return goal
  if (!goal) return ['health']
  return String(goal)
    .split('+')
    .map((item) => item.trim())
    .filter(Boolean)
}

function inferEventGoal(program) {
  if (!program.isEventPlan) return 'none'
  const title = `${program.title || ''}`.toLowerCase()
  const entry = Object.entries(EVENT_META).find(([, meta]) => meta.label !== 'None' && title.includes(meta.label.toLowerCase()))
  return entry?.[0] ?? 'none'
}

function inferEventLabel(program) {
  const key = program.eventGoal || inferEventGoal(program)
  return EVENT_META[key]?.label ?? 'Event'
}

function avoidedForLimitations(limitations = '') {
  const lower = limitations.toLowerCase()
  const avoided = []
  if (lower.includes('knee')) avoided.push('deep knee-dominant squats, high-impact running, aggressive lunges')
  if (lower.includes('shoulder') || lower.includes('rotator')) avoided.push('painful overhead/pressing volume')
  if (lower.includes('back')) avoided.push('heavy spinal loading and unsupported hinging')
  if (lower.includes('wrist')) avoided.push('loaded wrist extension and high-volume floor pressing')
  if (lower.includes('ankle')) avoided.push('jumping, sprinting, and unstable single-leg impact')
  if (lower.includes('obesity') || lower.includes('sedentary') || lower.includes('arthritis')) avoided.push('excessive impact and abrupt intensity jumps')
  return avoided.join('; ')
}

function durationFromWorkout(workout) {
  const duration = Number(workout?.duration)
  if (!Number.isFinite(duration)) return '45-60 min'
  if (duration <= 20) return '15-20 min'
  if (duration <= 40) return '30-40 min'
  if (duration <= 60) return '45-60 min'
  if (duration <= 75) return '60-75 min'
  return '75+ min'
}

function daysFromSplitType(splitType) {
  const parsed = Number(String(splitType || '').match(/(\d+)-day/)?.[1])
  return Number.isFinite(parsed) ? parsed : 4
}

function programSummary(program) {
  const weeks = program.trainingPlan?.length ?? 12
  return (program.summary || '').replace(/A\s+\d+-week adaptive plan/i, `A ${weeks}-week adaptive plan`)
}

function displaySports(program) {
  const sports = Array.isArray(program.sport) ? program.sport : program.sport ? [program.sport] : []
  const names = sports
    .filter((sport) => sport && sport !== 'none' && sport !== 'other')
    .map((sport) => SPORT_PROFILES[sport]?.label ?? sport)
  if (program.customSport) names.push(program.customSport)
  return [...new Set(names)].join(', ')
}

function displayProfileSports(profile) {
  const sports = Array.isArray(profile.sport) ? profile.sport : profile.sport ? [profile.sport] : []
  const names = sports
    .filter((sport) => sport && sport !== 'none' && sport !== 'other')
    .map((sport) => SPORT_PROFILES[sport]?.label ?? sport)
  if (profile.customSport) names.push(profile.customSport)
  return [...new Set(names)].join(', ')
}

function displaySplits(program) {
  const labels = {
    push_pull_legs: 'Push / Pull / Legs',
    body_part: 'Body part',
    upper_lower: 'Upper / Lower',
  }
  return (Array.isArray(program.split) ? program.split : [])
    .map((split) => labels[split] ?? split)
    .join(', ')
}

function displayEquipmentAccess(program) {
  return (Array.isArray(program.equipmentAccess) ? program.equipmentAccess : [])
    .slice(0, 4)
    .map((item) => EQUIPMENT_ACCESS_LABELS[item] ?? item)
    .join(', ')
}

function confirmDelete(setData, setToast) {
  if (!window.confirm('Delete all FitMe data on this device?')) return
  clearAccount()
  setData(loadData())
  setToast('Account data deleted')
}

function planResearchBasis(program) {
  if (program.researchBasis?.length) return program.researchBasis
  const fallback = []
  const goal = `${program.goal || ''}`.toLowerCase()
  if (goal.includes('strength')) fallback.push({ label: 'Strength prescription heuristic', prescription: 'Prioritizes major movement patterns, progressive overload, and adequate rest.', source: 'ACSM/NSCA-style resistance training practice' })
  if (goal.includes('muscle')) fallback.push({ label: 'Hypertrophy prescription heuristic', prescription: 'Uses moderate reps and repeatable weekly volume for target muscles.', source: 'ACSM/NSCA-style resistance training practice' })
  if (program.isEventPlan) fallback.push({ label: 'Endurance event progression', prescription: 'Builds event-specific conditioning, protects recovery, and tapers into event week.', source: 'Endurance coaching consensus and taper literature' })
  if (!fallback.length) fallback.push({ label: 'HHS adult activity target', prescription: 'Build toward regular aerobic activity plus 2+ days/week of major-muscle strengthening as capacity allows.', source: 'Physical Activity Guidelines for Americans, 2nd ed.' })
  return fallback
}

export default App
