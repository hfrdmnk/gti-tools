// Hack VM Executor

// Create initial VM state
export function createState() {
  return {
    A: 0,
    D: 0,
    RAM: {},
    PC: 0
  }
}

// Create VM state with initial RAM values
export function createStateWithRAM(initialRAM = {}) {
  return {
    A: 0,
    D: 0,
    RAM: { ...initialRAM },
    PC: 0
  }
}

// Deep clone state for history
export function cloneState(state) {
  return {
    A: state.A,
    D: state.D,
    RAM: { ...state.RAM },
    PC: state.PC
  }
}

// Get RAM value (default 0)
function getRAM(state, address) {
  return state.RAM[address] || 0
}

// Set RAM value
function setRAM(state, address, value) {
  state.RAM[address] = value & 0xFFFF // 16-bit values
}

// Compute a value based on the comp field
function compute(comp, state) {
  const A = state.A
  const D = state.D
  const M = getRAM(state, state.A)

  const computations = {
    '0': 0,
    '1': 1,
    '-1': -1,
    'D': D,
    'A': A,
    'M': M,
    '!D': ~D,
    '!A': ~A,
    '!M': ~M,
    '-D': -D,
    '-A': -A,
    '-M': -M,
    'D+1': D + 1,
    'A+1': A + 1,
    'M+1': M + 1,
    'D-1': D - 1,
    'A-1': A - 1,
    'M-1': M - 1,
    'D+A': D + A,
    'D+M': D + M,
    'D-A': D - A,
    'D-M': D - M,
    'A-D': A - D,
    'M-D': M - D,
    'D&A': D & A,
    'D&M': D & M,
    'D|A': D | A,
    'D|M': D | M
  }

  const result = computations[comp]
  if (result === undefined) {
    console.warn(`Unknown computation: ${comp}`)
    return 0
  }

  // Ensure 16-bit signed value (-32768 to 32767)
  return toSigned16(result)
}

// Convert to 16-bit signed integer
function toSigned16(value) {
  value = value & 0xFFFF
  if (value >= 0x8000) {
    return value - 0x10000
  }
  return value
}

// Check if jump condition is satisfied
function shouldJump(jump, value) {
  if (!jump) return false

  const conditions = {
    'JGT': value > 0,
    'JEQ': value === 0,
    'JGE': value >= 0,
    'JLT': value < 0,
    'JLE': value <= 0,
    'JNE': value !== 0,
    'JMP': true
  }

  return conditions[jump] || false
}

// Execute a single instruction, returns new state
export function step(state, instruction) {
  const newState = cloneState(state)

  if (instruction.type === 'A') {
    // A-instruction: load value into A register
    newState.A = instruction.value & 0xFFFF
    newState.PC++
  } else {
    // C-instruction
    const { dest, comp, jump } = instruction

    // Compute the value
    const value = compute(comp, state)

    // Store in destinations
    if (dest) {
      if (dest.includes('A')) newState.A = value & 0xFFFF
      if (dest.includes('D')) newState.D = value & 0xFFFF
      if (dest.includes('M')) setRAM(newState, state.A, value)
    }

    // Handle jump
    if (shouldJump(jump, value)) {
      newState.PC = newState.A
    } else {
      newState.PC++
    }
  }

  return newState
}

// Check if program has ended (PC beyond instructions)
export function isHalted(state, instructionCount) {
  return state.PC >= instructionCount
}

// Get description of what changed
export function getChanges(oldState, newState) {
  const changes = []

  if (oldState.A !== newState.A) {
    changes.push({ register: 'A', from: oldState.A, to: newState.A })
  }
  if (oldState.D !== newState.D) {
    changes.push({ register: 'D', from: oldState.D, to: newState.D })
  }
  if (oldState.PC !== newState.PC) {
    changes.push({ register: 'PC', from: oldState.PC, to: newState.PC })
  }

  // Check RAM changes
  const allAddresses = new Set([
    ...Object.keys(oldState.RAM),
    ...Object.keys(newState.RAM)
  ])

  for (const addr of allAddresses) {
    const oldVal = oldState.RAM[addr] || 0
    const newVal = newState.RAM[addr] || 0
    if (oldVal !== newVal) {
      changes.push({ register: `RAM[${addr}]`, from: oldVal, to: newVal })
    }
  }

  return changes
}
