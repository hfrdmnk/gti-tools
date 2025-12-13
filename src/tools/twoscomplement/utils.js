// Zweierkomplement Visualizer - Hilfsfunktionen

/**
 * Dezimalzahl in Zweierkomplement-Binärdarstellung konvertieren
 */
export function toTwosComplement(decimal, bitWidth) {
  if (decimal >= 0) {
    return decimal.toString(2).padStart(bitWidth, '0')
  }
  // Negativ: 2^n + decimal
  const maxVal = Math.pow(2, bitWidth)
  return (maxVal + decimal).toString(2)
}

/**
 * Binärstring als Zweierkomplement interpretieren
 */
export function fromTwosComplement(binary) {
  const bitWidth = binary.length
  const value = parseInt(binary, 2)
  if (binary[0] === '1') {
    return value - Math.pow(2, bitWidth)
  }
  return value
}

/**
 * Gültigen Wertebereich für Zweierkomplement berechnen
 */
export function getValidRange(bitWidth) {
  return {
    min: -Math.pow(2, bitWidth - 1),
    max: Math.pow(2, bitWidth - 1) - 1
  }
}

/**
 * Alle Bits in einem Binärstring invertieren
 */
export function invertBits(binary) {
  return binary.split('').map(b => b === '0' ? '1' : '0').join('')
}

/**
 * Berechne welche Bits sich zwischen zwei Binärstrings geändert haben
 */
function getChangedBits(prevBinary, currentBinary) {
  if (!prevBinary) return []
  const changed = []
  for (let i = 0; i < currentBinary.length; i++) {
    if (prevBinary[i] !== currentBinary[i]) {
      changed.push(i)
    }
  }
  return changed
}

/**
 * Schritt-für-Schritt Konvertierung generieren
 * Jeder Schritt enthält: binary (aktueller Zustand), changedBits (geänderte Indizes)
 */
export function generateConversionSteps(decimal, bitWidth) {
  const steps = []
  const range = getValidRange(bitWidth)
  const finalResult = toTwosComplement(decimal, bitWidth)

  // Eingabe validieren
  if (decimal < range.min || decimal > range.max) {
    return [{
      title: 'Ungültige Eingabe',
      desc: `Zahl muss zwischen ${range.min} und ${range.max} liegen`,
      detail: `Eingabe: ${decimal}`,
      binary: '0'.repeat(bitWidth),
      changedBits: [],
      type: 'error'
    }]
  }

  if (decimal >= 0) {
    // Positive Zahl: direkte Binärdarstellung
    const binary = toTwosComplement(decimal, bitWidth)

    steps.push({
      title: 'Endergebnis',
      desc: `${decimal} ≥ 0 → direkte Binärdarstellung`,
      detail: binary,
      binary: binary,
      changedBits: [],
      isFinal: true
    })
  } else {
    // Negative Zahl: Betrag → Invertieren → +1
    const positiveBinary = Math.abs(decimal).toString(2).padStart(bitWidth, '0')
    const inverted = invertBits(positiveBinary)
    const result = toTwosComplement(decimal, bitWidth)

    steps.push({
      title: 'Betrag in Binär',
      desc: `|${decimal}| = ${Math.abs(decimal)}`,
      detail: positiveBinary,
      binary: positiveBinary,
      changedBits: [] // Erster Schritt, keine vorherigen Bits
    })

    steps.push({
      title: 'Bits invertieren',
      desc: 'Alle Bits umkehren (0 ↔ 1)',
      detail: `${positiveBinary} → ${inverted}`,
      binary: inverted,
      changedBits: getChangedBits(positiveBinary, inverted)
    })

    steps.push({
      title: '+1 addieren',
      desc: 'Zum invertierten Wert 1 addieren',
      detail: `${inverted} + 1 = ${result}`,
      binary: result,
      changedBits: getChangedBits(inverted, result)
    })

    // Finaler Schritt
    steps.push({
      title: 'Endergebnis',
      desc: `${decimal} im Zweierkomplement`,
      detail: result,
      binary: result,
      changedBits: [],
      isFinal: true
    })
  }

  return steps
}

/**
 * Vollständige Wertetabelle generieren
 */
export function generateFullTable(bitWidth) {
  const rows = []
  const maxCode = Math.pow(2, bitWidth)

  for (let code = 0; code < maxCode; code++) {
    const binary = code.toString(2).padStart(bitWidth, '0')
    rows.push({
      binary,
      unsigned: code,
      twosComplement: fromTwosComplement(binary)
    })
  }

  return rows
}

/**
 * Addition mit Schritt-für-Schritt Erklärung
 */
export function generateAdditionSteps(x, y, bitWidth) {
  const steps = []
  const range = getValidRange(bitWidth)

  // Eingaben validieren
  if (x < range.min || x > range.max || y < range.min || y > range.max) {
    return [{
      title: 'Ungültige Eingabe',
      desc: `Zahlen müssen zwischen ${range.min} und ${range.max} liegen`,
      detail: `x = ${x}, y = ${y}`,
      type: 'error'
    }]
  }

  const xBinary = toTwosComplement(x, bitWidth)
  const yBinary = toTwosComplement(y, bitWidth)

  // Schritt 1: Operanden zeigen
  steps.push({
    title: 'Operanden umwandeln',
    desc: `x = ${x}, y = ${y}`,
    detail: `x = ${xBinary}, y = ${yBinary}`,
    xBinary,
    yBinary,
    phase: 'convert'
  })

  // Schritt 2: Binäraddition Bit für Bit
  let carry = 0
  let resultBits = []
  let carryBits = ['']

  for (let i = bitWidth - 1; i >= 0; i--) {
    const xBit = parseInt(xBinary[i])
    const yBit = parseInt(yBinary[i])
    const sum = xBit + yBit + carry
    const resultBit = sum % 2
    carry = Math.floor(sum / 2)
    resultBits.unshift(resultBit)
    if (i > 0) {
      carryBits.unshift(carry)
    }
  }

  const resultBinary = resultBits.join('')
  const finalCarry = carry

  steps.push({
    title: 'Binäraddition',
    desc: 'Bit für Bit von rechts nach links',
    detail: `Übertrag am Ende: ${finalCarry}`,
    xBinary,
    yBinary,
    resultBinary,
    carryBits: [finalCarry, ...carryBits],
    phase: 'addition'
  })

  // Schritt 3: Ergebnis interpretieren
  const resultDecimal = fromTwosComplement(resultBinary)
  const expectedResult = x + y

  // Überlauf-Erkennung:
  // Überlauf wenn beide Operanden gleiches Vorzeichen haben, aber Ergebnis anderes
  const xSign = xBinary[0]
  const ySign = yBinary[0]
  const resultSign = resultBinary[0]
  const overflow = (xSign === ySign) && (resultSign !== xSign)

  steps.push({
    title: overflow ? 'Ergebnis (mit Überlauf!)' : 'Ergebnis',
    desc: overflow
      ? `Überlauf: ${x} + ${y} = ${expectedResult} passt nicht in ${bitWidth} Bit`
      : `${x} + ${y} = ${resultDecimal}`,
    detail: `${resultBinary} = ${resultDecimal}`,
    resultBinary,
    resultDecimal,
    expectedResult,
    overflow,
    phase: 'result',
    explanation: overflow
      ? `Das mathematische Ergebnis ${expectedResult} liegt außerhalb von [${range.min}, ${range.max}]`
      : finalCarry
        ? `Der Übertrag ${finalCarry} wird verworfen (mod 2^${bitWidth})`
        : 'Addition korrekt'
  })

  return steps
}
