const DEFAULT_STOP_GUIDANCE = 'Stop or reduce intensity if you feel sharp pain, dizziness, chest discomfort, unusual shortness of breath, numbness, or form breaking down. Seek professional advice if symptoms continue.'
const DEMO_PLACEHOLDER = '/exercises/demo-placeholder.svg'

const instructionLibrary = {
  'goblet squat': {
    media: {
      type: 'placeholder',
      src: DEMO_PLACEHOLDER,
      label: 'Goblet squat demo coming soon',
    },
    primaryMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Core'],
    equipment: 'Dumbbell or kettlebell',
    startingPosition: 'Stand tall with your feet about shoulder-width apart. Hold the weight close to your chest with both hands.',
    steps: [
      'Brace your core and keep your chest tall.',
      'Push your hips back and bend your knees to lower under control.',
      'Keep your knees tracking in the same direction as your toes.',
      'Lower only as far as you can while staying balanced.',
      'Push through your heels and mid-foot to stand back up.',
    ],
    breathing: 'Inhale as you lower. Exhale as you stand up.',
    mistakes: ['Letting the knees cave inward', 'Rounding the back', 'Dropping the chest forward', 'Going too heavy too soon'],
    safety: ['Start with a light weight.', 'Use a chair or box as a depth guide if needed.', 'Reduce range of motion if form breaks down.'],
    modifications: ['Bodyweight squat', 'Sit-to-stand from a chair'],
  },
  'bench press': {
    media: {
      type: 'placeholder',
      src: DEMO_PLACEHOLDER,
      label: 'Bench press demo coming soon',
    },
    primaryMuscles: ['Chest', 'Triceps', 'Front shoulders'],
    equipment: 'Bench, barbell or dumbbells',
    startingPosition: 'Lie on a bench with your feet planted, upper back set, and hands slightly wider than shoulder width.',
    steps: [
      'Brace your body and keep your shoulder blades lightly squeezed.',
      'Lower the weight with control toward the lower chest.',
      'Keep wrists stacked over elbows.',
      'Press the weight up without bouncing.',
      'Finish with arms strong but not forcefully locked.',
    ],
    breathing: 'Inhale before lowering. Exhale as you press up.',
    mistakes: ['Bouncing the weight', 'Letting elbows flare straight out', 'Lifting hips off the bench', 'Using a weight you cannot control'],
    safety: ['Use a spotter or safety arms for heavy sets.', 'Stop if shoulder pain appears.', 'Keep the movement smooth.'],
    modifications: ['Push-up', 'Machine chest press', 'Dumbbell floor press'],
  },
  'incline dumbbell press': {
    media: {
      type: 'placeholder',
      src: DEMO_PLACEHOLDER,
      label: 'Incline dumbbell press demo coming soon',
    },
    primaryMuscles: ['Upper chest', 'Triceps', 'Front shoulders'],
    equipment: 'Incline bench and dumbbells',
    startingPosition: 'Set a bench to a moderate incline. Hold dumbbells near your chest with feet planted.',
    steps: [
      'Brace your core and keep your shoulder blades set.',
      'Press the dumbbells up and slightly together.',
      'Lower slowly until you feel a comfortable chest stretch.',
      'Keep elbows slightly below shoulder level.',
      'Repeat without letting the weights drift behind you.',
    ],
    breathing: 'Inhale as you lower. Exhale as you press.',
    mistakes: ['Setting the bench too steep', 'Shrugging shoulders', 'Dropping too deep', 'Letting dumbbells wobble'],
    safety: ['Use lighter dumbbells until control is solid.', 'Stop if shoulder pain appears.'],
    modifications: ['Machine chest press', 'Push-up with hands elevated'],
  },
  'cable row': {
    media: {
      type: 'placeholder',
      src: DEMO_PLACEHOLDER,
      label: 'Cable row demo coming soon',
    },
    primaryMuscles: ['Mid back', 'Lats', 'Rear shoulders', 'Biceps'],
    equipment: 'Cable row station or resistance band',
    startingPosition: 'Sit or stand tall with the handle in both hands and arms extended.',
    steps: [
      'Brace your core and keep your ribs down.',
      'Pull the handle toward your lower ribs.',
      'Squeeze your shoulder blades gently together.',
      'Pause briefly, then return with control.',
      'Keep your torso still throughout the set.',
    ],
    breathing: 'Exhale as you pull. Inhale as you return.',
    mistakes: ['Leaning back to move the weight', 'Shrugging shoulders', 'Rounding the back', 'Rushing the return'],
    safety: ['Choose a weight that lets your torso stay still.', 'Reduce load if your lower back takes over.'],
    modifications: ['Band row', 'Chest-supported row', 'Single-arm dumbbell row'],
  },
  'romanian deadlift': {
    media: {
      type: 'placeholder',
      src: DEMO_PLACEHOLDER,
      label: 'Romanian deadlift demo coming soon',
    },
    primaryMuscles: ['Hamstrings', 'Glutes', 'Lower back support muscles'],
    equipment: 'Barbell, dumbbells, or kettlebells',
    startingPosition: 'Stand tall with weight in front of your thighs and knees softly bent.',
    steps: [
      'Brace your core.',
      'Push your hips back like closing a car door.',
      'Keep the weight close to your legs.',
      'Lower until you feel a hamstring stretch while keeping your back neutral.',
      'Drive hips forward to stand tall.',
    ],
    breathing: 'Inhale and brace before lowering. Exhale as you stand.',
    mistakes: ['Rounding the back', 'Squatting instead of hinging', 'Letting the weight drift forward', 'Going too low'],
    safety: ['Start light.', 'Stop if you feel sharp back pain.', 'Limit range if hamstrings or back lose control.'],
    modifications: ['Hip hinge drill', 'Glute bridge', 'Cable pull-through'],
  },
}

const categoryDefaults = {
  push: {
    muscles: ['Chest', 'Shoulders', 'Triceps'],
    equipment: 'Bodyweight, dumbbells, machines, cables, or barbell',
    start: 'Set up with your body braced and the weight or handles under control.',
    steps: ['Start from a stable position.', 'Press or push smoothly.', 'Keep wrists and elbows controlled.', 'Return slowly to the start.', 'Repeat only while form stays steady.'],
    modifications: ['Use a machine', 'Use lighter dumbbells', 'Try an elevated push-up'],
  },
  pull: {
    muscles: ['Back', 'Rear shoulders', 'Biceps'],
    equipment: 'Cable, machine, bar, dumbbells, or bands',
    start: 'Begin tall and braced with your shoulders relaxed away from your ears.',
    steps: ['Start with control.', 'Pull using your back, not just your arms.', 'Pause briefly at the strongest position.', 'Return slowly.', 'Keep your torso steady.'],
    modifications: ['Use a band', 'Use chest support', 'Lower the load'],
  },
  squat: {
    muscles: ['Quads', 'Glutes', 'Core'],
    equipment: 'Bodyweight, dumbbell, machine, or barbell',
    start: 'Stand with feet comfortable and balanced.',
    steps: ['Brace your core.', 'Bend knees and hips together.', 'Keep knees tracking with toes.', 'Lower with control.', 'Stand up smoothly.'],
    modifications: ['Sit-to-stand', 'Box squat', 'Reduce depth'],
  },
  hinge: {
    muscles: ['Hamstrings', 'Glutes', 'Back support muscles'],
    equipment: 'Bodyweight, dumbbells, kettlebell, cable, or barbell',
    start: 'Stand tall with a soft bend in your knees.',
    steps: ['Brace your core.', 'Push hips back.', 'Keep the back neutral.', 'Feel the work in hamstrings and glutes.', 'Return to standing with control.'],
    modifications: ['Glute bridge', 'Hip hinge drill', 'Cable pull-through'],
  },
  legs: {
    muscles: ['Quads', 'Glutes', 'Hamstrings', 'Calves'],
    equipment: 'Bodyweight, dumbbells, machines, or bands',
    start: 'Set your feet and brace before moving.',
    steps: ['Move slowly into the working range.', 'Keep joints tracking comfortably.', 'Pause if needed for balance.', 'Return with control.', 'Keep reps smooth.'],
    modifications: ['Reduce range of motion', 'Use support for balance', 'Use a lighter load'],
  },
  cardio: {
    muscles: ['Heart and lungs', 'Legs', 'Core'],
    equipment: 'Cardio machine, open space, track, bike, rower, or bodyweight',
    start: 'Begin at an easy pace where you can control your breathing.',
    steps: ['Warm up gradually.', 'Build to the prescribed pace or effort.', 'Keep breathing steady.', 'Slow down if form or breathing breaks down.', 'Cool down before stopping fully.'],
    modifications: ['Walk instead of run', 'Use a bike', 'Reduce pace or interval length'],
  },
  core: {
    muscles: ['Abs', 'Obliques', 'Deep core', 'Low-back support muscles'],
    equipment: 'Bodyweight, cable, band, or weight depending on the movement',
    start: 'Set your ribs down, brace gently, and keep your spine controlled.',
    steps: ['Brace as if preparing for a light cough.', 'Move slowly.', 'Avoid holding your breath too long.', 'Keep hips and ribs controlled.', 'Stop before your back arches or twists.'],
    modifications: ['Dead bug', 'Shorter hold', 'Reduce range of motion'],
  },
  arms: {
    muscles: ['Biceps', 'Triceps', 'Forearms'],
    equipment: 'Dumbbells, cable, band, or EZ bar',
    start: 'Stand or sit tall with your shoulders relaxed.',
    steps: ['Keep upper arms controlled.', 'Move through a comfortable range.', 'Pause briefly where you feel the target muscle.', 'Return slowly.', 'Avoid swinging.'],
    modifications: ['Use lighter weight', 'Use bands', 'Do one arm at a time'],
  },
  overhead: {
    muscles: ['Shoulders', 'Triceps', 'Upper back support'],
    equipment: 'Dumbbells, machine, landmine, or bands',
    start: 'Brace your core and keep ribs down before pressing.',
    steps: ['Start with the weight controlled near shoulder height.', 'Press smoothly without leaning back.', 'Keep neck relaxed.', 'Lower with control.', 'Stop if shoulders pinch.'],
    modifications: ['Landmine press', 'Machine press', 'Lighter dumbbells'],
  },
  mobility: {
    muscles: ['Joints and surrounding muscles'],
    equipment: 'Usually bodyweight, band, or mat',
    start: 'Move into a comfortable position with no sharp pain.',
    steps: ['Start gently.', 'Move slowly into the stretch or range.', 'Breathe calmly.', 'Hold or repeat as prescribed.', 'Back off if symptoms increase.'],
    modifications: ['Reduce range', 'Use support', 'Hold for less time'],
  },
  balance: {
    muscles: ['Feet', 'Hips', 'Core', 'Stabilizers'],
    equipment: 'Bodyweight or light support',
    start: 'Stand near a wall, bench, or stable object for support.',
    steps: ['Stand tall and brace lightly.', 'Use support as needed.', 'Move slowly.', 'Keep breathing steady.', 'Stop before balance becomes unsafe.'],
    modifications: ['Use two-hand support', 'Shorten the hold', 'Keep both feet closer together'],
  },
}

const inferEquipment = (name, category) => {
  const lower = name.toLowerCase()
  if (/dumbbell/.test(lower)) return 'Dumbbell'
  if (/barbell|bench press|squat|deadlift/.test(lower)) return 'Barbell or rack setup if loaded'
  if (/cable/.test(lower)) return 'Cable station'
  if (/machine|pec deck|leg press|lat pulldown/.test(lower)) return 'Machine'
  if (/band/.test(lower)) return 'Resistance band'
  if (/bike|rower|ski|run|walk|treadmill|erg/.test(lower)) return 'Cardio equipment or open space'
  if (/kettlebell/.test(lower)) return 'Kettlebell'
  return categoryDefaults[category]?.equipment || 'Bodyweight or available equipment'
}

const demoLabel = (name) => `${name} demo coming soon`

export const getExerciseInstruction = (exercise = {}) => {
  if (!exercise?.name) {
    return { status: 'empty', message: 'No exercise selected.' }
  }

  const key = exercise.name.toLowerCase().replace(/s\d+[ab]\s*·\s*/i, '').trim()
  const custom = instructionLibrary[key]
  const fallback = categoryDefaults[exercise.category] || categoryDefaults.core
  const data = custom || {
    primaryMuscles: fallback.muscles,
    equipment: inferEquipment(exercise.name, exercise.category),
    startingPosition: fallback.start,
    steps: fallback.steps,
    media: {
      type: 'placeholder',
      src: DEMO_PLACEHOLDER,
      label: demoLabel(exercise.name),
    },
    breathing: 'Breathe steadily. Inhale during the easier or lowering phase. Exhale during the effort.',
    mistakes: ['Moving too fast', 'Using more weight than you can control', 'Holding your breath too long', 'Continuing after form breaks down'],
    safety: ['Start easy for the first set.', 'Use a smaller range of motion if needed.', 'Keep the movement controlled.'],
    modifications: fallback.modifications,
  }

  return {
    status: 'ready',
    name: exercise.name,
    primaryMuscles: data.primaryMuscles,
    equipment: data.equipment || inferEquipment(exercise.name, exercise.category),
    media: data.media || {
      type: 'placeholder',
      src: DEMO_PLACEHOLDER,
      label: demoLabel(exercise.name),
    },
    startingPosition: data.startingPosition,
    steps: data.steps,
    breathing: data.breathing,
    mistakes: data.mistakes,
    safety: data.safety,
    modifications: data.modifications,
    stopGuidance: DEFAULT_STOP_GUIDANCE,
    isDefault: !custom,
  }
}
