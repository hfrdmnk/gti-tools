import { useState, useEffect } from 'react'
import { RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react'

export default function BinaryDivision() {
  const [dividend, setDividend] = useState(11)
  const [divisor, setDivisor] = useState(3)
  const [method, setMethod] = useState('restoring')
  const [history, setHistory] = useState([])
  const [stepIndex, setStepIndex] = useState(0)
  const [bitWidth, setBitWidth] = useState(4)

  const toBin = (num, bits) => {
    let binary = (num >>> 0).toString(2)
    if (num < 0) {
      const maxVal = Math.pow(2, bits)
      binary = (maxVal + num).toString(2)
    }
    while (binary.length < bits) {
      binary = '0' + binary
    }
    if (binary.length > bits) {
      binary = binary.slice(binary.length - bits)
    }
    return binary
  }

  useEffect(() => {
    generateTrace()
    setStepIndex(0)
  }, [dividend, divisor, method, bitWidth])

  const generateTrace = () => {
    if (divisor === 0) {
      setHistory([{ type: 'error', msg: 'Division durch 0 nicht möglich' }])
      return
    }

    const steps = []
    const N = bitWidth

    let regX = 0
    let regY = dividend
    let regZ = divisor
    let regC = 0

    steps.push({
      stepInfo: 'Start',
      x: regX, y: regY, z: regZ, c: regC,
      desc: 'Initialisierung. Dividend in y, Divisor in z, x = 0.',
      isRestore: false
    })

    if (method === 'restoring') {
      for (let i = 0; i < N; i++) {
        const msbY = (regY >> (N - 1)) & 1
        const msbX = (regX >> (N - 1)) & 1

        regC = msbX
        regX = ((regX << 1) | msbY) & (Math.pow(2, N) - 1)
        regY = (regY << 1) & (Math.pow(2, N) - 1)

        steps.push({
          stepInfo: `Zyklus ${i+1}: Shift`,
          x: regX, y: regY, z: regZ, c: regC,
          desc: `Shift c|x|y nach links.`,
          highlight: 'shift'
        })

        const oldX = regX
        const oldC = regC

        let valCX = (regC * Math.pow(2, N)) + regX
        let diff = valCX - regZ

        let newC = 0
        let newX = 0

        if (diff < 0) {
          newC = 1
          newX = (Math.pow(2, N+1) + diff) & (Math.pow(2, N) - 1)
        } else {
          newC = 0
          newX = diff & (Math.pow(2, N) - 1)
        }

        regX = newX
        regC = newC

        steps.push({
          stepInfo: `Zyklus ${i+1}: Sub`,
          x: regX, y: regY, z: regZ, c: regC,
          desc: `c|x = c|x - z. (${diff < 0 ? 'neg' : 'pos'})`,
          highlight: 'sub'
        })

        if (regC === 1) {
          steps.push({
            stepInfo: `Zyklus ${i+1}: Bit`,
            x: regX, y: regY, z: regZ, c: regC,
            desc: `c=1 → y₀ = 0`,
            qBit: 0,
            highlight: 'check-neg'
          })

          regX = oldX
          regC = oldC

          steps.push({
            stepInfo: `Zyklus ${i+1}: Restore`,
            x: regX, y: regY, z: regZ, c: regC,
            desc: `Restore x`,
            highlight: 'restore'
          })
        } else {
          regY = regY | 1
          steps.push({
            stepInfo: `Zyklus ${i+1}: Bit`,
            x: regX, y: regY, z: regZ, c: regC,
            desc: `c=0 → y₀ = 1`,
            qBit: 1,
            highlight: 'check-pos'
          })
        }
      }
    } else {
      for (let i = 0; i < N; i++) {
        const isXNegative = (regX & (1 << (N-1))) !== 0

        const msbY = (regY >> (N - 1)) & 1
        regX = ((regX << 1) | msbY) & (Math.pow(2, N) - 1)
        regY = (regY << 1) & (Math.pow(2, N) - 1)

        steps.push({
          stepInfo: `Zyklus ${i+1}: Shift`,
          x: regX, y: regY, z: regZ, c: 0,
          desc: `Links-Shift x|y`,
          highlight: 'shift'
        })

        let signedX = regX
        if ((regX & (1 << (N-1))) !== 0) {
          signedX = regX - Math.pow(2, N)
        }

        let opDesc = ''
        if (!isXNegative) {
          signedX = signedX - regZ
          opDesc = 'x pos → x - z'
        } else {
          signedX = signedX + regZ
          opDesc = 'x neg → x + z'
        }

        if (signedX < 0) {
          regX = (signedX + Math.pow(2, N)) & (Math.pow(2, N) - 1)
        } else {
          regX = signedX & (Math.pow(2, N) - 1)
        }

        steps.push({
          stepInfo: `Zyklus ${i+1}: Op`,
          x: regX, y: regY, z: regZ, c: 0,
          desc: opDesc,
          highlight: 'calc'
        })

        if (signedX >= 0) {
          regY = regY | 1
          steps.push({
            stepInfo: `Zyklus ${i+1}: Bit`,
            x: regX, y: regY, z: regZ, c: 0,
            desc: `x pos → y₀ = 1`,
            qBit: 1,
            highlight: 'q-set'
          })
        } else {
          steps.push({
            stepInfo: `Zyklus ${i+1}: Bit`,
            x: regX, y: regY, z: regZ, c: 0,
            desc: `x neg → y₀ = 0`,
            qBit: 0,
            highlight: 'q-set'
          })
        }
      }

      if ((regX & (1 << (N-1))) !== 0) {
        regX = (regX + regZ) & (Math.pow(2, N) - 1)
        steps.push({
          stepInfo: `Korrektur`,
          x: regX, y: regY, z: regZ, c: 0,
          desc: `Rest neg. → x = x + z`,
          highlight: 'correction-done'
        })
      }
    }

    steps.push({
      stepInfo: 'Fertig',
      x: regX, y: regY, z: regZ, c: regC,
      desc: `Q=${regY}, R=${regX}`,
      highlight: 'finish'
    })

    setHistory(steps)
  }

  const current = history[stepIndex] || {}

  const handleDivChange = (val) => {
    const v = parseInt(val) || 0
    setDividend(Math.min(Math.max(0, v), 255))
  }

  const handleDivisorChange = (val) => {
    const v = parseInt(val) || 0
    setDivisor(Math.min(Math.max(0, v), 255))
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h1 className="text-lg font-medium">Binary Division</h1>
          <p className="text-sm text-text-muted font-mono">x, y, z, c Register</p>
        </div>

        {/* Method Toggle */}
        <div className="flex bg-surface-secondary rounded border border-border">
          <button
            onClick={() => setMethod('restoring')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              method === 'restoring'
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Restoring
          </button>
          <button
            onClick={() => setMethod('non-restoring')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              method === 'non-restoring'
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Non-Restoring
          </button>
        </div>
      </header>

      {/* Controls */}
      <div className="flex items-center gap-6 p-4 border-b border-border bg-surface-secondary">
        <div className="flex items-center gap-2">
          <label className="text-2xs text-text-muted uppercase tracking-wider">Dividend</label>
          <input
            type="number"
            value={dividend}
            onChange={(e) => handleDivChange(e.target.value)}
            className="w-20 bg-surface border border-border rounded px-2 py-1 font-mono text-sm focus:border-accent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-2xs text-text-muted uppercase tracking-wider">Divisor</label>
          <input
            type="number"
            value={divisor}
            onChange={(e) => handleDivisorChange(e.target.value)}
            className="w-20 bg-surface border border-border rounded px-2 py-1 font-mono text-sm focus:border-accent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-2xs text-text-muted uppercase tracking-wider">Bits</label>
          <select
            value={bitWidth}
            onChange={(e) => setBitWidth(parseInt(e.target.value))}
            className="bg-surface border border-border rounded px-2 py-1 font-mono text-sm focus:border-accent outline-none"
          >
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={8}>8</option>
          </select>
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
            {stepIndex + 1} / {history.length}
          </span>
          <button
            onClick={() => setStepIndex(prev => Math.min(prev + 1, history.length - 1))}
            disabled={stepIndex >= history.length - 1}
            className="p-2 bg-accent text-white rounded transition-colors disabled:opacity-30 hover:bg-accent-hover"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
        {/* Left: Register Visualization */}
        <div className="flex flex-col p-6 border-r border-border overflow-auto">
          {/* Step Info */}
          <div className="mb-8">
            <div className="text-2xs text-text-muted uppercase tracking-wider mb-1">Schritt</div>
            <div className="text-xl font-medium text-accent">{current.stepInfo}</div>
            <div className="text-sm text-text-secondary mt-2">{current.desc}</div>
          </div>

          {/* Combined Register c|x|y */}
          <div className="mb-6">
            <div className="text-2xs text-text-muted uppercase tracking-wider mb-3">
              Arbeitsregister c | x | y
            </div>
            <div className="flex items-center gap-2 font-mono text-2xl">
              <span className={`px-2 py-1 rounded ${current.c === 1 ? 'bg-negative/20 text-negative' : 'text-text-muted'}`}>
                {current.c ?? 0}
              </span>
              <span className="text-text-muted">│</span>
              <span className="text-positive">{toBin(current.x, bitWidth)}</span>
              <span className="text-text-muted">│</span>
              <span className="text-text-primary">{toBin(current.y, bitWidth)}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-2xs text-text-muted mt-1">
              <span className="px-2 py-1">c</span>
              <span className="opacity-0">│</span>
              <span>Rest (x)</span>
              <span className="opacity-0">│</span>
              <span>Quotient (y)</span>
            </div>
          </div>

          {/* Divisor */}
          <div className="mb-6">
            <div className="text-2xs text-text-muted uppercase tracking-wider mb-3">
              Divisor z
            </div>
            <div className="font-mono text-2xl text-text-secondary">
              {toBin(current.z, bitWidth)}
              <span className="text-sm text-text-muted ml-3">({current.z})</span>
            </div>
          </div>

          {/* Decimal Check */}
          <div className="mt-auto pt-6 border-t border-border">
            <div className="text-2xs text-text-muted uppercase tracking-wider mb-2">Dezimal</div>
            <div className="font-mono text-sm">
              <span className="text-text-muted">x=</span>
              <span className="text-positive">{current.x}</span>
              <span className="text-text-muted ml-4">y=</span>
              <span className="text-text-primary">{current.y}</span>
            </div>
            {stepIndex === history.length - 1 && (
              <div className="text-sm text-text-muted mt-2">
                {dividend} ÷ {divisor} = {Math.floor(dividend/divisor)} R {dividend % divisor}
              </div>
            )}
          </div>
        </div>

        {/* Right: History Log */}
        <div className="flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-2xs text-text-muted uppercase tracking-wider">Verlauf</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-secondary">
                <tr className="text-2xs text-text-muted uppercase tracking-wider">
                  <th className="text-left px-4 py-2">Step</th>
                  <th className="text-center px-2 py-2 w-8">c</th>
                  <th className="text-left px-2 py-2 font-mono">x</th>
                  <th className="text-left px-2 py-2 font-mono">y</th>
                  <th className="text-left px-4 py-2">Info</th>
                </tr>
              </thead>
              <tbody>
                {history.map((step, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-border-subtle cursor-pointer transition-colors ${
                      idx === stepIndex ? 'bg-accent-muted' : 'hover:bg-surface-tertiary'
                    }`}
                    onClick={() => setStepIndex(idx)}
                  >
                    <td className={`px-4 py-2 ${idx === stepIndex ? 'text-accent' : 'text-text-secondary'}`}>
                      {step.stepInfo}
                    </td>
                    <td className={`text-center px-2 py-2 font-mono ${step.c ? 'text-negative' : 'text-text-muted'}`}>
                      {step.c}
                    </td>
                    <td className="px-2 py-2 font-mono text-positive">
                      {toBin(step.x, bitWidth)}
                    </td>
                    <td className="px-2 py-2 font-mono text-text-primary">
                      {toBin(step.y, bitWidth)}
                    </td>
                    <td className="px-4 py-2 text-text-muted truncate max-w-[150px]" title={step.desc}>
                      {step.desc}
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
