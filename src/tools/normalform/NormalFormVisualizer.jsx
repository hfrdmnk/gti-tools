import { useState, useEffect } from 'react'
import { RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react'
import {
  generateTruthTable,
  getVariableNames,
  generateDNFSteps,
  generateKNFSteps,
  formatDNF,
  formatKNF
} from './utils'

const VAR_COUNTS = [2, 3]

export default function NormalFormVisualizer() {
  const [numVars, setNumVars] = useState(2)
  const [mode, setMode] = useState('dnf') // 'dnf' | 'knf'
  const [truthTable, setTruthTable] = useState(() => generateTruthTable(2))
  const [stepIndex, setStepIndex] = useState(0)

  const varNames = getVariableNames(numVars)

  // Regenerate table when numVars changes
  useEffect(() => {
    setTruthTable(generateTruthTable(numVars))
    setStepIndex(0)
  }, [numVars])

  // Reset step index when mode changes
  useEffect(() => {
    setStepIndex(0)
  }, [mode])

  // Generate steps based on mode
  const steps = mode === 'dnf'
    ? generateDNFSteps(truthTable, varNames)
    : generateKNFSteps(truthTable, varNames)

  const currentStep = steps[stepIndex]

  // Toggle output value in truth table
  const toggleOutput = (index) => {
    setTruthTable(prev => prev.map(row =>
      row.index === index
        ? { ...row, output: row.output === 0 ? 1 : 0 }
        : row
    ))
    setStepIndex(0)
  }

  // Get final formula
  const finalFormula = mode === 'dnf'
    ? formatDNF(truthTable, varNames)
    : formatKNF(truthTable, varNames)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h1 className="text-lg font-medium">Normalformen</h1>
          <p className="text-sm text-text-muted font-mono">
            DNF & KNF verstehen
          </p>
        </div>

        {/* Variable Count Selector */}
        <div className="flex items-center gap-2">
          <span className="text-2xs text-text-muted uppercase tracking-wider">Variablen</span>
          <div className="flex gap-1">
            {VAR_COUNTS.map(n => (
              <button
                key={n}
                onClick={() => setNumVars(n)}
                className={`px-3 py-1 text-sm font-mono rounded transition-colors ${numVars === n
                  ? 'bg-accent text-white'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="flex items-center gap-6 p-4 border-b border-border bg-surface-secondary">
        {/* Mode Tabs */}
        <div className="flex gap-1">
          {[
            { id: 'dnf', label: 'DNF' },
            { id: 'knf', label: 'KNF' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${mode === m.id
                ? 'bg-accent text-white'
                : 'bg-surface text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Step Navigation */}
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

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
        {/* Left: Truth Table */}
        <TruthTable
          table={truthTable}
          varNames={varNames}
          onToggle={toggleOutput}
          highlightRows={currentStep?.highlightRows || []}
          currentRowIndex={currentStep?.currentRowIndex}
          mode={mode}
        />

        {/* Right: Step Explanation */}
        <StepExplanation
          steps={steps}
          stepIndex={stepIndex}
          setStepIndex={setStepIndex}
          currentStep={currentStep}
          varNames={varNames}
          mode={mode}
        />
      </div>

      {/* Footer: Final Formula */}
      <div className="p-4 border-t border-border bg-surface-secondary">
        <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">
          {mode === 'dnf' ? 'Disjunktive Normalform' : 'Konjunktive Normalform'}
        </div>
        <div className={`font-mono text-lg ${currentStep?.isFinal ? 'text-positive' : ''}`}>
          f({varNames.join(', ')}) = {finalFormula}
        </div>
      </div>
    </div>
  )
}

// Truth Table Component
function TruthTable({ table, varNames, onToggle, highlightRows, currentRowIndex, mode }) {
  return (
    <div className="flex flex-col p-4 border-r border-border overflow-auto">
      <div className="text-2xs text-text-muted uppercase tracking-wider mb-2">
        Wertetabelle (klicke auf f zum Ändern)
      </div>

      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="text-2xs text-text-muted uppercase tracking-wider">
            <th className="text-left px-2 py-2 border-b border-border">i</th>
            {varNames.map(name => (
              <th key={name} className="text-center px-2 py-2 border-b border-border">{name}</th>
            ))}
            <th className="text-center px-2 py-2 border-b border-border">f</th>
          </tr>
        </thead>
        <tbody>
          {table.map(row => {
            const isHighlighted = highlightRows.includes(row.index)
            const isCurrent = currentRowIndex === row.index
            const isRelevant = mode === 'dnf' ? row.output === 1 : row.output === 0

            return (
              <tr
                key={row.index}
                className={`border-b border-border-subtle transition-colors ${
                  isCurrent
                    ? 'bg-accent/20'
                    : isHighlighted
                      ? 'bg-positive/10'
                      : 'hover:bg-surface-tertiary'
                }`}
              >
                <td className={`px-2 py-2 ${isCurrent ? 'text-accent font-medium' : 'text-text-muted'}`}>
                  {row.index}
                </td>
                {row.vars.map((val, i) => (
                  <td
                    key={i}
                    className={`text-center px-2 py-2 ${
                      isCurrent ? 'text-accent' : ''
                    }`}
                  >
                    {val}
                  </td>
                ))}
                <td className="text-center px-2 py-2">
                  <button
                    onClick={() => onToggle(row.index)}
                    className={`w-8 h-8 rounded font-medium transition-colors ${
                      isRelevant
                        ? 'bg-positive/20 text-positive border-2 border-positive hover:bg-positive/30'
                        : 'bg-surface-tertiary text-text-secondary hover:bg-surface border border-border'
                    }`}
                  >
                    {row.output}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 text-xs text-text-muted space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-positive/20 border border-positive"></span>
          <span>Relevant für {mode === 'dnf' ? 'DNF (f=1)' : 'KNF (f=0)'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-accent/20 border border-accent"></span>
          <span>Aktueller Schritt</span>
        </div>
      </div>
    </div>
  )
}

// Step Explanation Component
function StepExplanation({ steps, stepIndex, setStepIndex, currentStep, varNames, mode }) {
  if (!currentStep) {
    return (
      <div className="flex items-center justify-center p-6 text-text-muted">
        Keine Schritte verfügbar
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Current Step Details */}
      <div className="p-6 border-b border-border">
        <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">
          Aktueller Schritt
        </div>
        <div className={`text-xl font-medium ${currentStep.isFinal ? 'text-positive' : 'text-accent'}`}>
          {currentStep.title}
        </div>
        <div className="text-sm text-text-secondary mt-2">
          {currentStep.desc}
        </div>

        {/* Term Construction Visualization */}
        {currentStep.construction && (
          <div className="mt-4 p-4 bg-surface-secondary rounded border border-border">
            <div className="text-2xs text-text-muted uppercase tracking-wider mb-2">
              Konstruktion von {currentStep.termLabel}
            </div>
            <div className="space-y-2">
              {currentStep.construction.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-mono">
                  <span className="text-text-muted w-12">{item.variable}={item.value}</span>
                  <span className="text-accent">→</span>
                  <span className="text-positive">{item.result}</span>
                  <span className="text-xs text-text-muted">({item.value === 0
                    ? (mode === 'dnf' ? 'negiert' : 'bleibt')
                    : (mode === 'dnf' ? 'bleibt' : 'negiert')
                  })</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-text-muted">{currentStep.termLabel} = </span>
              <span className="text-lg text-positive font-medium">{currentStep.term}</span>
            </div>
          </div>
        )}

        {/* Final Formula */}
        {currentStep.isFinal && currentStep.formula && (
          <div className="mt-4 p-4 bg-positive/10 rounded border border-positive">
            <div className="text-2xs text-positive uppercase tracking-wider mb-2">
              Ergebnis
            </div>
            <div className="font-mono">
              <div className="text-text-muted text-sm mb-1">
                f = {currentStep.formulaWithLabels}
              </div>
              <div className="text-lg text-positive font-medium">
                f = {currentStep.formula}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="text-2xs text-text-muted uppercase tracking-wider mb-2">
            Alle Schritte
          </div>
          <div className="space-y-1">
            {steps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setStepIndex(idx)}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  idx === stepIndex
                    ? 'bg-accent-muted border border-accent'
                    : 'hover:bg-surface-tertiary'
                }`}
              >
                <div className={`text-sm font-medium ${
                  idx === stepIndex
                    ? 'text-accent'
                    : step.isFinal
                      ? 'text-positive'
                      : 'text-text-secondary'
                }`}>
                  {idx + 1}. {step.title}
                </div>
                {step.term && (
                  <div className="text-xs text-text-muted font-mono mt-0.5">
                    {step.termLabel} = {step.term}
                  </div>
                )}
                {step.formula && (
                  <div className="text-xs text-positive font-mono mt-0.5">
                    f = {step.formula}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 border-t border-border">
        <div className="p-3 bg-surface-secondary rounded border border-border text-sm text-text-secondary">
          {mode === 'dnf' ? (
            <>
              <strong>DNF:</strong> Disjunktion (ODER) von Mintermen.
              Jeder Minterm ist eine Konjunktion (UND) von Literalen,
              die genau für eine Tabellenzeile mit f=1 wahr ist.
            </>
          ) : (
            <>
              <strong>KNF:</strong> Konjunktion (UND) von Maxtermen.
              Jeder Maxterm ist eine Disjunktion (ODER) von Literalen,
              die genau für eine Tabellenzeile mit f=0 falsch ist.
            </>
          )}
        </div>
      </div>
    </div>
  )
}
