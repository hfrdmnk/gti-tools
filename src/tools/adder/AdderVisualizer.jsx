import { useState, useEffect } from 'react'
import { RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react'
import {
  ADDER_TYPES,
  DEFAULT_VALUES,
  generateSteps,
  toBinaryString,
  toBits
} from './utils'

export default function AdderVisualizer() {
  const [adderType, setAdderType] = useState('ripple')
  const [inputA, setInputA] = useState(DEFAULT_VALUES.ripple.a)
  const [inputB, setInputB] = useState(DEFAULT_VALUES.ripple.b)
  const [inputC, setInputC] = useState(DEFAULT_VALUES.wallace?.c || 5)
  const [steps, setSteps] = useState([])
  const [stepIndex, setStepIndex] = useState(0)

  // Update defaults when adder type changes
  useEffect(() => {
    const defaults = DEFAULT_VALUES[adderType]
    setInputA(defaults.a)
    setInputB(defaults.b)
    if (defaults.c !== undefined) {
      setInputC(defaults.c)
    }
  }, [adderType])

  // Generate steps when inputs change
  useEffect(() => {
    const newSteps = generateSteps(adderType, inputA, inputB, inputC, 0)
    setSteps(newSteps)
    setStepIndex(0)
  }, [adderType, inputA, inputB, inputC])

  const currentStep = steps[stepIndex]
  const currentAdder = ADDER_TYPES.find(t => t.id === adderType)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h1 className="text-lg font-medium">Addierer</h1>
          <p className="text-sm text-text-muted font-mono">
            {currentAdder?.desc}
          </p>
        </div>

        {/* Addierer-Typ Auswahl */}
        <div className="flex items-center gap-2">
          <span className="text-2xs text-text-muted uppercase tracking-wider">Typ</span>
          <select
            value={adderType}
            onChange={(e) => setAdderType(e.target.value)}
            className="bg-surface border border-border rounded px-3 py-1.5 text-sm focus:border-accent outline-none"
          >
            {ADDER_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Steuerung */}
      <div className="flex items-center gap-6 p-4 border-b border-border bg-surface-secondary">
        {/* Eingaben */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-2xs text-text-muted uppercase tracking-wider">A</label>
            <input
              type="number"
              value={inputA}
              onChange={(e) => setInputA(Math.max(0, Math.min(15, parseInt(e.target.value) || 0)))}
              min={0}
              max={15}
              className="w-16 bg-surface border border-border rounded px-3 py-1.5 font-mono text-sm focus:border-accent outline-none"
            />
            <span className="text-xs text-text-muted font-mono">{toBinaryString(inputA)}</span>
          </div>

          <span className="text-text-muted">+</span>

          <div className="flex items-center gap-2">
            <label className="text-2xs text-text-muted uppercase tracking-wider">B</label>
            <input
              type="number"
              value={inputB}
              onChange={(e) => setInputB(Math.max(0, Math.min(15, parseInt(e.target.value) || 0)))}
              min={0}
              max={15}
              className="w-16 bg-surface border border-border rounded px-3 py-1.5 font-mono text-sm focus:border-accent outline-none"
            />
            <span className="text-xs text-text-muted font-mono">{toBinaryString(inputB)}</span>
          </div>

          {adderType === 'wallace' && (
            <>
              <span className="text-text-muted">+</span>
              <div className="flex items-center gap-2">
                <label className="text-2xs text-text-muted uppercase tracking-wider">C</label>
                <input
                  type="number"
                  value={inputC}
                  onChange={(e) => setInputC(Math.max(0, Math.min(15, parseInt(e.target.value) || 0)))}
                  min={0}
                  max={15}
                  className="w-16 bg-surface border border-border rounded px-3 py-1.5 font-mono text-sm focus:border-accent outline-none"
                />
                <span className="text-xs text-text-muted font-mono">{toBinaryString(inputC)}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />

        {/* Schritt-Steuerung */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStepIndex(0)}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-tertiary rounded transition-colors"
            title="Zurücksetzen"
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
            {steps.length > 0 ? stepIndex + 1 : '-'} / {steps.length || '-'}
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

      {/* Hauptinhalt */}
      <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
        {/* Links: SVG Diagramm */}
        <div className="flex flex-col p-6 border-r border-border overflow-auto">
          <div className="text-2xs text-text-muted uppercase tracking-wider mb-4">
            Schaltung
          </div>
          <div className="flex-1 flex items-center justify-center">
            {adderType === 'ripple' && (
              <RippleCarryDiagram
                a={inputA}
                b={inputB}
                step={currentStep}
              />
            )}
            {adderType === 'bypass' && (
              <CarryBypassDiagram
                a={inputA}
                b={inputB}
                step={currentStep}
              />
            )}
            {adderType === 'select' && (
              <CarrySelectDiagram
                a={inputA}
                b={inputB}
                step={currentStep}
              />
            )}
            {adderType === 'prefix' && (
              <ParallelPrefixDiagram
                a={inputA}
                b={inputB}
                step={currentStep}
              />
            )}
            {adderType === 'wallace' && (
              <WallaceTreeDiagram
                a={inputA}
                b={inputB}
                c={inputC}
                step={currentStep}
              />
            )}
          </div>
        </div>

        {/* Rechts: Schritt-Erklärung */}
        <div className="flex flex-col overflow-hidden">
          {/* Aktueller Schritt */}
          <div className="p-6 border-b border-border">
            {currentStep && (
              <>
                <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">
                  Aktueller Schritt
                </div>
                <div className={`text-xl font-medium ${currentStep.isFinal ? 'text-positive' : 'text-accent'}`}>
                  {currentStep.title}
                </div>
                <div className="text-sm text-text-secondary mt-2">
                  {currentStep.desc}
                </div>
                {currentStep.detail && (
                  <div className="text-sm text-text-muted font-mono mt-2 p-2 bg-surface-secondary rounded">
                    {currentStep.detail}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Schritte-Liste */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="text-2xs text-text-muted uppercase tracking-wider mb-2">
                Alle Schritte
              </div>
              <div className="space-y-1">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      idx === stepIndex
                        ? 'bg-accent-muted border border-accent'
                        : 'hover:bg-surface-tertiary'
                    }`}
                    onClick={() => setStepIndex(idx)}
                  >
                    <div className={`text-sm font-medium ${
                      idx === stepIndex ? 'text-accent' : step.isFinal ? 'text-positive' : 'text-text-secondary'
                    }`}>
                      {idx + 1}. {step.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ergebnis-Box */}
          {currentStep?.isFinal && (
            <div className="p-4 border-t border-border">
              <div className="p-4 rounded bg-positive/10 border border-positive">
                <div className="text-sm font-medium text-positive">
                  Ergebnis: {currentStep.result}
                </div>
                <div className="text-xs text-text-secondary mt-1 font-mono">
                  {adderType === 'wallace'
                    ? `${inputA} + ${inputB} + ${inputC} = ${currentStep.result}`
                    : `${inputA} + ${inputB} = ${currentStep.result}`
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// SVG DIAGRAM COMPONENTS
// ============================================

// Reusable box component
function AdderBox({ x, y, label, isActive, isFinal, width = 60, height = 40 }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        className={`transition-colors ${
          isFinal
            ? 'fill-positive/20 stroke-positive'
            : isActive
              ? 'fill-accent/20 stroke-accent'
              : 'fill-surface-secondary stroke-border'
        }`}
        strokeWidth={isActive || isFinal ? 2 : 1}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className={`text-sm font-mono ${
          isFinal ? 'fill-positive' : isActive ? 'fill-accent' : 'fill-text-secondary'
        }`}
      >
        {label}
      </text>
    </g>
  )
}

// Reusable wire/connection
function Wire({ points, isActive, isFinal }) {
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  return (
    <path
      d={pathData}
      fill="none"
      className={`transition-colors ${
        isFinal
          ? 'stroke-positive'
          : isActive
            ? 'stroke-accent'
            : 'stroke-text-muted'
      }`}
      strokeWidth={isActive || isFinal ? 2 : 1}
    />
  )
}

// ============================================
// RIPPLE CARRY DIAGRAM
// ============================================
function RippleCarryDiagram({ a, b, step }) {
  const aBits = toBits(a, 4)
  const bBits = toBits(b, 4)
  const activeComponents = step?.activeComponents || []
  const values = step?.values || {}
  const carries = values.carries || [0]
  const sums = values.sums || []
  const computed = values.computed || []
  const isFinal = step?.isFinal

  // Layout: 4 adders from right to left
  const boxWidth = 60
  const boxHeight = 40
  const gap = 30
  const startX = 70
  const startY = 80

  return (
    <svg viewBox="0 0 500 220" className="w-full max-w-lg">
      {/* Input labels */}
      {[0, 1, 2, 3].map(i => {
        const x = startX + (3 - i) * (boxWidth + gap) + boxWidth / 2
        return (
          <g key={`input-${i}`}>
            {/* a_i and b_i labels */}
            <text x={x - 10} y={20} textAnchor="middle" className="text-xs fill-text-muted font-mono">
              a{i}
            </text>
            <text x={x + 10} y={20} textAnchor="middle" className="text-xs fill-text-muted font-mono">
              b{i}
            </text>
            {/* bit values */}
            <text x={x - 10} y={38} textAnchor="middle" className="text-sm fill-text-secondary font-mono">
              {aBits[3 - i]}
            </text>
            <text x={x + 10} y={38} textAnchor="middle" className="text-sm fill-text-secondary font-mono">
              {bBits[3 - i]}
            </text>
            {/* Input lines */}
            <line x1={x - 10} y1={45} x2={x - 10} y2={startY} className="stroke-text-muted" strokeWidth={1} />
            <line x1={x + 10} y1={45} x2={x + 10} y2={startY} className="stroke-text-muted" strokeWidth={1} />
          </g>
        )
      })}

      {/* Adder boxes */}
      {[0, 1, 2, 3].map(i => {
        const x = startX + (3 - i) * (boxWidth + gap)
        const isActive = activeComponents.includes(`adder-${i}`)
        const isComputed = computed.includes(i)
        const label = i === 0 ? 'HA' : 'VA'

        return (
          <g key={`adder-${i}`}>
            <AdderBox
              x={x}
              y={startY}
              label={label}
              isActive={isActive}
              isFinal={isFinal && isComputed}
              width={boxWidth}
              height={boxHeight}
            />
          </g>
        )
      })}

      {/* Carry connections between adders */}
      {[0, 1, 2].map(i => {
        // Current adder position
        const currentAdderX = startX + (3 - i) * (boxWidth + gap)
        // Next adder position (to the left)
        const nextAdderX = startX + (3 - (i + 1)) * (boxWidth + gap)
        const y = startY + boxHeight / 2
        const isActive = computed.includes(i)

        return (
          <g key={`carry-${i}`}>
            {/* Carry line: from left edge of current to right edge of next */}
            <line
              x1={currentAdderX}
              y1={y}
              x2={nextAdderX + boxWidth}
              y2={y}
              className={`${isActive || isFinal ? 'stroke-accent' : 'stroke-text-muted'}`}
              strokeWidth={isActive || isFinal ? 2 : 1}
            />
            {/* Carry value label */}
            {carries[i + 1] !== undefined && isActive && (
              <text
                x={(currentAdderX + nextAdderX + boxWidth) / 2}
                y={y - 8}
                textAnchor="middle"
                className="text-xs fill-accent font-mono"
              >
                c{i + 1}={carries[i + 1]}
              </text>
            )}
          </g>
        )
      })}

      {/* Input carry c0 */}
      <g>
        <line
          x1={startX + 3 * (boxWidth + gap) + boxWidth + 20}
          y1={startY + boxHeight / 2}
          x2={startX + 3 * (boxWidth + gap) + boxWidth}
          y2={startY + boxHeight / 2}
          className="stroke-text-muted"
          strokeWidth={1}
        />
        <text
          x={startX + 3 * (boxWidth + gap) + boxWidth + 30}
          y={startY + boxHeight / 2 + 4}
          textAnchor="start"
          className="text-xs fill-text-muted font-mono"
        >
          c₀=0
        </text>
      </g>

      {/* Output carry c4 */}
      <g>
        <line
          x1={startX - 20}
          y1={startY + boxHeight / 2}
          x2={startX}
          y2={startY + boxHeight / 2}
          className={`${isFinal ? 'stroke-positive' : 'stroke-text-muted'}`}
          strokeWidth={isFinal ? 2 : 1}
        />
        <text
          x={startX - 30}
          y={startY + boxHeight / 2 + 4}
          textAnchor="end"
          className={`text-xs font-mono ${isFinal ? 'fill-positive' : 'fill-text-muted'}`}
        >
          c₄={carries[4] ?? '?'}
        </text>
      </g>

      {/* Sum outputs */}
      {[0, 1, 2, 3].map(i => {
        const x = startX + (3 - i) * (boxWidth + gap) + boxWidth / 2
        const y = startY + boxHeight
        const isComputed = computed.includes(i)

        return (
          <g key={`sum-${i}`}>
            <line
              x1={x}
              y1={y}
              x2={x}
              y2={y + 30}
              className={`${isComputed || isFinal ? 'stroke-accent' : 'stroke-text-muted'}`}
              strokeWidth={isComputed || isFinal ? 2 : 1}
            />
            <text
              x={x}
              y={y + 45}
              textAnchor="middle"
              className={`text-xs font-mono ${isComputed || isFinal ? 'fill-accent' : 'fill-text-muted'}`}
            >
              s{i}={sums[i] ?? '?'}
            </text>
          </g>
        )
      })}

      {/* Legend */}
      <text x={10} y={200} className="text-2xs fill-text-muted">
        HA = Halbaddierer, VA = Volladdierer
      </text>
    </svg>
  )
}

// ============================================
// CARRY BYPASS DIAGRAM
// ============================================
function CarryBypassDiagram({ a, b, step }) {
  const aBits = toBits(a, 4)
  const bBits = toBits(b, 4)
  const activeComponents = step?.activeComponents || []
  const values = step?.values || {}
  const propagate = values.propagate || []
  const bypassActive = values.bypassActive
  const carries = values.carries || [0]
  const sums = values.sums || []
  const computed = values.computed || []
  const isFinal = step?.isFinal

  const boxWidth = 50
  const boxHeight = 35
  const gap = 25
  const startX = 80
  const startY = 100

  return (
    <svg viewBox="0 0 540 280" className="w-full max-w-xl">
      {/* Propagate calculation block */}
      <g>
        <rect
          x={startX}
          y={20}
          width={280}
          height={35}
          rx={4}
          className={`transition-colors ${
            activeComponents.includes('p-calc')
              ? 'fill-accent/20 stroke-accent'
              : 'fill-surface-secondary stroke-border'
          }`}
          strokeWidth={activeComponents.includes('p-calc') ? 2 : 1}
        />
        <text x={startX + 140} y={42} textAnchor="middle" className="text-sm fill-text-secondary font-mono">
          Propagate: P = A ⊕ B
        </text>
      </g>

      {/* P values display */}
      {propagate.length > 0 && (
        <text x={startX + 140} y={70} textAnchor="middle" className="text-xs fill-accent font-mono">
          P = [{propagate.join(', ')}]
        </text>
      )}

      {/* Bypass path indicator */}
      {bypassActive !== undefined && (
        <g>
          <rect
            x={startX + 300}
            y={startY - 10}
            width={80}
            height={60}
            rx={4}
            className={`transition-colors ${
              bypassActive
                ? 'fill-positive/20 stroke-positive'
                : 'fill-surface-secondary stroke-border'
            }`}
            strokeWidth={bypassActive ? 2 : 1}
          />
          <text
            x={startX + 340}
            y={startY + 20}
            textAnchor="middle"
            className={`text-xs font-mono ${bypassActive ? 'fill-positive' : 'fill-text-muted'}`}
          >
            Bypass
          </text>
          <text
            x={startX + 340}
            y={startY + 35}
            textAnchor="middle"
            className={`text-xs font-mono ${bypassActive ? 'fill-positive' : 'fill-text-muted'}`}
          >
            {bypassActive ? 'AKTIV' : 'inaktiv'}
          </text>
        </g>
      )}

      {/* Input labels and values */}
      {[0, 1, 2, 3].map(i => {
        const x = startX + (3 - i) * (boxWidth + gap) + boxWidth / 2
        return (
          <g key={`input-${i}`}>
            <text x={x} y={90} textAnchor="middle" className="text-xs fill-text-muted font-mono">
              a{i}={aBits[3 - i]} b{i}={bBits[3 - i]}
            </text>
          </g>
        )
      })}

      {/* Adder boxes */}
      {[0, 1, 2, 3].map(i => {
        const x = startX + (3 - i) * (boxWidth + gap)
        const isActive = activeComponents.includes(`adder-${i}`)
        const isComputed = computed.includes(i)

        return (
          <AdderBox
            key={`adder-${i}`}
            x={x}
            y={startY}
            label="VA"
            isActive={isActive}
            isFinal={isFinal && isComputed}
            width={boxWidth}
            height={boxHeight}
          />
        )
      })}

      {/* Carry connections between adders */}
      {[0, 1, 2].map(i => {
        // Connect adder i to adder i+1 (to the left)
        const adderX = startX + (3 - i) * (boxWidth + gap)
        const nextAdderX = startX + (3 - (i + 1)) * (boxWidth + gap)
        const y = startY + boxHeight / 2
        const isActive = computed.includes(i)

        return (
          <g key={`carry-${i}`}>
            <line
              x1={adderX}
              y1={y}
              x2={nextAdderX + boxWidth}
              y2={y}
              className={`${isActive || isFinal ? 'stroke-accent' : 'stroke-text-muted'}`}
              strokeWidth={isActive || isFinal ? 2 : 1}
            />
            {carries[i + 1] !== undefined && isActive && (
              <text
                x={(adderX + nextAdderX + boxWidth) / 2}
                y={y - 8}
                textAnchor="middle"
                className="text-xs fill-accent font-mono"
              >
                c{i + 1}={carries[i + 1]}
              </text>
            )}
          </g>
        )
      })}

      {/* Input carry c0 */}
      <g>
        <line
          x1={startX + 3 * (boxWidth + gap) + boxWidth + 15}
          y1={startY + boxHeight / 2}
          x2={startX + 3 * (boxWidth + gap) + boxWidth}
          y2={startY + boxHeight / 2}
          className="stroke-text-muted"
          strokeWidth={1}
        />
        <text
          x={startX + 3 * (boxWidth + gap) + boxWidth + 25}
          y={startY + boxHeight / 2 + 4}
          textAnchor="start"
          className="text-xs fill-text-muted font-mono"
        >
          c₀=0
        </text>
      </g>

      {/* Output carry c4 */}
      <g>
        <line
          x1={startX - 15}
          y1={startY + boxHeight / 2}
          x2={startX}
          y2={startY + boxHeight / 2}
          className={`${isFinal ? 'stroke-positive' : 'stroke-text-muted'}`}
          strokeWidth={isFinal ? 2 : 1}
        />
        <text
          x={startX - 25}
          y={startY + boxHeight / 2 + 4}
          textAnchor="end"
          className={`text-xs font-mono ${isFinal ? 'fill-positive' : 'fill-text-muted'}`}
        >
          c₄={carries[4] ?? '?'}
        </text>
      </g>

      {/* Sum outputs */}
      {[0, 1, 2, 3].map(i => {
        const x = startX + (3 - i) * (boxWidth + gap) + boxWidth / 2
        const y = startY + boxHeight
        const isComputed = computed.includes(i)

        return (
          <g key={`sum-${i}`}>
            <line
              x1={x}
              y1={y}
              x2={x}
              y2={y + 25}
              className={`${isComputed || isFinal ? 'stroke-accent' : 'stroke-text-muted'}`}
              strokeWidth={isComputed || isFinal ? 2 : 1}
            />
            <text
              x={x}
              y={y + 40}
              textAnchor="middle"
              className={`text-xs font-mono ${isComputed || isFinal ? 'fill-accent' : 'fill-text-muted'}`}
            >
              s{i}={sums[i] ?? '?'}
            </text>
          </g>
        )
      })}

      {/* Legend */}
      <text x={10} y={260} className="text-2xs fill-text-muted">
        Bypass aktiv wenn alle P=1: c₄ = c₀
      </text>
    </svg>
  )
}

// ============================================
// CARRY SELECT DIAGRAM
// ============================================
function CarrySelectDiagram({ a, b, step }) {
  const activeComponents = step?.activeComponents || []
  const values = step?.values || {}
  const phase = values.phase || 'intro'
  const selected = values.selected
  const isFinal = step?.isFinal

  const boxWidth = 120
  const boxHeight = 50

  return (
    <svg viewBox="0 0 400 300" className="w-full max-w-md">
      {/* Input labels */}
      <text x={200} y={25} textAnchor="middle" className="text-sm fill-text-secondary font-mono">
        A = {a} ({toBinaryString(a)}), B = {b} ({toBinaryString(b)})
      </text>

      {/* Adder block with cin=0 */}
      <g>
        <rect
          x={40}
          y={50}
          width={boxWidth}
          height={boxHeight}
          rx={4}
          className={`transition-colors ${
            activeComponents.includes('adder-block-0') || (isFinal && selected === 0)
              ? selected === 0
                ? 'fill-positive/20 stroke-positive'
                : 'fill-accent/20 stroke-accent'
              : 'fill-surface-secondary stroke-border'
          }`}
          strokeWidth={activeComponents.includes('adder-block-0') ? 2 : 1}
        />
        <text x={100} y={70} textAnchor="middle" className="text-sm fill-text-secondary font-mono">
          Addiernetz
        </text>
        <text x={100} y={88} textAnchor="middle" className="text-xs fill-text-muted font-mono">
          c_in = 0
        </text>
        {values.sums0 && (
          <text x={100} y={115} textAnchor="middle" className="text-xs fill-accent font-mono">
            S={toBinaryString(values.result0?.result || 0)}, c={values.cout0}
          </text>
        )}
      </g>

      {/* Adder block with cin=1 */}
      <g>
        <rect
          x={240}
          y={50}
          width={boxWidth}
          height={boxHeight}
          rx={4}
          className={`transition-colors ${
            activeComponents.includes('adder-block-1') || (isFinal && selected === 1)
              ? selected === 1
                ? 'fill-positive/20 stroke-positive'
                : 'fill-accent/20 stroke-accent'
              : 'fill-surface-secondary stroke-border'
          }`}
          strokeWidth={activeComponents.includes('adder-block-1') ? 2 : 1}
        />
        <text x={300} y={70} textAnchor="middle" className="text-sm fill-text-secondary font-mono">
          Addiernetz
        </text>
        <text x={300} y={88} textAnchor="middle" className="text-xs fill-text-muted font-mono">
          c_in = 1
        </text>
        {values.sums1 && (
          <text x={300} y={115} textAnchor="middle" className="text-xs fill-accent font-mono">
            S={toBinaryString(values.result1?.result || 0)}, c={values.cout1}
          </text>
        )}
      </g>

      {/* Parallel indicator */}
      {(phase === 'compute0' || phase === 'compute1') && (
        <text x={200} y={145} textAnchor="middle" className="text-xs fill-accent">
          Parallele Berechnung
        </text>
      )}

      {/* Connection lines to MUX */}
      <line x1={100} y1={100} x2={100} y2={170} className="stroke-text-muted" strokeWidth={1} />
      <line x1={100} y1={170} x2={160} y2={190} className="stroke-text-muted" strokeWidth={1} />
      <line x1={300} y1={100} x2={300} y2={170} className="stroke-text-muted" strokeWidth={1} />
      <line x1={300} y1={170} x2={240} y2={190} className="stroke-text-muted" strokeWidth={1} />

      {/* MUX */}
      <g>
        <rect
          x={150}
          y={180}
          width={100}
          height={50}
          rx={4}
          className={`transition-colors ${
            activeComponents.includes('mux')
              ? isFinal
                ? 'fill-positive/20 stroke-positive'
                : 'fill-accent/20 stroke-accent'
              : 'fill-surface-secondary stroke-border'
          }`}
          strokeWidth={activeComponents.includes('mux') ? 2 : 1}
        />
        <text x={200} y={200} textAnchor="middle" className="text-sm fill-text-secondary font-mono">
          MUX
        </text>
        <text x={200} y={220} textAnchor="middle" className="text-xs fill-text-muted font-mono">
          sel = c_in
        </text>
      </g>

      {/* Select signal */}
      <g>
        <line x1={200} y1={250} x2={200} y2={230} className="stroke-text-muted" strokeWidth={1} />
        <text x={200} y={265} textAnchor="middle" className="text-xs fill-text-muted font-mono">
          c_in = 0
        </text>
      </g>

      {/* Output */}
      <g>
        <line
          x1={200}
          y1={180}
          x2={200}
          y2={150}
          className={`${isFinal ? 'stroke-positive' : 'stroke-text-muted'}`}
          strokeWidth={isFinal ? 2 : 1}
        />
        {isFinal && values.selectedResult && (
          <text x={200} y={145} textAnchor="middle" className="text-sm fill-positive font-mono">
            Ergebnis: {values.selectedResult.result}
          </text>
        )}
      </g>

      {/* Legend */}
      <text x={10} y={290} className="text-2xs fill-text-muted">
        MUX wählt basierend auf dem echten Carry
      </text>
    </svg>
  )
}

// ============================================
// PARALLEL PREFIX DIAGRAM
// ============================================
function ParallelPrefixDiagram({ a, b, step }) {
  const aBits = toBits(a, 4)
  const bBits = toBits(b, 4)
  const activeComponents = step?.activeComponents || []
  const values = step?.values || {}
  const phase = values.phase || 'intro'
  const generate = values.generate || []
  const propagate = values.propagate || []
  const carries = values.carries || []
  const sums = values.sums || []
  const isFinal = step?.isFinal

  const colWidth = 80
  const startX = 50

  return (
    <svg viewBox="0 0 420 340" className="w-full max-w-lg">
      {/* Input labels */}
      <text x={210} y={20} textAnchor="middle" className="text-xs fill-text-muted">
        A = {a} ({toBinaryString(a)}), B = {b} ({toBinaryString(b)})
      </text>

      {/* Level 0: Initial G/P computation */}
      <g>
        <text x={20} y={55} className="text-2xs fill-text-muted">L0</text>
        {[0, 1, 2, 3].map(i => {
          const x = startX + i * colWidth
          const isActive = activeComponents.includes('gp-initial') || phase === 'gp'
          return (
            <g key={`gp-${i}`}>
              <rect
                x={x}
                y={40}
                width={60}
                height={35}
                rx={4}
                className={`transition-colors ${
                  isActive
                    ? 'fill-accent/20 stroke-accent'
                    : 'fill-surface-secondary stroke-border'
                }`}
                strokeWidth={isActive ? 2 : 1}
              />
              <text x={x + 30} y={55} textAnchor="middle" className="text-xs fill-text-secondary font-mono">
                g{3 - i},p{3 - i}
              </text>
              {generate.length > 0 && (
                <text x={x + 30} y={70} textAnchor="middle" className="text-2xs fill-accent font-mono">
                  {generate[3 - i]},{propagate[3 - i]}
                </text>
              )}
            </g>
          )
        })}
      </g>

      {/* Level 1: First prefix combination */}
      <g>
        <text x={20} y={115} className="text-2xs fill-text-muted">L1</text>
        {/* Connection lines */}
        <line x1={startX + 30} y1={75} x2={startX + 30} y2={95} className="stroke-text-muted" strokeWidth={1} />
        <line x1={startX + colWidth + 30} y1={75} x2={startX + 30} y2={95} className="stroke-text-muted" strokeWidth={1} />
        <line x1={startX + 2 * colWidth + 30} y1={75} x2={startX + 2 * colWidth + 30} y2={95} className="stroke-text-muted" strokeWidth={1} />
        <line x1={startX + 3 * colWidth + 30} y1={75} x2={startX + 2 * colWidth + 30} y2={95} className="stroke-text-muted" strokeWidth={1} />

        {/* GP boxes for pairs */}
        {[0, 2].map(i => {
          const x = startX + i * colWidth
          const isActive = activeComponents.includes('prefix-level-1') || phase === 'prefix1'
          const label = i === 0 ? 'G3:2,P3:2' : 'G1:0,P1:0'
          return (
            <g key={`prefix1-${i}`}>
              <rect
                x={x}
                y={95}
                width={60}
                height={35}
                rx={4}
                className={`transition-colors ${
                  isActive
                    ? 'fill-accent/20 stroke-accent'
                    : 'fill-surface-secondary stroke-border'
                }`}
                strokeWidth={isActive ? 2 : 1}
              />
              <text x={x + 30} y={115} textAnchor="middle" className="text-2xs fill-text-secondary font-mono">
                {label}
              </text>
            </g>
          )
        })}
      </g>

      {/* Level 2: Final prefix */}
      <g>
        <text x={20} y={170} className="text-2xs fill-text-muted">L2</text>
        <line x1={startX + 30} y1={130} x2={startX + colWidth + 30} y2={150} className="stroke-text-muted" strokeWidth={1} />
        <line x1={startX + 2 * colWidth + 30} y1={130} x2={startX + colWidth + 30} y2={150} className="stroke-text-muted" strokeWidth={1} />

        <rect
          x={startX + colWidth}
          y={150}
          width={60}
          height={35}
          rx={4}
          className={`transition-colors ${
            activeComponents.includes('prefix-level-2') || phase === 'prefix2'
              ? 'fill-accent/20 stroke-accent'
              : 'fill-surface-secondary stroke-border'
          }`}
          strokeWidth={phase === 'prefix2' ? 2 : 1}
        />
        <text x={startX + colWidth + 30} y={170} textAnchor="middle" className="text-2xs fill-text-secondary font-mono">
          G3:0,P3:0
        </text>
      </g>

      {/* Carries computation */}
      <g>
        <text x={20} y={220} className="text-2xs fill-text-muted">C</text>
        {[0, 1, 2, 3, 4].map(i => {
          const x = startX + 30 + (4 - i) * (colWidth * 0.75)
          const isActive = activeComponents.includes('carry-calc') || phase === 'carries' || isFinal
          return (
            <text
              key={`carry-${i}`}
              x={x}
              y={220}
              textAnchor="middle"
              className={`text-xs font-mono ${isActive ? 'fill-accent' : 'fill-text-muted'}`}
            >
              c{i} = {carries[i] ?? '?'}
            </text>
          )
        })}
      </g>

      {/* Sum computation */}
      <g>
        <text x={20} y={265} className="text-2xs fill-text-muted">S</text>
        {[0, 1, 2, 3].map(i => {
          const x = startX + i * colWidth + 30
          const isActive = activeComponents.includes('sum-xor') || phase === 'sums' || isFinal
          return (
            <g key={`sum-${i}`}>
              <rect
                x={x - 20}
                y={240}
                width={40}
                height={30}
                rx={4}
                className={`transition-colors ${
                  isActive
                    ? isFinal
                      ? 'fill-positive/20 stroke-positive'
                      : 'fill-accent/20 stroke-accent'
                    : 'fill-surface-secondary stroke-border'
                }`}
                strokeWidth={isActive ? 2 : 1}
              />
              <text
                x={x}
                y={260}
                textAnchor="middle"
                className={`text-sm font-mono ${isFinal ? 'fill-positive' : isActive ? 'fill-accent' : 'fill-text-muted'}`}
              >
                s{3 - i}={sums[3 - i] ?? '?'}
              </text>
            </g>
          )
        })}
      </g>

      {/* Legend */}
      <text x={10} y={300} className="text-2xs fill-text-muted">
        G = Generate (a∧b), P = Propagate (a⊕b)
      </text>
      <text x={10} y={315} className="text-2xs fill-text-muted">
        Tiefe: O(log n) statt O(n)
      </text>
    </svg>
  )
}

// ============================================
// WALLACE TREE / CARRY SAVE DIAGRAM
// ============================================
function WallaceTreeDiagram({ a, b, c, step }) {
  const aBits = toBits(a, 4)
  const bBits = toBits(b, 4)
  const cBits = toBits(c, 4)
  const activeComponents = step?.activeComponents || []
  const values = step?.values || {}
  const phase = values.phase || 'intro'
  const isFinal = step?.isFinal

  const boxWidth = 50
  const boxHeight = 35
  const gap = 20
  const startX = 60
  const startY = 70

  return (
    <svg viewBox="0 0 400 320" className="w-full max-w-md">
      {/* Input labels */}
      <text x={200} y={20} textAnchor="middle" className="text-xs fill-text-muted">
        A={a} ({toBinaryString(a)}), B={b} ({toBinaryString(b)}), C={c} ({toBinaryString(c)})
      </text>

      {/* Input bits for each position */}
      {[0, 1, 2, 3].map(i => {
        const x = startX + (3 - i) * (boxWidth + gap) + boxWidth / 2
        return (
          <g key={`input-${i}`}>
            <text x={x} y={50} textAnchor="middle" className="text-xs fill-text-muted font-mono">
              {aBits[3 - i]},{bBits[3 - i]},{cBits[3 - i]}
            </text>
            <line x1={x} y1={55} x2={x} y2={startY} className="stroke-text-muted" strokeWidth={1} />
          </g>
        )
      })}

      {/* CSA boxes */}
      {[0, 1, 2, 3].map(i => {
        const x = startX + (3 - i) * (boxWidth + gap)
        const isActive = activeComponents.includes(`csa-${i}`) ||
          activeComponents.includes('csa-explain') ||
          phase === 'csa'
        return (
          <g key={`csa-${i}`}>
            <rect
              x={x}
              y={startY}
              width={boxWidth}
              height={boxHeight}
              rx={4}
              className={`transition-colors ${
                isActive
                  ? 'fill-accent/20 stroke-accent'
                  : 'fill-surface-secondary stroke-border'
              }`}
              strokeWidth={isActive ? 2 : 1}
            />
            <text
              x={x + boxWidth / 2}
              y={startY + boxHeight / 2 + 4}
              textAnchor="middle"
              className="text-sm fill-text-secondary font-mono"
            >
              CSA
            </text>
          </g>
        )
      })}

      {/* Output lines from CSA */}
      {[0, 1, 2, 3].map(i => {
        const x = startX + (3 - i) * (boxWidth + gap) + boxWidth / 2
        const y = startY + boxHeight
        return (
          <g key={`csa-out-${i}`}>
            {/* Sum output - straight down */}
            <line
              x1={x - 8}
              y1={y}
              x2={x - 8}
              y2={y + 25}
              className={`${phase === 'csa' || phase === 'intermediate' ? 'stroke-accent' : 'stroke-text-muted'}`}
              strokeWidth={phase === 'csa' ? 2 : 1}
            />
            {/* Carry output - diagonal to next position */}
            {i < 3 && (
              <line
                x1={x + 8}
                y1={y}
                x2={x + 8 - (boxWidth + gap)}
                y2={y + 25}
                className={`${phase === 'csa' || phase === 'intermediate' ? 'stroke-accent' : 'stroke-text-muted'}`}
                strokeWidth={phase === 'csa' ? 2 : 1}
                strokeDasharray="4,2"
              />
            )}
          </g>
        )
      })}

      {/* Intermediate results */}
      {(phase === 'csa' || phase === 'intermediate' || phase === 'final-add' || isFinal) && values.sumBits && (
        <g>
          <text x={startX - 30} y={145} className="text-xs fill-text-muted">
            S:
          </text>
          <text x={startX + 120} y={145} textAnchor="middle" className="text-sm fill-accent font-mono">
            {values.sumBits.join('')} = {values.sumNum}
          </text>

          <text x={startX - 30} y={165} className="text-xs fill-text-muted">
            CV:
          </text>
          <text x={startX + 120} y={165} textAnchor="middle" className="text-sm fill-accent font-mono">
            {toBinaryString(values.carryNum, 5)} = {values.carryNum}
          </text>
        </g>
      )}

      {/* Final adder */}
      <g>
        <rect
          x={startX + 30}
          y={190}
          width={180}
          height={45}
          rx={4}
          className={`transition-colors ${
            activeComponents.includes('final-adder') || phase === 'final-add' || isFinal
              ? isFinal
                ? 'fill-positive/20 stroke-positive'
                : 'fill-accent/20 stroke-accent'
              : 'fill-surface-secondary stroke-border'
          }`}
          strokeWidth={activeComponents.includes('final-adder') ? 2 : 1}
        />
        <text x={startX + 120} y={210} textAnchor="middle" className="text-sm fill-text-secondary font-mono">
          Addiernetz
        </text>
        <text x={startX + 120} y={228} textAnchor="middle" className="text-xs fill-text-muted font-mono">
          (Ripple Carry)
        </text>
      </g>

      {/* Final result */}
      <g>
        <line
          x1={startX + 120}
          y1={235}
          x2={startX + 120}
          y2={260}
          className={`${isFinal ? 'stroke-positive' : 'stroke-text-muted'}`}
          strokeWidth={isFinal ? 2 : 1}
        />
        {(phase === 'final-add' || isFinal) && values.finalResult !== undefined && (
          <text
            x={startX + 120}
            y={280}
            textAnchor="middle"
            className={`text-lg font-mono ${isFinal ? 'fill-positive' : 'fill-accent'}`}
          >
            Σ = {values.finalResult}
          </text>
        )}
      </g>

      {/* Legend */}
      <text x={10} y={305} className="text-2xs fill-text-muted">
        CSA: 3 Eingänge → 2 Ausgänge (keine Carry-Propagation)
      </text>
    </svg>
  )
}
