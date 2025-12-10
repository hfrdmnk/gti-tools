import { useState, useEffect } from 'react'
import { RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react'

const BIAS = 127
const EXPONENT_BITS = 8
const MANTISSA_BITS = 23

// Clean display of floating-point numbers (avoid 0.45600000000000307)
function cleanFloat(num, maxDecimals = 10) {
  const rounded = parseFloat(num.toPrecision(12))
  if (Number.isInteger(rounded)) return rounded.toString()
  const str = rounded.toString()
  const parts = str.split('.')
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    return parseFloat(rounded.toFixed(maxDecimals)).toString()
  }
  return str
}

// Convert decimal to IEEE 754 with step-by-step explanation
function decimalToIEEE754(decimal) {
  const steps = []
  const num = parseFloat(decimal)

  if (isNaN(num)) {
    return { error: 'Ungueltige Eingabe', steps: [] }
  }

  // Preserve original input string for clean display
  const inputStr = decimal.toString().replace(/^-/, '')
  const inputFracStr = inputStr.includes('.') ? inputStr.split('.')[1] : ''

  // Step 1: Determine sign
  const sign = num < 0 ? 1 : 0
  const absNum = Math.abs(num)
  steps.push({
    title: 'Vorzeichen bestimmen',
    desc: `${num} ist ${num >= 0 ? 'positiv' : 'negativ'}`,
    detail: `Vorzeichenbit S = ${sign}`,
    highlight: 'sign'
  })

  // Handle special case: zero
  if (absNum === 0) {
    steps.push({
      title: 'Spezialfall: Null',
      desc: 'Die Zahl 0 wird speziell dargestellt',
      detail: 'E = 0, M = 0 (alle Bits 0)',
      highlight: 'special'
    })
    return {
      sign: sign,
      exponent: '00000000',
      mantissa: '00000000000000000000000',
      decimal: num,
      hex: sign === 0 ? '0x00000000' : '0x80000000',
      steps,
      special: 'zero'
    }
  }

  // Handle infinity
  if (!isFinite(absNum)) {
    steps.push({
      title: 'Spezialfall: Unendlich',
      desc: 'Unendlich wird mit E=255, M=0 dargestellt',
      detail: `${num > 0 ? '+' : '-'}Infinity`,
      highlight: 'special'
    })
    return {
      sign: sign,
      exponent: '11111111',
      mantissa: '00000000000000000000000',
      decimal: num,
      hex: sign === 0 ? '0x7F800000' : '0xFF800000',
      steps,
      special: 'infinity'
    }
  }

  // Step 2: Convert integer part to binary
  const intPart = Math.floor(absNum)
  const fracPart = absNum - intPart
  const intBinary = intPart === 0 ? '0' : intPart.toString(2)

  steps.push({
    title: 'Ganzzahl-Teil in Binaer',
    desc: `Ganzzahl-Teil: ${intPart}`,
    detail: `${intPart}₁₀ = ${intBinary}₂`,
    highlight: 'integer'
  })

  // Step 3: Convert fractional part to binary (24 bits max for IEEE 754 single precision)
  let fracBinary = ''
  let frac = fracPart
  let fracSteps = []
  for (let i = 0; i < 24 && frac > 0; i++) {
    frac *= 2
    if (frac >= 1) {
      fracBinary += '1'
      fracSteps.push(`${frac.toFixed(6)} >= 1 → 1`)
      frac -= 1
    } else {
      fracBinary += '0'
      fracSteps.push(`${frac.toFixed(6)} < 1 → 0`)
    }
  }

  if (fracPart > 0) {
    // Use original input string if available, otherwise clean the float
    const fracDisplay = inputFracStr || cleanFloat(fracPart).split('.')[1] || '0'
    // Truncate binary display for readability
    const fracBinaryDisplay = fracBinary.length > 12 ? fracBinary.slice(0, 12) + '...' : fracBinary
    steps.push({
      title: 'Nachkomma-Teil in Binaer',
      desc: `Nachkomma-Teil: 0.${fracDisplay}`,
      detail: `0.${fracDisplay}₁₀ = 0.${fracBinaryDisplay}₂`,
      subSteps: fracSteps.slice(0, 5),
      highlight: 'fraction'
    })
  }

  // Full binary representation (truncated for display)
  const fracBinaryTrunc = fracBinary.length > 10 ? fracBinary.slice(0, 10) + '...' : fracBinary
  const fullBinaryDisplay = intPart === 0
    ? '0.' + fracBinaryTrunc
    : intBinary + '.' + (fracBinaryTrunc || '0')

  steps.push({
    title: 'Komplette Binaerdarstellung',
    desc: `|${inputStr}| in Binaer`,
    detail: `${fullBinaryDisplay}₂`,
    highlight: 'full'
  })

  // Step 4: Normalize to 1.xxxx * 2^e
  let normalizedMantissa = ''
  let exponent = 0

  if (intPart > 0) {
    // Number >= 1: shift right
    exponent = intBinary.length - 1
    normalizedMantissa = intBinary.slice(1) + fracBinary
  } else {
    // Number < 1: find first 1 in fraction
    const firstOne = fracBinary.indexOf('1')
    if (firstOne === -1) {
      exponent = -126 // denormalized
      normalizedMantissa = fracBinary
    } else {
      exponent = -(firstOne + 1)
      normalizedMantissa = fracBinary.slice(firstOne + 1)
    }
  }

  steps.push({
    title: 'Normalisieren',
    desc: 'In Form 1.M × 2^e bringen',
    detail: `1.${normalizedMantissa.slice(0, 10)}... × 2^${exponent}`,
    highlight: 'normalize'
  })

  // Step 5: Calculate biased exponent
  const biasedExponent = exponent + BIAS

  // Check for overflow/underflow
  if (biasedExponent >= 255) {
    steps.push({
      title: 'Exponent-Ueberlauf',
      desc: `Exponent ${exponent} + Bias ${BIAS} = ${biasedExponent} >= 255`,
      detail: 'Ergebnis: Unendlich',
      highlight: 'overflow'
    })
    return {
      sign: sign,
      exponent: '11111111',
      mantissa: '00000000000000000000000',
      decimal: sign === 0 ? Infinity : -Infinity,
      hex: sign === 0 ? '0x7F800000' : '0xFF800000',
      steps,
      special: 'infinity'
    }
  }

  if (biasedExponent <= 0) {
    // Denormalized number
    steps.push({
      title: 'Denormalisierte Zahl',
      desc: `Exponent ${exponent} + Bias ${BIAS} = ${biasedExponent} <= 0`,
      detail: 'Spezielle Darstellung mit E = 0',
      highlight: 'denorm'
    })
    // For simplicity, handle as zero for very small numbers
    const expBinary = '00000000'
    const mantBinary = normalizedMantissa.padEnd(MANTISSA_BITS, '0').slice(0, MANTISSA_BITS)
    return {
      sign: sign,
      exponent: expBinary,
      mantissa: mantBinary,
      decimal: num,
      hex: bitsToHex(sign, expBinary, mantBinary),
      steps,
      special: 'denormalized'
    }
  }

  const expBinary = biasedExponent.toString(2).padStart(EXPONENT_BITS, '0')

  steps.push({
    title: 'Biased Exponent berechnen',
    desc: `E = e + Bias = ${exponent} + ${BIAS}`,
    detail: `E = ${biasedExponent}₁₀ = ${expBinary}₂`,
    highlight: 'exponent'
  })

  // Step 6: Extract mantissa (drop hidden bit)
  const mantBinary = normalizedMantissa.padEnd(MANTISSA_BITS, '0').slice(0, MANTISSA_BITS)

  steps.push({
    title: 'Mantisse extrahieren',
    desc: 'Hidden Bit (1.) wird nicht gespeichert',
    detail: `M = ${mantBinary.slice(0, 8)}...`,
    highlight: 'mantissa'
  })

  // Step 7: Assemble final representation
  const fullBits = sign.toString() + expBinary + mantBinary
  const hex = bitsToHex(sign, expBinary, mantBinary)

  steps.push({
    title: 'Zusammensetzen',
    desc: 'S | E | M zusammenfuegen',
    detail: `${sign} | ${expBinary} | ${mantBinary.slice(0, 8)}...`,
    highlight: 'assemble'
  })

  return {
    sign: sign,
    exponent: expBinary,
    mantissa: mantBinary,
    decimal: num,
    hex: hex,
    steps,
    biasedExp: biasedExponent,
    realExp: exponent
  }
}

function bitsToHex(sign, exp, mant) {
  const bits = sign.toString() + exp + mant
  const val = parseInt(bits, 2) >>> 0
  return '0x' + val.toString(16).toUpperCase().padStart(8, '0')
}

export default function FloatVisualizer() {
  const [input, setInput] = useState('13.75')
  const [result, setResult] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    convert()
  }, [input])

  const convert = () => {
    if (!input.trim()) {
      setResult(null)
      return
    }
    setResult(decimalToIEEE754(input))
    setStepIndex(0)
  }

  const steps = result?.steps || []
  const currentStep = steps[stepIndex]

  const handleInputChange = (val) => {
    setInput(val)
  }

  const getHighlightClass = (type) => {
    if (!currentStep) return ''
    if (currentStep.highlight === type) return 'ring-2 ring-accent'
    return ''
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h1 className="text-lg font-medium">IEEE 754 Float</h1>
          <p className="text-sm text-text-muted font-mono">Single Precision (32 Bit)</p>
        </div>
      </header>

      {/* Controls */}
      <div className="flex items-center gap-6 p-4 border-b border-border bg-surface-secondary">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-2xs text-text-muted uppercase tracking-wider">Dezimalzahl</label>
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="13.75"
            className="flex-1 max-w-xs bg-surface border border-border rounded px-3 py-1.5 font-mono text-sm focus:border-accent outline-none"
          />
        </div>

        <div className="flex-1" />

        {/* Step Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStepIndex(0)}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-tertiary rounded transition-colors"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setStepIndex(prev => Math.max(0, prev - 1))}
            disabled={stepIndex <= 0}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-tertiary rounded transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 font-mono text-sm text-text-muted">
            {steps.length > 0 ? `${stepIndex + 1} / ${steps.length}` : '- / -'}
          </span>
          <button
            onClick={() => setStepIndex(prev => Math.min(prev + 1, steps.length - 1))}
            disabled={stepIndex >= steps.length - 1}
            className="p-2 bg-accent text-white rounded transition-colors disabled:opacity-30 hover:bg-accent-hover"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
        {/* Left: Bit Visualization */}
        <div className="flex flex-col p-6 border-r border-border overflow-auto">
          {result?.error ? (
            <div className="text-negative">{result.error}</div>
          ) : result ? (
            <>
              {/* Current Step Info */}
              {currentStep && (
                <div className="mb-6">
                  <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">Schritt</div>
                  <div className="text-xl font-medium text-accent">{currentStep.title}</div>
                  <div className="text-sm text-text-secondary mt-2">{currentStep.desc}</div>
                  <div className="text-sm font-mono text-text-primary mt-1">{currentStep.detail}</div>
                </div>
              )}

              {/* Bit Layout Visualization */}
              <div className="mb-6">
                <div className="text-2xs text-text-muted uppercase tracking-wider mb-3">
                  32-Bit Darstellung
                </div>

                {/* Bit labels */}
                <div className="flex font-mono text-2xs text-text-muted mb-1">
                  <div className="w-8 text-center">1</div>
                  <div className="w-24 text-center">8</div>
                  <div className="flex-1 text-center">23</div>
                </div>

                {/* Bit boxes */}
                <div className="flex gap-1">
                  {/* Sign */}
                  <div className={`w-8 h-12 flex items-center justify-center rounded bg-accent/20 border border-accent font-mono text-lg ${getHighlightClass('sign')}`}>
                    {result.sign}
                  </div>

                  {/* Exponent */}
                  <div className={`w-24 h-12 flex items-center justify-center rounded bg-blue-500/20 border border-blue-500 font-mono text-sm ${getHighlightClass('exponent')}`}>
                    {result.exponent}
                  </div>

                  {/* Mantissa */}
                  <div className={`flex-1 h-12 flex items-center justify-center rounded bg-positive/20 border border-positive font-mono text-xs overflow-hidden px-2 ${getHighlightClass('mantissa')}`}>
                    {result.mantissa}
                  </div>
                </div>

                {/* Labels */}
                <div className="flex font-mono text-2xs mt-1">
                  <div className="w-8 text-center text-accent">V</div>
                  <div className="w-24 text-center text-blue-400">Exponent</div>
                  <div className="flex-1 text-center text-positive">Mantisse</div>
                </div>
              </div>

              {/* Values */}
              <div className="space-y-4">
                <div>
                  <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">Dezimalwert</div>
                  <div className="font-mono text-2xl">
                    {typeof result.decimal === 'number' && isFinite(result.decimal)
                      ? cleanFloat(result.decimal)
                      : String(result.decimal)}
                  </div>
                </div>

                <div>
                  <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">Hexadezimal</div>
                  <div className="font-mono text-xl text-text-secondary">{result.hex}</div>
                </div>

                {result.realExp !== undefined && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">Biased Exp (E)</div>
                      <div className="font-mono text-lg text-blue-400">{result.biasedExp}</div>
                    </div>
                    <div>
                      <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">Real Exp (e)</div>
                      <div className="font-mono text-lg text-blue-400">{result.realExp}</div>
                    </div>
                  </div>
                )}

                {result.special && (
                  <div className="mt-4 p-3 bg-surface-tertiary rounded border border-border">
                    <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">Spezialfall</div>
                    <div className="font-medium text-accent">
                      {result.special === 'zero' && 'Null (Zero)'}
                      {result.special === 'infinity' && 'Unendlich (Infinity)'}
                      {result.special === 'nan' && 'Keine Zahl (NaN)'}
                      {result.special === 'denormalized' && 'Denormalisiert'}
                    </div>
                  </div>
                )}
              </div>

              {/* Formula */}
              <div className="mt-auto pt-6 border-t border-border">
                <div className="text-2xs text-text-muted uppercase tracking-wider mb-2">Formel</div>
                <div className="font-mono text-sm text-text-secondary">
                  (-1)<sup>V</sup> × 1.M × 2<sup>E-127</sup>
                </div>
              </div>
            </>
          ) : (
            <div className="text-text-muted">Gib eine Zahl ein...</div>
          )}
        </div>

        {/* Right: Steps Log */}
        <div className="flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-2xs text-text-muted uppercase tracking-wider">Umwandlungsschritte</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-secondary">
                <tr className="text-2xs text-text-muted uppercase tracking-wider">
                  <th className="text-left px-4 py-2 w-8">#</th>
                  <th className="text-left px-4 py-2">Schritt</th>
                  <th className="text-left px-4 py-2">Detail</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-border-subtle cursor-pointer transition-colors ${
                      idx === stepIndex ? 'bg-accent-muted' : 'hover:bg-surface-tertiary'
                    }`}
                    onClick={() => setStepIndex(idx)}
                  >
                    <td className={`px-4 py-3 ${idx === stepIndex ? 'text-accent' : 'text-text-muted'}`}>
                      {idx + 1}
                    </td>
                    <td className={`px-4 py-3 ${idx === stepIndex ? 'text-accent' : 'text-text-secondary'}`}>
                      {step.title}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-muted truncate max-w-[200px]" title={step.detail}>
                      {step.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
