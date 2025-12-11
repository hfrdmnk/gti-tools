import { useState, useEffect, useRef } from 'react'
import { RotateCcw, ChevronRight, ChevronLeft, Play, Square } from 'lucide-react'
import { parse, explainStep } from './parser'
import { createStateWithRAM, step, cloneState, isHalted } from './executor'

// Example programs with initial RAM values
const EXAMPLES = [
  {
    name: 'Pointer Dereference',
    description: 'R1 = RAM[R0]',
    initialRAM: { 0: 5, 5: 42 },
    code: `// R1 = RAM[R0]
// Ausgangslage: R0=5, RAM[5]=42
// Ergebnis: R1 soll 42 enthalten

@R0      // A = 0 (Adresse von R0)
A=M      // A = RAM[0] = 5 (folge dem Pointer)
D=M      // D = RAM[5] = 42 (lies den Wert)
@R1      // A = 1 (Adresse von R1)
M=D      // RAM[1] = D = 42 (speichere Ergebnis)`
  },
  {
    name: 'Addition',
    description: 'R2 = R0 + R1',
    initialRAM: { 0: 10, 1: 25 },
    code: `// R2 = R0 + R1
// Ausgangslage: R0=10, R1=25
// Ergebnis: R2 soll 35 enthalten

@R0      // A = 0
D=M      // D = RAM[0] = 10
@R1      // A = 1
D=D+M    // D = D + RAM[1] = 10 + 25 = 35
@R2      // A = 2
M=D      // RAM[2] = 35`
  },
  {
    name: 'Countdown Loop',
    description: 'R0 runterzaehlen bis 0',
    initialRAM: { 0: 5 },
    code: `// Countdown von R0 bis 0
// Ausgangslage: R0=5

(LOOP)
@R0      // A = 0
D=M      // D = RAM[0] (aktueller Wert)
@END     // A = Adresse von END
D;JEQ    // Springe zu END wenn D=0

@R0      // A = 0
M=M-1    // RAM[0] = RAM[0] - 1
@LOOP    // A = Adresse von LOOP
0;JMP    // Springe zurueck zu LOOP

(END)
@END     // Endlosschleife (Halt)
0;JMP`
  }
]

export default function HackVisualizer() {
  const [code, setCode] = useState(EXAMPLES[0].code)
  const [parsed, setParsed] = useState(null)
  const [vm, setVm] = useState(() => createStateWithRAM(EXAMPLES[0].initialRAM))
  const [history, setHistory] = useState([])
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)
  const [selectedExample, setSelectedExample] = useState(0)
  const runIntervalRef = useRef(null)

  // Parse code when it changes (but don't reset VM - that's handled by example change)
  useEffect(() => {
    try {
      const result = parse(code)
      setParsed(result)
      setError(null)
    } catch (e) {
      setError(e.message)
      setParsed(null)
    }
  }, [code])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (runIntervalRef.current) {
        clearInterval(runIntervalRef.current)
      }
    }
  }, [])

  const handleExampleChange = (idx) => {
    setSelectedExample(idx)
    setCode(EXAMPLES[idx].code)
    setVm(createStateWithRAM(EXAMPLES[idx].initialRAM))
    setHistory([])
    setRunning(false)
  }

  const handleStep = () => {
    if (!parsed || isHalted(vm, parsed.instructions.length)) return

    const instruction = parsed.instructions[vm.PC]
    const newState = step(vm, instruction)

    setHistory(prev => [...prev, cloneState(vm)])
    setVm(newState)
  }

  const handlePrev = () => {
    if (history.length === 0) return

    const prevState = history[history.length - 1]
    setHistory(prev => prev.slice(0, -1))
    setVm(prevState)
  }

  const handleReset = () => {
    setVm(createStateWithRAM(EXAMPLES[selectedExample].initialRAM))
    setHistory([])
    setRunning(false)
  }

  const handleRun = () => {
    if (running) {
      // Stop
      if (runIntervalRef.current) {
        clearInterval(runIntervalRef.current)
        runIntervalRef.current = null
      }
      setRunning(false)
    } else {
      // Start
      setRunning(true)
      runIntervalRef.current = setInterval(() => {
        setVm(currentVm => {
          setParsed(currentParsed => {
            if (!currentParsed || isHalted(currentVm, currentParsed.instructions.length)) {
              clearInterval(runIntervalRef.current)
              runIntervalRef.current = null
              setRunning(false)
              return currentParsed
            }
            return currentParsed
          })

          if (!parsed || isHalted(currentVm, parsed.instructions.length)) {
            return currentVm
          }

          const instruction = parsed.instructions[currentVm.PC]
          const newState = step(currentVm, instruction)
          setHistory(prev => [...prev, cloneState(currentVm)])
          return newState
        })
      }, 500)
    }
  }

  const instructions = parsed?.instructions || []
  const currentInstruction = instructions[vm.PC]
  const halted = isHalted(vm, instructions.length)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h1 className="text-lg font-medium">Hack Assembly</h1>
          <p className="text-sm text-text-muted font-mono">Register & Speicher Visualisierung</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-2xs text-text-muted uppercase tracking-wider">Beispiel</label>
          <select
            value={selectedExample}
            onChange={(e) => handleExampleChange(Number(e.target.value))}
            className="bg-surface border border-border rounded px-3 py-1.5 text-sm focus:border-accent outline-none"
          >
            {EXAMPLES.map((ex, idx) => (
              <option key={idx} value={idx}>{ex.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Controls */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-surface-secondary">
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-tertiary rounded transition-colors"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={handlePrev}
            disabled={history.length === 0}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-tertiary rounded transition-colors disabled:opacity-30"
            title="Zurueck"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 font-mono text-sm text-text-muted min-w-[80px] text-center">
            PC: {vm.PC} / {instructions.length}
          </span>
          <button
            onClick={handleStep}
            disabled={halted}
            className="p-2 bg-accent text-white rounded transition-colors disabled:opacity-30 hover:bg-accent-hover"
            title="Schritt"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={handleRun}
            disabled={halted && !running}
            className={`p-2 rounded transition-colors ${
              running
                ? 'bg-negative text-white hover:bg-negative/80'
                : 'bg-surface-tertiary text-text-secondary hover:bg-surface hover:text-text-primary'
            }`}
            title={running ? 'Stop' : 'Ausfuehren'}
          >
            {running ? <Square size={16} /> : <Play size={16} />}
          </button>
        </div>

        {halted && (
          <span className="text-sm text-text-muted">Programm beendet</span>
        )}
      </div>

      {/* Main Content - 3 columns */}
      <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden">
        {/* Left: Step Explanation + Code Editor */}
        <div className="flex flex-col border-r border-border overflow-hidden">
          {/* Step Explanation Panel */}
          <div className="border-b border-border p-4 bg-surface">
            <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">Schritt</div>
            {currentInstruction && !halted ? (
              <>
                <div className="text-xl font-medium text-accent">
                  {explainStep(currentInstruction, vm).title}
                </div>
                <div className="text-sm text-text-secondary mt-2">
                  {explainStep(currentInstruction, vm).desc}
                </div>
                <div className="text-sm font-mono text-text-primary mt-1">
                  {explainStep(currentInstruction, vm).detail}
                </div>
              </>
            ) : halted ? (
              <div className="text-xl font-medium text-text-muted">Programm beendet</div>
            ) : (
              <div className="text-xl font-medium text-text-muted">Warte auf Start...</div>
            )}
          </div>

          <div className="p-3 border-b border-border bg-surface-secondary">
            <h2 className="text-2xs text-text-muted uppercase tracking-wider">Programm</h2>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent font-mono text-sm p-4 resize-none outline-none leading-6"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Middle: Code View + Registers */}
        <div className="flex flex-col border-r border-border overflow-hidden">
          {/* Registers */}
          <div className="p-4 border-b border-border">
            <div className="text-2xs text-text-muted uppercase tracking-wider mb-3">Register</div>
            <div className="flex gap-4">
              {/* A Register */}
              <div className="flex-1">
                <div className="text-2xs text-blue-400 mb-1">A (Address)</div>
                <div className="h-12 flex items-center justify-center rounded bg-blue-500/20 border border-blue-500 font-mono text-xl">
                  {vm.A}
                </div>
              </div>
              {/* D Register */}
              <div className="flex-1">
                <div className="text-2xs text-positive mb-1">D (Data)</div>
                <div className="h-12 flex items-center justify-center rounded bg-positive/20 border border-positive font-mono text-xl">
                  {vm.D}
                </div>
              </div>
            </div>

            {/* M Value */}
            <div className="mt-4">
              <div className="text-2xs text-accent mb-1">M = RAM[A] = RAM[{vm.A}]</div>
              <div className="h-10 flex items-center justify-center rounded bg-accent/20 border border-accent font-mono text-lg">
                {vm.RAM[vm.A] || 0}
              </div>
            </div>
          </div>

          {/* Instruction List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 border-b border-border bg-surface-secondary sticky top-0">
              <h2 className="text-2xs text-text-muted uppercase tracking-wider">Instruktionen</h2>
            </div>
            {error ? (
              <div className="p-4 text-negative text-sm">{error}</div>
            ) : (
              <div className="font-mono text-sm">
                {instructions.map((inst, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-1.5 flex items-center gap-3 border-b border-border-subtle ${
                      idx === vm.PC ? 'bg-accent-muted' : ''
                    }`}
                  >
                    <span className={`w-6 text-right ${idx === vm.PC ? 'text-accent' : 'text-text-muted'}`}>
                      {idx}
                    </span>
                    <span className={idx === vm.PC ? 'text-accent font-medium' : 'text-text-secondary'}>
                      {inst.raw}
                    </span>
                    {idx === vm.PC && (
                      <span className="text-accent ml-auto">{'<-'}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Memory */}
        <div className="flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border bg-surface-secondary">
            <h2 className="text-2xs text-text-muted uppercase tracking-wider">Speicher (RAM)</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="font-mono text-sm">
              {Array.from({ length: 32 }, (_, i) => {
                const value = vm.RAM[i] || 0
                const isSelected = vm.A === i
                const hasValue = value !== 0

                return (
                  <div
                    key={i}
                    className={`px-4 py-1.5 flex items-center gap-3 border-b border-border-subtle ${
                      isSelected ? 'bg-blue-500/10 ring-1 ring-inset ring-blue-500' : ''
                    }`}
                  >
                    <span className={`w-8 text-right ${isSelected ? 'text-blue-400' : 'text-text-muted'}`}>
                      {i}:
                    </span>
                    <span className={`flex-1 ${hasValue ? 'text-text-primary' : 'text-text-muted'}`}>
                      {value}
                    </span>
                    {isSelected && (
                      <span className="text-blue-400 text-xs">{'<- A'}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Symbol Table */}
          {parsed?.symbolTable && Object.keys(parsed.symbolTable).length > 16 && (
            <div className="border-t border-border">
              <div className="p-3 bg-surface-secondary">
                <h2 className="text-2xs text-text-muted uppercase tracking-wider">Symbole</h2>
              </div>
              <div className="max-h-32 overflow-y-auto">
                <div className="font-mono text-xs p-2">
                  {Object.entries(parsed.symbolTable)
                    .filter(([key]) => !key.startsWith('R') && !['SP', 'LCL', 'ARG', 'THIS', 'THAT', 'SCREEN', 'KBD'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between px-2 py-0.5 text-text-secondary">
                        <span>{key}</span>
                        <span className="text-text-muted">{value}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
