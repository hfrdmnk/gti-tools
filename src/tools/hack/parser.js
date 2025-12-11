// Hack Assembly Parser with Symbol Table and Label Resolution

// Predefined symbols
const PREDEFINED_SYMBOLS = {
  SP: 0,
  LCL: 1,
  ARG: 2,
  THIS: 3,
  THAT: 4,
  R0: 0, R1: 1, R2: 2, R3: 3, R4: 4, R5: 5, R6: 6, R7: 7,
  R8: 8, R9: 9, R10: 10, R11: 11, R12: 12, R13: 13, R14: 14, R15: 15,
  SCREEN: 16384,
  KBD: 24576
}

// Parse a single line, removing comments and whitespace
function cleanLine(line) {
  const commentIndex = line.indexOf('//')
  if (commentIndex !== -1) {
    line = line.slice(0, commentIndex)
  }
  return line.trim()
}

// Parse C-instruction: dest=comp;jump
function parseCInstruction(line) {
  let dest = null
  let comp = null
  let jump = null

  // Check for dest=
  const eqIndex = line.indexOf('=')
  if (eqIndex !== -1) {
    dest = line.slice(0, eqIndex)
    line = line.slice(eqIndex + 1)
  }

  // Check for ;jump
  const semiIndex = line.indexOf(';')
  if (semiIndex !== -1) {
    jump = line.slice(semiIndex + 1)
    line = line.slice(0, semiIndex)
  }

  comp = line

  return { dest, comp, jump }
}

// Main parser function
export function parse(code) {
  const lines = code.split('\n')
  const symbolTable = { ...PREDEFINED_SYMBOLS }
  const instructions = []
  let nextVarAddress = 16 // User variables start at RAM[16]

  // First pass: Find labels (LABEL) and map to ROM addresses
  let romAddress = 0
  const cleanedLines = []

  for (let i = 0; i < lines.length; i++) {
    const clean = cleanLine(lines[i])
    if (!clean) continue

    if (clean.startsWith('(') && clean.endsWith(')')) {
      // Label declaration
      const label = clean.slice(1, -1)
      symbolTable[label] = romAddress
    } else {
      cleanedLines.push({ line: clean, originalLine: i + 1 })
      romAddress++
    }
  }

  // Second pass: Parse instructions and resolve symbols
  for (const { line, originalLine } of cleanedLines) {
    if (line.startsWith('@')) {
      // A-instruction
      const symbol = line.slice(1)
      let value

      if (/^\d+$/.test(symbol)) {
        // Numeric constant
        value = parseInt(symbol, 10)
      } else if (symbol in symbolTable) {
        // Known symbol
        value = symbolTable[symbol]
      } else {
        // New variable - allocate address
        symbolTable[symbol] = nextVarAddress
        value = nextVarAddress
        nextVarAddress++
      }

      instructions.push({
        type: 'A',
        value,
        symbol: /^\d+$/.test(symbol) ? null : symbol,
        line: originalLine,
        raw: line
      })
    } else {
      // C-instruction
      const { dest, comp, jump } = parseCInstruction(line)
      instructions.push({
        type: 'C',
        dest,
        comp,
        jump,
        line: originalLine,
        raw: line
      })
    }
  }

  return { instructions, symbolTable }
}

// Generate human-readable explanation for an instruction
export function explain(instruction, state) {
  if (instruction.type === 'A') {
    const symbolPart = instruction.symbol ? ` (${instruction.symbol})` : ''
    return `A = ${instruction.value}${symbolPart}`
  }

  const { dest, comp, jump } = instruction
  const parts = []

  // Describe computation
  const compDesc = describeComp(comp, state)

  if (dest) {
    const destParts = []
    if (dest.includes('A')) destParts.push('A')
    if (dest.includes('D')) destParts.push('D')
    if (dest.includes('M')) destParts.push(`RAM[${state.A}]`)
    parts.push(`${destParts.join(', ')} = ${compDesc}`)
  }

  if (jump) {
    const jumpDesc = describeJump(jump)
    if (dest) {
      parts.push(`dann ${jumpDesc}`)
    } else {
      parts.push(`${compDesc}; ${jumpDesc}`)
    }
  }

  return parts.join(', ') || comp
}

function describeComp(comp, state) {
  const A = state.A
  const D = state.D
  const M = state.RAM[state.A] || 0

  const descriptions = {
    '0': '0',
    '1': '1',
    '-1': '-1',
    'D': `D (=${D})`,
    'A': `A (=${A})`,
    'M': `RAM[${A}] (=${M})`,
    '!D': `!D (=${~D & 0xFFFF})`,
    '!A': `!A (=${~A & 0xFFFF})`,
    '!M': `!RAM[${A}] (=${~M & 0xFFFF})`,
    '-D': `-D (=${-D & 0xFFFF})`,
    '-A': `-A (=${-A & 0xFFFF})`,
    '-M': `-RAM[${A}] (=${-M & 0xFFFF})`,
    'D+1': `D+1 (=${D}+1)`,
    'A+1': `A+1 (=${A}+1)`,
    'M+1': `RAM[${A}]+1 (=${M}+1)`,
    'D-1': `D-1 (=${D}-1)`,
    'A-1': `A-1 (=${A}-1)`,
    'M-1': `RAM[${A}]-1 (=${M}-1)`,
    'D+A': `D+A (=${D}+${A})`,
    'D+M': `D+RAM[${A}] (=${D}+${M})`,
    'D-A': `D-A (=${D}-${A})`,
    'D-M': `D-RAM[${A}] (=${D}-${M})`,
    'A-D': `A-D (=${A}-${D})`,
    'M-D': `RAM[${A}]-D (=${M}-${D})`,
    'D&A': `D&A (=${D}&${A})`,
    'D&M': `D&RAM[${A}] (=${D}&${M})`,
    'D|A': `D|A (=${D}|${A})`,
    'D|M': `D|RAM[${A}] (=${D}|${M})`
  }

  return descriptions[comp] || comp
}

function describeJump(jump) {
  const descriptions = {
    'JGT': 'springe wenn > 0',
    'JEQ': 'springe wenn = 0',
    'JGE': 'springe wenn >= 0',
    'JLT': 'springe wenn < 0',
    'JLE': 'springe wenn <= 0',
    'JNE': 'springe wenn != 0',
    'JMP': 'springe immer'
  }
  return descriptions[jump] || jump
}

// Generate structured step explanation (like Float tool)
export function explainStep(instruction, state) {
  const A = state.A
  const D = state.D
  const M = state.RAM[A] || 0

  if (instruction.type === 'A') {
    const symbolPart = instruction.symbol ? ` (${instruction.symbol})` : ''
    return {
      title: 'A-Instruktion',
      desc: 'Lade Wert in das A-Register',
      detail: `A = ${instruction.value}${symbolPart}`
    }
  }

  const { dest, comp, jump } = instruction

  // Determine the main action based on dest and comp
  if (dest && dest.includes('M') && !dest.includes('A') && !dest.includes('D')) {
    // Writing to memory only
    const result = computeValue(comp, state)
    return {
      title: 'Schreiben in Speicher',
      desc: `Speichere Wert in RAM[${A}]`,
      detail: `RAM[${A}] = ${comp} = ${result}`
    }
  }

  if (dest && dest.includes('D') && comp === 'M') {
    // D=M: Reading from memory
    return {
      title: 'Lesen aus Speicher',
      desc: `Lade RAM[${A}] in D-Register`,
      detail: `D = RAM[${A}] = ${M}`
    }
  }

  if (dest && dest.includes('A') && comp === 'M') {
    // A=M: Following a pointer
    return {
      title: 'Pointer folgen',
      desc: `Lade RAM[${A}] als neue Adresse`,
      detail: `A = RAM[${A}] = ${M}`
    }
  }

  if (dest && dest.includes('D') && !comp.includes('M')) {
    // D = some computation not involving M
    const result = computeValue(comp, state)
    return {
      title: 'Berechnung',
      desc: `Berechne ${comp} und speichere in D`,
      detail: `D = ${comp} = ${result}`
    }
  }

  if (jump && !dest) {
    // Jump without destination (conditional or unconditional)
    const compValue = computeValue(comp, state)
    const willJump = checkJump(jump, compValue)
    const jumpTarget = A

    if (jump === 'JMP') {
      return {
        title: 'Unbedingter Sprung',
        desc: 'Springe zur Adresse in A',
        detail: `Springe zu ${jumpTarget}`
      }
    }

    const condition = getJumpCondition(jump)
    return {
      title: 'Bedingter Sprung',
      desc: `Springe wenn ${comp} ${condition}`,
      detail: `${comp} = ${compValue} ${condition}? ${willJump ? 'Ja' : 'Nein'} → ${willJump ? `Springe zu ${jumpTarget}` : 'Weiter'}`
    }
  }

  if (dest && jump) {
    // Computation with jump
    const result = computeValue(comp, state)
    const willJump = checkJump(jump, result)
    const condition = getJumpCondition(jump)
    return {
      title: 'Berechnung mit Sprung',
      desc: `${dest} = ${comp}, dann ${describeJump(jump)}`,
      detail: `${dest} = ${result}, ${result} ${condition}? ${willJump ? 'Ja → Springe' : 'Nein → Weiter'}`
    }
  }

  // Generic C-instruction
  if (dest) {
    const result = computeValue(comp, state)
    return {
      title: 'C-Instruktion',
      desc: `${dest} = ${comp}`,
      detail: `${dest} = ${result}`
    }
  }

  return {
    title: 'Instruktion',
    desc: instruction.raw,
    detail: ''
  }
}

function computeValue(comp, state) {
  const A = state.A
  const D = state.D
  const M = state.RAM[state.A] || 0

  const computations = {
    '0': 0, '1': 1, '-1': -1,
    'D': D, 'A': A, 'M': M,
    '!D': ~D & 0xFFFF, '!A': ~A & 0xFFFF, '!M': ~M & 0xFFFF,
    '-D': -D, '-A': -A, '-M': -M,
    'D+1': D + 1, 'A+1': A + 1, 'M+1': M + 1,
    'D-1': D - 1, 'A-1': A - 1, 'M-1': M - 1,
    'D+A': D + A, 'D+M': D + M,
    'D-A': D - A, 'D-M': D - M,
    'A-D': A - D, 'M-D': M - D,
    'D&A': D & A, 'D&M': D & M,
    'D|A': D | A, 'D|M': D | M
  }

  return computations[comp] ?? comp
}

function checkJump(jump, value) {
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

function getJumpCondition(jump) {
  const conditions = {
    'JGT': '> 0',
    'JEQ': '= 0',
    'JGE': '>= 0',
    'JLT': '< 0',
    'JLE': '<= 0',
    'JNE': '!= 0',
    'JMP': 'immer'
  }
  return conditions[jump] || jump
}
