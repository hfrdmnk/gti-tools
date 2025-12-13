import { useState, useEffect } from 'react'
import { RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react'
import {
  toTwosComplement,
  fromTwosComplement,
  getValidRange,
  generateConversionSteps,
  generateFullTable,
  generateAdditionSteps
} from './utils'

const BIT_WIDTHS = [4, 8]

export default function TwosComplement() {
  const [mode, setMode] = useState('representation')
  const [bitWidth, setBitWidth] = useState(4)

  // Darstellungs-Modus State
  const [decimalInput, setDecimalInput] = useState('-5')
  const [conversionSteps, setConversionSteps] = useState([])
  const [stepIndex, setStepIndex] = useState(0)

  // Tabellen-Modus State
  const [tableData, setTableData] = useState([])
  const [selectedRow, setSelectedRow] = useState(null)

  // Additions-Modus State
  const [operandX, setOperandX] = useState('6')
  const [operandY, setOperandY] = useState('-2')
  const [additionSteps, setAdditionSteps] = useState([])
  const [additionStepIndex, setAdditionStepIndex] = useState(0)

  useEffect(() => {
    if (mode === 'representation') {
      const decimal = parseInt(decimalInput) || 0
      setConversionSteps(generateConversionSteps(decimal, bitWidth))
      setStepIndex(0)
    }
  }, [decimalInput, bitWidth, mode])

  useEffect(() => {
    if (mode === 'table') {
      setTableData(generateFullTable(bitWidth))
      setSelectedRow(null)
    }
  }, [bitWidth, mode])

  useEffect(() => {
    if (mode === 'addition') {
      const x = parseInt(operandX) || 0
      const y = parseInt(operandY) || 0
      setAdditionSteps(generateAdditionSteps(x, y, bitWidth))
      setAdditionStepIndex(0)
    }
  }, [operandX, operandY, bitWidth, mode])

  const range = getValidRange(bitWidth)
  const currentStep = conversionSteps[stepIndex]
  const currentAdditionStep = additionSteps[additionStepIndex]
  const decimal = parseInt(decimalInput) || 0
  const isValidInput = decimal >= range.min && decimal <= range.max

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h1 className="text-lg font-medium">Zweierkomplement</h1>
          <p className="text-sm text-text-muted font-mono">
            Darstellung negativer Zahlen
          </p>
        </div>

        {/* Bit-Breite Auswahl */}
        <div className="flex items-center gap-2">
          <span className="text-2xs text-text-muted uppercase tracking-wider">Bit-Breite</span>
          <div className="flex gap-1">
            {BIT_WIDTHS.map(bw => (
              <button
                key={bw}
                onClick={() => setBitWidth(bw)}
                className={`px-3 py-1 text-sm font-mono rounded transition-colors ${bitWidth === bw
                    ? 'bg-accent text-white'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                  }`}
              >
                {bw}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Steuerung */}
      <div className="flex items-center gap-6 p-4 border-b border-border bg-surface-secondary">
        {/* Modus-Auswahl */}
        <div className="flex gap-1">
          {[
            { id: 'representation', label: 'Darstellung' },
            { id: 'table', label: 'Tabelle' },
            { id: 'addition', label: 'Addition' }
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

        {/* Modus-spezifische Eingaben */}
        {mode === 'representation' && (
          <div className="flex items-center gap-2">
            <label className="text-2xs text-text-muted uppercase tracking-wider">Dezimal</label>
            <input
              type="number"
              value={decimalInput}
              onChange={(e) => setDecimalInput(e.target.value)}
              min={range.min}
              max={range.max}
              className="w-24 bg-surface border border-border rounded px-3 py-1.5 font-mono text-sm focus:border-accent outline-none"
            />
            <span className="text-xs text-text-muted">
              [{range.min}, {range.max}]
            </span>
          </div>
        )}

        {mode === 'addition' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-2xs text-text-muted uppercase tracking-wider">x</label>
              <input
                type="number"
                value={operandX}
                onChange={(e) => setOperandX(e.target.value)}
                min={range.min}
                max={range.max}
                className="w-20 bg-surface border border-border rounded px-3 py-1.5 font-mono text-sm focus:border-accent outline-none"
              />
            </div>
            <span className="text-text-muted">+</span>
            <div className="flex items-center gap-2">
              <label className="text-2xs text-text-muted uppercase tracking-wider">y</label>
              <input
                type="number"
                value={operandY}
                onChange={(e) => setOperandY(e.target.value)}
                min={range.min}
                max={range.max}
                className="w-20 bg-surface border border-border rounded px-3 py-1.5 font-mono text-sm focus:border-accent outline-none"
              />
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Schritt-Steuerung */}
        {(mode === 'representation' || mode === 'addition') && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => mode === 'representation' ? setStepIndex(0) : setAdditionStepIndex(0)}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-tertiary rounded transition-colors"
              title="Zurücksetzen"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => mode === 'representation'
                ? setStepIndex(prev => Math.max(0, prev - 1))
                : setAdditionStepIndex(prev => Math.max(0, prev - 1))
              }
              disabled={mode === 'representation' ? stepIndex <= 0 : additionStepIndex <= 0}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-tertiary rounded transition-colors disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 font-mono text-sm text-text-muted">
              {mode === 'representation'
                ? `${conversionSteps.length > 0 ? stepIndex + 1 : '-'} / ${conversionSteps.length || '-'}`
                : `${additionSteps.length > 0 ? additionStepIndex + 1 : '-'} / ${additionSteps.length || '-'}`
              }
            </span>
            <button
              onClick={() => mode === 'representation'
                ? setStepIndex(prev => Math.min(prev + 1, conversionSteps.length - 1))
                : setAdditionStepIndex(prev => Math.min(prev + 1, additionSteps.length - 1))
              }
              disabled={mode === 'representation'
                ? stepIndex >= conversionSteps.length - 1
                : additionStepIndex >= additionSteps.length - 1
              }
              className="p-2 bg-accent text-white rounded transition-colors disabled:opacity-30 hover:bg-accent-hover"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Hauptinhalt */}
      <div className="flex-1 overflow-hidden">
        {mode === 'representation' && (
          <RepresentationMode
            decimal={decimal}
            bitWidth={bitWidth}
            isValidInput={isValidInput}
            steps={conversionSteps}
            stepIndex={stepIndex}
            setStepIndex={setStepIndex}
            currentStep={currentStep}
          />
        )}

        {mode === 'table' && (
          <TableMode
            tableData={tableData}
            bitWidth={bitWidth}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
          />
        )}

        {mode === 'addition' && (
          <AdditionMode
            x={parseInt(operandX) || 0}
            y={parseInt(operandY) || 0}
            bitWidth={bitWidth}
            steps={additionSteps}
            stepIndex={additionStepIndex}
            setStepIndex={setAdditionStepIndex}
            currentStep={currentAdditionStep}
          />
        )}
      </div>
    </div>
  )
}

// Darstellungs-Modus Komponente
function RepresentationMode({ decimal, bitWidth, isValidInput, steps, stepIndex, setStepIndex, currentStep }) {
  const tcBinary = isValidInput ? toTwosComplement(decimal, bitWidth) : null
  const stepBinary = currentStep?.binary || tcBinary
  const changedBits = currentStep?.changedBits || []
  const isFinal = currentStep?.isFinal || false

  // Bit-Style basierend auf Zustand
  const getBitStyle = (i, isRightPanel = false) => {
    if (isFinal) {
      // Endergebnis: grün
      return 'bg-positive/20 border-2 border-positive text-positive'
    }
    if (!isRightPanel && changedBits.includes(i)) {
      // Geändertes Bit: orange
      return 'bg-accent/20 border-2 border-accent text-accent'
    }
    // Normal
    return 'bg-surface-secondary border border-border'
  }

  return (
    <div className="grid grid-cols-2 gap-0 h-full overflow-hidden">
      {/* Links: Schritt-für-Schritt Visualisierung */}
      <div className="flex flex-col p-6 border-r border-border overflow-auto">
        {/* Aktueller Schritt */}
        {currentStep && (
          <div className="mb-6">
            <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">Aktueller Schritt</div>
            <div className={`text-xl font-medium ${isFinal ? 'text-positive' : 'text-accent'}`}>{currentStep.title}</div>
            <div className="text-sm text-text-secondary mt-2">{currentStep.desc}</div>
          </div>
        )}

        {/* Zwischenschritt Visualisierung */}
        <div className="mb-6">
          <div className="text-2xs text-text-muted uppercase tracking-wider mb-2">
            {isFinal ? 'Ergebnis' : 'Zwischenschritt'}
          </div>
          {stepBinary ? (
            <div className="flex gap-1">
              {stepBinary.split('').map((bit, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 flex items-center justify-center font-mono text-xl rounded transition-colors ${getBitStyle(i, false)}`}
                >
                  {bit}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-negative">Ungültige Eingabe</div>
          )}
        </div>

        {/* Schritte-Tabelle */}
        <div className="flex-1">
          <div className="text-2xs text-text-muted uppercase tracking-wider mb-2">Schritte</div>
          <div className="space-y-1">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`p-2 rounded cursor-pointer transition-colors ${idx === stepIndex ? 'bg-accent-muted border border-accent' : 'hover:bg-surface-tertiary'
                  }`}
                onClick={() => setStepIndex(idx)}
              >
                <div className={`text-sm font-medium ${idx === stepIndex ? 'text-accent' : 'text-text-secondary'}`}>
                  {idx + 1}. {step.title}
                </div>
                <div className="text-xs text-text-muted font-mono mt-0.5">{step.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Formel */}
        <div className="mt-auto pt-4 border-t border-border">
          <div className="text-sm text-text-muted">
            <strong>Formel:</strong> <span className="font-mono">-x = !x + 1</span>
          </div>
        </div>
      </div>

      {/* Rechts: Endergebnis */}
      <div className="flex flex-col p-6 overflow-auto">
        <div className="text-2xs text-text-muted uppercase tracking-wider mb-2">
          Endergebnis
        </div>

        {/* Finale Bit-Darstellung */}
        {tcBinary ? (
          <>
            <div className="flex gap-1">
              {tcBinary.split('').map((bit, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 flex items-center justify-center font-mono text-xl rounded transition-colors ${isFinal
                      ? 'bg-positive/20 border-2 border-positive text-positive'
                      : i === 0
                        ? 'bg-accent/20 border-2 border-accent text-accent'
                        : 'bg-surface-secondary border border-border'
                    }`}
                >
                  {bit}
                </div>
              ))}
            </div>
            {/* MSB Beschriftung - immer anzeigen */}
            <div className="flex gap-1 mt-1 mb-6">
              <div className={`w-12 text-center text-xs ${isFinal ? 'text-positive' : 'text-accent'}`}>MSB</div>
            </div>
          </>
        ) : (
          <div className="text-sm text-negative mb-6">Ungültige Eingabe</div>
        )}

        {/* Dezimalwert */}
        <div className="mb-6">
          <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">Dezimalwert</div>
          <div className="font-mono text-4xl">{decimal}</div>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded border bg-surface-secondary border-border">
          <div className="text-2xs text-text-muted uppercase tracking-wider mb-2">
            Zweierkomplement ({bitWidth} Bit)
          </div>
          <div className="text-sm text-text-secondary space-y-1">
            <p>Wertebereich: [{-Math.pow(2, bitWidth - 1)}, {Math.pow(2, bitWidth - 1) - 1}]</p>
            <p className="mt-2 text-accent">MSB = {tcBinary?.[0]} → {tcBinary?.[0] === '1' ? 'negative' : 'positive'} Zahl</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tabellen-Modus Komponente
function TableMode({ tableData, bitWidth, selectedRow, setSelectedRow }) {
  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface-secondary z-10">
          <tr className="text-2xs text-text-muted uppercase tracking-wider">
            <th className="text-left px-4 py-3 border-b border-border">Binär</th>
            <th className="text-right px-4 py-3 border-b border-border">Unsigned</th>
            <th className="text-right px-4 py-3 border-b border-border">Zweierkomplement</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr
              key={row.binary}
              className={`border-b border-border-subtle cursor-pointer transition-colors ${selectedRow === row.binary ? 'bg-accent-muted' : 'hover:bg-surface-tertiary'
                }`}
              onClick={() => setSelectedRow(row.binary)}
            >
              <td className="px-4 py-2 font-mono">
                <span className={row.binary[0] === '1' ? 'text-accent' : ''}>
                  {row.binary[0]}
                </span>
                <span className="text-text-secondary">{row.binary.slice(1)}</span>
              </td>
              <td className="px-4 py-2 text-right font-mono text-text-muted">
                {row.unsigned}
              </td>
              <td className={`px-4 py-2 text-right font-mono ${row.twosComplement < 0 ? 'text-accent' : ''
                }`}>
                {row.twosComplement}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legende */}
      <div className="sticky bottom-0 p-4 bg-surface border-t border-border">
        <div className="flex gap-6 text-xs text-text-muted">
          <span><span className="text-accent">Orange</span> = MSB ist 1 (negative Zahl)</span>
          <span>Wertebereich: [{-Math.pow(2, bitWidth - 1)}, {Math.pow(2, bitWidth - 1) - 1}]</span>
        </div>
      </div>
    </div>
  )
}

// Additions-Modus Komponente
function AdditionMode({ x, y, bitWidth, steps, stepIndex, setStepIndex, currentStep }) {
  const xBinary = currentStep?.xBinary || toTwosComplement(x, bitWidth)
  const yBinary = currentStep?.yBinary || toTwosComplement(y, bitWidth)
  const resultBinary = currentStep?.resultBinary
  const carryBits = currentStep?.carryBits

  return (
    <div className="grid grid-cols-2 gap-0 h-full overflow-hidden">
      {/* Links: Additions-Visualisierung */}
      <div className="flex flex-col p-6 border-r border-border overflow-auto">
        {/* Aktueller Schritt */}
        {currentStep && (
          <div className="mb-6">
            <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">Aktueller Schritt</div>
            <div className={`text-xl font-medium ${currentStep.overflow ? 'text-negative' : 'text-accent'}`}>
              {currentStep.title}
            </div>
            <div className="text-sm text-text-secondary mt-2">{currentStep.desc}</div>
            {currentStep.explanation && (
              <div className="text-sm text-text-muted mt-1">{currentStep.explanation}</div>
            )}
          </div>
        )}

        {/* Binäraddition */}
        <div className="font-mono text-lg space-y-2 mb-6">
          {/* Übertrag */}
          {carryBits && (
            <div className="flex gap-0.5 pl-8 text-text-muted text-sm">
              {carryBits.map((c, i) => (
                <div key={i} className="w-8 text-center text-accent">
                  {c || ''}
                </div>
              ))}
            </div>
          )}

          {/* X Operand */}
          <div className="flex items-center gap-2">
            <span className="w-6 text-right text-text-muted"></span>
            <div className="flex gap-0.5">
              {xBinary.split('').map((bit, i) => (
                <div
                  key={i}
                  className="w-8 h-10 flex items-center justify-center bg-surface-secondary border border-border rounded"
                >
                  {bit}
                </div>
              ))}
            </div>
            <span className="text-text-muted text-sm">({x})</span>
          </div>

          {/* Y Operand */}
          <div className="flex items-center gap-2">
            <span className="w-6 text-right text-text-muted">+</span>
            <div className="flex gap-0.5">
              {yBinary.split('').map((bit, i) => (
                <div
                  key={i}
                  className="w-8 h-10 flex items-center justify-center bg-surface-secondary border border-border rounded"
                >
                  {bit}
                </div>
              ))}
            </div>
            <span className="text-text-muted text-sm">({y})</span>
          </div>

          {/* Trennlinie */}
          <div className="flex items-center gap-2">
            <span className="w-6"></span>
            <div className="flex gap-0.5">
              {Array(bitWidth).fill(null).map((_, i) => (
                <div key={i} className="w-8 border-t-2 border-text-muted"></div>
              ))}
            </div>
          </div>

          {/* Ergebnis */}
          {resultBinary && (
            <div className="flex items-center gap-2">
              <span className="w-6 text-right text-text-muted">=</span>
              <div className="flex gap-0.5">
                {resultBinary.split('').map((bit, i) => (
                  <div
                    key={i}
                    className={`w-8 h-10 flex items-center justify-center border rounded font-medium ${currentStep?.overflow
                        ? 'bg-negative/20 border-negative text-negative'
                        : 'bg-positive/20 border-positive text-positive'
                      }`}
                  >
                    {bit}
                  </div>
                ))}
              </div>
              <span className={`text-sm ${currentStep?.overflow ? 'text-negative' : 'text-positive'}`}>
                ({currentStep?.resultDecimal})
              </span>
            </div>
          )}
        </div>

        {/* Ergebnis-Box */}
        {currentStep?.phase === 'result' && (
          <div className={`p-4 rounded border ${currentStep.overflow
              ? 'bg-negative/10 border-negative'
              : 'bg-positive/10 border-positive'
            }`}>
            <div className="text-sm font-medium">
              {currentStep.overflow ? 'Überlauf!' : 'Ergebnis korrekt'}
            </div>
            <div className="text-sm text-text-secondary mt-1">
              {x} + {y} = {currentStep.overflow ? `${currentStep.expectedResult} (nicht darstellbar)` : currentStep.resultDecimal}
            </div>
          </div>
        )}

        {/* Erklärung */}
        <div className="mt-auto pt-6 border-t border-border">
          <div className="text-2xs text-text-muted uppercase tracking-wider mb-2">
            Warum funktioniert das?
          </div>
          <div className="text-sm text-text-secondary">
            Addition im Zweierkomplement ist normale Binäraddition modulo 2^{bitWidth}.
            Der Übertrag am Ende wird verworfen. Negative Zahlen sind bereits als
            ihre „Komplemente" kodiert.
          </div>
        </div>
      </div>

      {/* Rechts: Schritte */}
      <div className="flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-2xs text-text-muted uppercase tracking-wider">Additionsschritte</h2>
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
                  className={`border-b border-border-subtle cursor-pointer transition-colors ${idx === stepIndex ? 'bg-accent-muted' : 'hover:bg-surface-tertiary'
                    }`}
                  onClick={() => setStepIndex(idx)}
                >
                  <td className={`px-4 py-3 ${idx === stepIndex ? 'text-accent' : 'text-text-muted'}`}>
                    {idx + 1}
                  </td>
                  <td className={`px-4 py-3 ${step.overflow ? 'text-negative' : idx === stepIndex ? 'text-accent' : 'text-text-secondary'
                    }`}>
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
  )
}
