import { describe, expect, it } from 'vitest'
import { getExerciseInstruction } from './exerciseInstructions'

describe('exercise instructions', () => {
  it('returns complete custom instructions with safety guidance', () => {
    const instruction = getExerciseInstruction({ name: 'Goblet Squat', category: 'squat' })

    expect(instruction.status).toBe('ready')
    expect(instruction.isDefault).toBe(false)
    expect(instruction.primaryMuscles).toContain('Quads')
    expect(instruction.media.src).toContain('/exercises/')
    expect(instruction.steps.length).toBeGreaterThan(3)
    expect(instruction.mistakes.length).toBeGreaterThan(0)
    expect(instruction.safety.length).toBeGreaterThan(0)
    expect(instruction.modifications.length).toBeGreaterThan(0)
    expect(instruction.stopGuidance).toContain('chest discomfort')
  })

  it('returns safe default instructions for exercises without custom content', () => {
    const instruction = getExerciseInstruction({ name: 'Mystery Press', category: 'push' })

    expect(instruction.status).toBe('ready')
    expect(instruction.isDefault).toBe(true)
    expect(instruction.primaryMuscles).toEqual(['Chest', 'Shoulders', 'Triceps'])
    expect(instruction.equipment).toBeTruthy()
    expect(instruction.media.type).toBe('placeholder')
    expect(instruction.media.label).toContain('Mystery Press')
    expect(instruction.mistakes).toContain('Moving too fast')
    expect(instruction.safety.length).toBeGreaterThan(0)
    expect(instruction.modifications.length).toBeGreaterThan(0)
  })

  it('handles empty selections without crashing', () => {
    expect(getExerciseInstruction({}).status).toBe('empty')
  })
})
