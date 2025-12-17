import { useState } from 'react'
import { ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react'

// ============================================
// CHAPTER CONFIGURATION
// ============================================
const CHAPTERS = [
  { id: 1, title: 'Half Adder', subtitle: 'Die kleinste Einheit' },
  { id: 2, title: 'Full Adder', subtitle: 'Mit Übertrag' },
  { id: 3, title: 'Ripple Carry', subtitle: 'Aneinandergereiht' },
  { id: 4, title: 'Das Problem', subtitle: 'Die Wartezeit' },
  { id: 5, title: 'Carry Bypass', subtitle: 'Die Autobahn' },
  { id: 6, title: 'Carry Select', subtitle: 'Parallel spekulieren' },
  { id: 7, title: 'Parallel Prefix', subtitle: 'Der elegante Höhepunkt' },
  { id: 8, title: 'Carry Save', subtitle: 'Für Multiplikation' },
]

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdderVisualizer() {
  const [chapter, setChapter] = useState(1)
  const [unlockedChapters, setUnlockedChapters] = useState([1])

  const unlockNext = () => {
    if (!unlockedChapters.includes(chapter + 1) && chapter < CHAPTERS.length) {
      setUnlockedChapters([...unlockedChapters, chapter + 1])
    }
  }

  const goToChapter = (num) => {
    if (unlockedChapters.includes(num)) {
      setChapter(num)
    }
  }

  const currentChapter = CHAPTERS.find(c => c.id === chapter)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chapter Navigation */}
      <nav className="flex items-center gap-1 p-4 border-b border-border bg-surface-secondary overflow-x-auto">
        {CHAPTERS.map((ch) => {
          const isUnlocked = unlockedChapters.includes(ch.id)
          const isCurrent = chapter === ch.id
          return (
            <button
              key={ch.id}
              onClick={() => goToChapter(ch.id)}
              disabled={!isUnlocked}
              className={`
                flex-shrink-0 px-3 py-2 rounded text-sm font-mono transition-all
                ${isCurrent
                  ? 'bg-accent text-white'
                  : isUnlocked
                    ? 'bg-surface hover:bg-surface-tertiary text-text-secondary'
                    : 'bg-surface-secondary text-text-muted opacity-50 cursor-not-allowed'
                }
              `}
            >
              <span className="font-bold">{ch.id}</span>
              <span className="hidden md:inline ml-2 text-xs opacity-75">{ch.title}</span>
            </button>
          )
        })}
      </nav>

      {/* Chapter Header */}
      <header className="p-4 border-b border-border">
        <div className="text-xs text-text-muted uppercase tracking-wider mb-1">
          Kapitel {currentChapter.id}
        </div>
        <h1 className="text-xl font-medium">
          {currentChapter.title}
          <span className="text-text-muted ml-2 text-base font-normal">
            — {currentChapter.subtitle}
          </span>
        </h1>
      </header>

      {/* Chapter Content */}
      <div className="flex-1 overflow-auto">
        {chapter === 1 && <Chapter1HalfAdder onComplete={unlockNext} />}
        {chapter === 2 && <Chapter2FullAdder onComplete={unlockNext} />}
        {chapter === 3 && <Chapter3RippleCarry onComplete={unlockNext} />}
        {chapter === 4 && <Chapter4Problem onComplete={unlockNext} />}
        {chapter === 5 && <Chapter5CarryBypass onComplete={unlockNext} />}
        {chapter === 6 && <Chapter6CarrySelect onComplete={unlockNext} />}
        {chapter === 7 && <Chapter7ParallelPrefix onComplete={unlockNext} />}
        {chapter === 8 && <Chapter8CarrySave onComplete={unlockNext} />}
      </div>

      {/* Chapter Navigation Footer */}
      <footer className="flex items-center justify-between p-4 border-t border-border">
        <button
          onClick={() => setChapter(Math.max(1, chapter - 1))}
          disabled={chapter === 1}
          className="flex items-center gap-2 px-4 py-2 rounded bg-surface hover:bg-surface-tertiary disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={16} />
          Zurück
        </button>

        <span className="text-sm text-text-muted font-mono">
          {chapter} / {CHAPTERS.length}
        </span>

        <button
          onClick={() => {
            unlockNext()
            setChapter(Math.min(CHAPTERS.length, chapter + 1))
          }}
          disabled={chapter === CHAPTERS.length}
          className="flex items-center gap-2 px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-30 transition-colors"
        >
          Weiter
          <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  )
}

// ============================================
// SHARED COMPONENTS
// ============================================

function ExplanationBox({ children, type = 'info' }) {
  const styles = {
    info: 'bg-surface-secondary border-border',
    aha: 'bg-accent/10 border-accent',
    problem: 'bg-negative/10 border-negative',
    success: 'bg-positive/10 border-positive',
  }
  return (
    <div className={`p-4 rounded border ${styles[type]}`}>
      {children}
    </div>
  )
}

function BitInput({ label, value, onChange, bits = 1 }) {
  const max = (1 << bits) - 1
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-text-muted font-mono w-8">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))}
        min={0}
        max={max}
        className="w-16 bg-surface border border-border rounded px-3 py-1.5 font-mono text-sm focus:border-accent outline-none"
      />
      <span className="text-xs text-text-muted font-mono">
        ({value.toString(2).padStart(bits, '0')})
      </span>
    </div>
  )
}

function TruthTableCell({ children, isHeader, isHighlight }) {
  return (
    <td className={`
      px-3 py-2 text-center font-mono text-sm border border-border
      ${isHeader ? 'bg-surface-secondary text-text-muted font-medium' : ''}
      ${isHighlight ? 'bg-accent/20 text-accent' : ''}
    `}>
      {children}
    </td>
  )
}

function GateSymbol({ type, x, y, size = 40, isActive }) {
  const color = isActive ? 'stroke-accent' : 'stroke-text-muted'
  const fill = isActive ? 'fill-accent/20' : 'fill-surface-secondary'

  if (type === 'xor') {
    return (
      <g transform={`translate(${x}, ${y})`}>
        <path
          d={`M 0 0 Q ${size * 0.3} ${size * 0.5} 0 ${size} M ${size * 0.15} 0 Q ${size * 0.7} 0 ${size} ${size * 0.5} Q ${size * 0.7} ${size} ${size * 0.15} ${size} Q ${size * 0.45} ${size * 0.5} ${size * 0.15} 0`}
          className={`${color} ${fill}`}
          strokeWidth={2}
        />
        <text x={size * 0.5} y={size * 0.6} textAnchor="middle" className={`text-xs ${isActive ? 'fill-accent' : 'fill-text-muted'}`}>
          XOR
        </text>
      </g>
    )
  }

  if (type === 'and') {
    return (
      <g transform={`translate(${x}, ${y})`}>
        <path
          d={`M 0 0 L ${size * 0.5} 0 Q ${size} 0 ${size} ${size * 0.5} Q ${size} ${size} ${size * 0.5} ${size} L 0 ${size} Z`}
          className={`${color} ${fill}`}
          strokeWidth={2}
        />
        <text x={size * 0.45} y={size * 0.6} textAnchor="middle" className={`text-xs ${isActive ? 'fill-accent' : 'fill-text-muted'}`}>
          AND
        </text>
      </g>
    )
  }

  return null
}

// ============================================
// CHAPTER 1: HALF ADDER
// ============================================
function Chapter1HalfAdder({ onComplete }) {
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const [step, setStep] = useState(0)

  const sum = a ^ b
  const carry = a & b

  const highlightRow = a * 2 + b

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Introduction */}
      <ExplanationBox>
        <p className="text-text-secondary">
          Stell dir vor, du addierst zwei einstellige Binärzahlen. Das ist die einfachste Addition überhaupt:
          <span className="font-mono mx-2">0+0</span>,
          <span className="font-mono mx-2">0+1</span>,
          <span className="font-mono mx-2">1+0</span>, oder
          <span className="font-mono mx-2">1+1</span>.
        </p>
        <p className="text-text-secondary mt-2">
          Der <strong>Half Adder</strong> (Halbaddierer) ist die Schaltung, die genau das macht.
        </p>
      </ExplanationBox>

      {/* Interactive inputs */}
      <div className="flex items-center gap-8">
        <BitInput label="A" value={a} onChange={setA} bits={1} />
        <span className="text-xl text-text-muted">+</span>
        <BitInput label="B" value={b} onChange={setB} bits={1} />
        <span className="text-xl text-text-muted">=</span>
        <span className="text-xl font-mono">
          <span className="text-text-muted text-sm">Carry:</span> {carry}
          <span className="text-text-muted text-sm ml-4">Sum:</span> {sum}
        </span>
      </div>

      {/* Truth Table Discovery */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium mb-3 text-text-secondary">Wahrheitstabelle</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <TruthTableCell isHeader>A</TruthTableCell>
                <TruthTableCell isHeader>B</TruthTableCell>
                <TruthTableCell isHeader>Sum</TruthTableCell>
                <TruthTableCell isHeader>Carry</TruthTableCell>
              </tr>
            </thead>
            <tbody>
              {[
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [1, 0, 1, 0],
                [1, 1, 0, 1],
              ].map((row, idx) => (
                <tr key={idx}>
                  <TruthTableCell isHighlight={idx === highlightRow}>{row[0]}</TruthTableCell>
                  <TruthTableCell isHighlight={idx === highlightRow}>{row[1]}</TruthTableCell>
                  <TruthTableCell isHighlight={idx === highlightRow}>{row[2]}</TruthTableCell>
                  <TruthTableCell isHighlight={idx === highlightRow}>{row[3]}</TruthTableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary">Erkennst du das Muster?</h3>

          <ExplanationBox type={step >= 1 ? 'aha' : 'info'}>
            <p className="font-medium text-accent">Sum-Spalte</p>
            <p className="text-text-secondary text-sm mt-1">
              {step >= 1
                ? 'Die Sum ist 1, wenn A und B unterschiedlich sind. Das ist XOR!'
                : 'Schau dir die Sum-Spalte an. Wann ist sie 1?'
              }
            </p>
            {step === 0 && (
              <button
                onClick={() => setStep(1)}
                className="mt-2 text-sm text-accent hover:underline"
              >
                Zeige Lösung →
              </button>
            )}
          </ExplanationBox>

          <ExplanationBox type={step >= 2 ? 'aha' : 'info'}>
            <p className="font-medium text-accent">Carry-Spalte</p>
            <p className="text-text-secondary text-sm mt-1">
              {step >= 2
                ? 'Der Carry ist 1, wenn A und B beide 1 sind. Das ist AND!'
                : 'Schau dir die Carry-Spalte an. Wann ist sie 1?'
              }
            </p>
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="mt-2 text-sm text-accent hover:underline"
              >
                Zeige Lösung →
              </button>
            )}
          </ExplanationBox>
        </div>
      </div>

      {/* Circuit Diagram */}
      {step >= 2 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary">Die Schaltung</h3>

          <svg viewBox="0 0 400 200" className="w-full max-w-md bg-surface rounded border border-border">
            {/* Input A */}
            <text x={30} y={50} className="text-sm fill-text-secondary font-mono">A = {a}</text>
            <line x1={60} y1={55} x2={100} y2={55} className="stroke-text-muted" strokeWidth={2} />
            <line x1={100} y1={55} x2={100} y2={80} className="stroke-text-muted" strokeWidth={2} />
            <line x1={100} y1={80} x2={140} y2={80} className="stroke-text-muted" strokeWidth={2} />
            <line x1={100} y1={55} x2={100} y2={130} className="stroke-text-muted" strokeWidth={2} />
            <line x1={100} y1={130} x2={140} y2={130} className="stroke-text-muted" strokeWidth={2} />

            {/* Input B */}
            <text x={30} y={110} className="text-sm fill-text-secondary font-mono">B = {b}</text>
            <line x1={60} y1={115} x2={80} y2={115} className="stroke-text-muted" strokeWidth={2} />
            <line x1={80} y1={115} x2={80} y2={100} className="stroke-text-muted" strokeWidth={2} />
            <line x1={80} y1={100} x2={140} y2={100} className="stroke-text-muted" strokeWidth={2} />
            <line x1={80} y1={115} x2={80} y2={150} className="stroke-text-muted" strokeWidth={2} />
            <line x1={80} y1={150} x2={140} y2={150} className="stroke-text-muted" strokeWidth={2} />

            {/* XOR Gate */}
            <rect x={140} y={70} width={60} height={40} rx={4}
              className={`${sum ? 'fill-accent/20 stroke-accent' : 'fill-surface-secondary stroke-border'}`}
              strokeWidth={2}
            />
            <text x={170} y={95} textAnchor="middle" className={`text-sm font-mono ${sum ? 'fill-accent' : 'fill-text-muted'}`}>
              XOR
            </text>

            {/* AND Gate */}
            <rect x={140} y={120} width={60} height={40} rx={4}
              className={`${carry ? 'fill-accent/20 stroke-accent' : 'fill-surface-secondary stroke-border'}`}
              strokeWidth={2}
            />
            <text x={170} y={145} textAnchor="middle" className={`text-sm font-mono ${carry ? 'fill-accent' : 'fill-text-muted'}`}>
              AND
            </text>

            {/* Output Sum */}
            <line x1={200} y1={90} x2={280} y2={90} className={`${sum ? 'stroke-accent' : 'stroke-text-muted'}`} strokeWidth={2} />
            <text x={300} y={95} className={`text-sm font-mono ${sum ? 'fill-accent' : 'fill-text-muted'}`}>
              Sum = {sum}
            </text>

            {/* Output Carry */}
            <line x1={200} y1={140} x2={280} y2={140} className={`${carry ? 'stroke-accent' : 'stroke-text-muted'}`} strokeWidth={2} />
            <text x={300} y={145} className={`text-sm font-mono ${carry ? 'fill-accent' : 'fill-text-muted'}`}>
              Carry = {carry}
            </text>
          </svg>

          <ExplanationBox type="aha">
            <p className="font-medium text-accent">Der Aha-Moment</p>
            <p className="text-text-secondary mt-1">
              Mit nur <strong>zwei Gattern</strong> (XOR und AND) können wir ein Bit addieren!
            </p>
            <p className="text-text-secondary mt-2 text-sm">
              <span className="font-mono">Sum = A ⊕ B</span> (XOR) <br />
              <span className="font-mono">Carry = A ∧ B</span> (AND)
            </p>
          </ExplanationBox>
        </div>
      )}

      {/* Problem teaser */}
      {step >= 2 && (
        <ExplanationBox type="problem">
          <p className="font-medium text-negative">Aber...</p>
          <p className="text-text-secondary mt-1">
            Was passiert, wenn wir mehrere Bits addieren wollen?
            Der Carry vom vorherigen Bit muss ja auch berücksichtigt werden.
          </p>
          <p className="text-text-secondary mt-2">
            Der Half Adder hat keinen Eingang für einen eingehenden Carry!
          </p>
        </ExplanationBox>
      )}
    </div>
  )
}

// ============================================
// CHAPTER 2: FULL ADDER
// ============================================
function Chapter2FullAdder({ onComplete }) {
  const [a, setA] = useState(1)
  const [b, setB] = useState(1)
  const [cin, setCin] = useState(1)
  const [step, setStep] = useState(0)

  const sum = a ^ b ^ cin
  const carry = (a & b) | (a & cin) | (b & cin)

  // Half adder intermediate values
  const ha1_sum = a ^ b
  const ha1_carry = a & b
  const ha2_sum = ha1_sum ^ cin
  const ha2_carry = ha1_sum & cin
  const final_carry = ha1_carry | ha2_carry

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <ExplanationBox>
        <p className="text-text-secondary">
          Der Half Adder hat ein Problem: Er kann keinen eingehenden Carry verarbeiten.
          Aber bei mehrstelliger Addition gibt es fast immer einen Übertrag!
        </p>
        <p className="text-text-secondary mt-2">
          Beispiel: <span className="font-mono">1 + 1 + 1 = 11</span> (binär) — das sind drei Einsen!
        </p>
      </ExplanationBox>

      {/* Interactive inputs */}
      <div className="flex items-center gap-6 flex-wrap">
        <BitInput label="A" value={a} onChange={setA} bits={1} />
        <span className="text-xl text-text-muted">+</span>
        <BitInput label="B" value={b} onChange={setB} bits={1} />
        <span className="text-xl text-text-muted">+</span>
        <BitInput label="Cin" value={cin} onChange={setCin} bits={1} />
        <span className="text-xl text-text-muted">=</span>
        <span className="text-xl font-mono">
          <span className="text-positive">{carry}{sum}</span>
          <span className="text-text-muted text-sm ml-2">(= {a + b + cin})</span>
        </span>
      </div>

      {/* Truth Table */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-text-secondary">Wahrheitstabelle Full Adder</h3>
        <div className="overflow-x-auto">
          <table className="border-collapse">
            <thead>
              <tr>
                <TruthTableCell isHeader>A</TruthTableCell>
                <TruthTableCell isHeader>B</TruthTableCell>
                <TruthTableCell isHeader>Cin</TruthTableCell>
                <TruthTableCell isHeader>Sum</TruthTableCell>
                <TruthTableCell isHeader>Cout</TruthTableCell>
              </tr>
            </thead>
            <tbody>
              {[
                [0, 0, 0, 0, 0],
                [0, 0, 1, 1, 0],
                [0, 1, 0, 1, 0],
                [0, 1, 1, 0, 1],
                [1, 0, 0, 1, 0],
                [1, 0, 1, 0, 1],
                [1, 1, 0, 0, 1],
                [1, 1, 1, 1, 1],
              ].map((row, idx) => {
                const isHighlight = row[0] === a && row[1] === b && row[2] === cin
                return (
                  <tr key={idx}>
                    {row.map((cell, cellIdx) => (
                      <TruthTableCell key={cellIdx} isHighlight={isHighlight}>
                        {cell}
                      </TruthTableCell>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Building from Half Adders */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">Aufbau aus Half Addern</h3>

        <ExplanationBox type={step >= 1 ? 'aha' : 'info'}>
          <p className="text-text-secondary">
            {step >= 1
              ? 'Wir können den Full Adder aus zwei Half Addern bauen!'
              : 'Können wir den Full Adder aus Half Addern zusammensetzen?'
            }
          </p>
          {step === 0 && (
            <button onClick={() => setStep(1)} className="mt-2 text-sm text-accent hover:underline">
              Zeige wie →
            </button>
          )}
        </ExplanationBox>

        {step >= 1 && (
          <svg viewBox="0 0 560 240" className="w-full max-w-2xl bg-surface rounded border border-border">
            {/* Inputs */}
            <text x={15} y={40} className="text-xs fill-text-secondary font-mono">A={a}</text>
            <text x={15} y={80} className="text-xs fill-text-secondary font-mono">B={b}</text>
            <text x={15} y={180} className="text-xs fill-text-secondary font-mono">Cin={cin}</text>

            {/* Lines to HA1 */}
            <line x1={45} y1={35} x2={100} y2={35} className="stroke-text-muted" strokeWidth={2} />
            <line x1={45} y1={75} x2={100} y2={75} className="stroke-text-muted" strokeWidth={2} />

            {/* Half Adder 1 */}
            <rect x={100} y={20} width={90} height={75} rx={4}
              className="fill-surface-secondary stroke-border" strokeWidth={2}
            />
            <text x={145} y={45} textAnchor="middle" className="text-xs fill-text-secondary font-medium">
              Half Adder 1
            </text>
            <text x={145} y={65} textAnchor="middle" className="text-[10px] fill-text-muted font-mono">
              S={ha1_sum}, C={ha1_carry}
            </text>

            {/* HA1 Sum output -> HA2 input */}
            <line x1={190} y1={45} x2={240} y2={45}
              className={`${ha1_sum ? 'stroke-accent' : 'stroke-text-muted'}`} strokeWidth={2}
            />
            <text x={215} y={38} textAnchor="middle" className="text-[10px] fill-text-muted">S</text>

            {/* HA1 Carry output -> down and to OR */}
            <line x1={190} y1={75} x2={210} y2={75}
              className={`${ha1_carry ? 'stroke-accent' : 'stroke-text-muted'}`} strokeWidth={2}
            />
            <line x1={210} y1={75} x2={210} y2={210}
              className={`${ha1_carry ? 'stroke-accent' : 'stroke-text-muted'}`} strokeWidth={2}
            />
            <line x1={210} y1={210} x2={420} y2={210}
              className={`${ha1_carry ? 'stroke-accent' : 'stroke-text-muted'}`} strokeWidth={2}
            />
            <text x={200} y={95} className="text-[10px] fill-text-muted">C</text>

            {/* Cin line to HA2 - curved path */}
            <line x1={45} y1={175} x2={230} y2={175}
              className={`${cin ? 'stroke-orange-400' : 'stroke-text-muted'}`} strokeWidth={2}
            />
            <line x1={230} y1={175} x2={230} y2={65}
              className={`${cin ? 'stroke-orange-400' : 'stroke-text-muted'}`} strokeWidth={2}
            />
            <line x1={230} y1={65} x2={240} y2={65}
              className={`${cin ? 'stroke-orange-400' : 'stroke-text-muted'}`} strokeWidth={2}
            />

            {/* Half Adder 2 */}
            <rect x={240} y={20} width={90} height={75} rx={4}
              className="fill-surface-secondary stroke-border" strokeWidth={2}
            />
            <text x={285} y={45} textAnchor="middle" className="text-xs fill-text-secondary font-medium">
              Half Adder 2
            </text>
            <text x={285} y={65} textAnchor="middle" className="text-[10px] fill-text-muted font-mono">
              S={ha2_sum}, C={ha2_carry}
            </text>

            {/* HA2 Sum output -> Final Sum */}
            <line x1={330} y1={45} x2={420} y2={45}
              className={`${sum ? 'stroke-positive' : 'stroke-text-muted'}`} strokeWidth={2}
            />
            <text x={480} y={50} className={`text-xs font-mono ${sum ? 'fill-positive' : 'fill-text-muted'}`}>
              Sum = {sum}
            </text>

            {/* HA2 Carry to OR */}
            <line x1={330} y1={75} x2={360} y2={75}
              className={`${ha2_carry ? 'stroke-accent' : 'stroke-text-muted'}`} strokeWidth={2}
            />
            <line x1={360} y1={75} x2={360} y2={190}
              className={`${ha2_carry ? 'stroke-accent' : 'stroke-text-muted'}`} strokeWidth={2}
            />
            <line x1={360} y1={190} x2={420} y2={190}
              className={`${ha2_carry ? 'stroke-accent' : 'stroke-text-muted'}`} strokeWidth={2}
            />

            {/* OR Gate */}
            <rect x={420} y={175} width={50} height={50} rx={4}
              className={`${carry ? 'fill-accent/20 stroke-accent' : 'fill-surface-secondary stroke-border'}`}
              strokeWidth={2}
            />
            <text x={445} y={205} textAnchor="middle" className={`text-xs font-mono ${carry ? 'fill-accent' : 'fill-text-muted'}`}>
              OR
            </text>

            {/* Final Carry output */}
            <line x1={470} y1={200} x2={490} y2={200}
              className={`${carry ? 'stroke-positive' : 'stroke-text-muted'}`} strokeWidth={2}
            />
            <text x={500} y={205} className={`text-xs font-mono ${carry ? 'fill-positive' : 'fill-text-muted'}`}>
              Cout={carry}
            </text>
          </svg>
        )}

        {step >= 1 && (
          <ExplanationBox type="aha">
            <p className="font-medium text-accent">Der Aha-Moment</p>
            <p className="text-text-secondary mt-1">
              Der Full Adder ist nur <strong>zwei Half Adder</strong> plus ein <strong>OR-Gatter</strong>!
            </p>
            <ul className="text-text-secondary mt-2 text-sm list-disc list-inside space-y-1">
              <li>Half Adder 1: Addiert A und B</li>
              <li>Half Adder 2: Addiert das Ergebnis mit Cin</li>
              <li>OR: Kombiniert beide Carries (es kann maximal einer aktiv sein)</li>
            </ul>
          </ExplanationBox>
        )}
      </div>

      {/* Formulas */}
      {step >= 1 && (
        <div className="p-4 bg-surface-secondary rounded border border-border font-mono text-sm">
          <p><span className="text-text-muted">Sum =</span> A ⊕ B ⊕ Cin</p>
          <p><span className="text-text-muted">Cout =</span> (A ∧ B) ∨ (A ∧ Cin) ∨ (B ∧ Cin)</p>
        </div>
      )}

      {/* Next teaser */}
      {step >= 1 && (
        <ExplanationBox>
          <p className="text-text-secondary">
            Jetzt haben wir einen Baustein, der ein Bit addieren kann UND einen eingehenden Carry verarbeitet.
          </p>
          <p className="text-text-secondary mt-2">
            Was passiert, wenn wir <strong>mehrere Full Adder</strong> aneinanderreihen?
          </p>
        </ExplanationBox>
      )}
    </div>
  )
}

// ============================================
// CHAPTER 3: RIPPLE CARRY
// ============================================
function Chapter3RippleCarry({ onComplete }) {
  const [a, setA] = useState(7)
  const [b, setB] = useState(9)
  const [tick, setTick] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const aBits = [(a >> 3) & 1, (a >> 2) & 1, (a >> 1) & 1, a & 1]
  const bBits = [(b >> 3) & 1, (b >> 2) & 1, (b >> 1) & 1, b & 1]

  // Calculate carries and sums step by step
  const carries = [0]
  const sums = []
  for (let i = 3; i >= 0; i--) {
    const ai = aBits[i]
    const bi = bBits[i]
    const ci = carries[3 - i]
    sums.push(ai ^ bi ^ ci)
    carries.push((ai & bi) | (ai & ci) | (bi & ci))
  }

  const maxTicks = 5 // 0 = start, 1-4 = each adder, 5 = done

  // Auto-play
  useState(() => {
    if (isPlaying && tick < maxTicks) {
      const timer = setTimeout(() => setTick(tick + 1), 800)
      return () => clearTimeout(timer)
    } else if (tick >= maxTicks) {
      setIsPlaying(false)
    }
  })

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <ExplanationBox>
        <p className="text-text-secondary">
          Jetzt haben wir Full Adder. Was passiert, wenn wir 4 davon aneinanderreihen?
        </p>
        <p className="text-text-secondary mt-2">
          Der Carry von jedem Adder wird zum Cin des nächsten — er "rieselt" durch die Kette.
        </p>
      </ExplanationBox>

      {/* Inputs */}
      <div className="flex items-center gap-6 flex-wrap">
        <BitInput label="A" value={a} onChange={(v) => { setA(v); setTick(0) }} bits={4} />
        <span className="text-xl text-text-muted">+</span>
        <BitInput label="B" value={b} onChange={(v) => { setB(v); setTick(0) }} bits={4} />
        <span className="text-xl text-text-muted">=</span>
        <span className={`text-xl font-mono ${tick >= maxTicks ? 'text-positive' : 'text-text-muted'}`}>
          {tick >= maxTicks ? a + b : '?'}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setTick(0)}
          className="p-2 rounded bg-surface hover:bg-surface-tertiary"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => setTick(Math.max(0, tick - 1))}
          disabled={tick === 0}
          className="p-2 rounded bg-surface hover:bg-surface-tertiary disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 bg-surface-secondary rounded h-2 relative">
          <div
            className="absolute left-0 top-0 h-full bg-accent rounded transition-all"
            style={{ width: `${(tick / maxTicks) * 100}%` }}
          />
        </div>
        <button
          onClick={() => setTick(Math.min(maxTicks, tick + 1))}
          disabled={tick >= maxTicks}
          className="p-2 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
        <span className="text-sm text-text-muted font-mono w-16">
          Takt {tick}/{maxTicks}
        </span>
      </div>

      {/* Ripple Carry Diagram */}
      <div className="overflow-x-auto">
        <svg viewBox="0 0 600 180" className="w-full min-w-[500px] max-w-3xl mx-auto bg-surface rounded border border-border">
        {/* Bit labels */}
        {[0, 1, 2, 3].map(i => {
          const x = 500 - i * 130
          const computed = tick > (3 - i)
          return (
            <g key={`labels-${i}`}>
              <text x={x} y={25} textAnchor="middle" className="text-xs fill-text-muted font-mono">
                Bit {i}
              </text>
              <text x={x - 15} y={45} textAnchor="middle" className="text-sm fill-text-secondary font-mono">
                {aBits[3 - i]}
              </text>
              <text x={x + 15} y={45} textAnchor="middle" className="text-sm fill-text-secondary font-mono">
                {bBits[3 - i]}
              </text>

              {/* Input lines */}
              <line x1={x - 15} y1={50} x2={x - 15} y2={70} className="stroke-text-muted" strokeWidth={1} />
              <line x1={x + 15} y1={50} x2={x + 15} y2={70} className="stroke-text-muted" strokeWidth={1} />

              {/* Adder box */}
              <rect
                x={x - 35} y={70} width={70} height={45} rx={4}
                className={`transition-all duration-300 ${
                  tick === (4 - i)
                    ? 'fill-accent/30 stroke-accent animate-pulse'
                    : computed
                      ? 'fill-positive/20 stroke-positive'
                      : 'fill-surface-secondary stroke-border'
                }`}
                strokeWidth={2}
              />
              <text
                x={x} y={97}
                textAnchor="middle"
                className={`text-sm font-mono ${
                  tick === (4 - i) ? 'fill-accent' : computed ? 'fill-positive' : 'fill-text-muted'
                }`}
              >
                {i === 0 ? 'HA' : 'FA'}
              </text>

              {/* Sum output */}
              <line
                x1={x} y1={115} x2={x} y2={145}
                className={`${computed ? 'stroke-positive' : 'stroke-text-muted'}`}
                strokeWidth={2}
              />
              <text
                x={x} y={165}
                textAnchor="middle"
                className={`text-sm font-mono ${computed ? 'fill-positive' : 'fill-text-muted'}`}
              >
                s{i}={computed ? sums[3 - i] : '?'}
              </text>
            </g>
          )
        })}

        {/* Carry connections */}
        {[0, 1, 2].map(i => {
          const x1 = 500 - i * 130 - 35
          const x2 = 500 - (i + 1) * 130 + 35
          const y = 92
          const computed = tick > (3 - i)
          return (
            <g key={`carry-${i}`}>
              <line
                x1={x1} y1={y} x2={x2} y2={y}
                className={`transition-all duration-300 ${
                  tick === (4 - i) ? 'stroke-accent' : computed ? 'stroke-positive' : 'stroke-text-muted'
                }`}
                strokeWidth={2}
              />
              {computed && (
                <text
                  x={(x1 + x2) / 2} y={y - 8}
                  textAnchor="middle"
                  className="text-xs fill-accent font-mono"
                >
                  c{i + 1}={carries[i + 1]}
                </text>
              )}
            </g>
          )
        })}

        {/* Input c0 */}
        <line x1={540} y1={92} x2={565} y2={92} className="stroke-text-muted" strokeWidth={1} />
        <text x={575} y={96} className="text-xs fill-text-muted font-mono">c₀=0</text>

        {/* Output c4 */}
        <line
          x1={60} y1={92} x2={35} y2={92}
          className={`${tick >= maxTicks ? 'stroke-positive' : 'stroke-text-muted'}`}
          strokeWidth={2}
        />
        <text
          x={25} y={96}
          textAnchor="end"
          className={`text-xs font-mono ${tick >= maxTicks ? 'fill-positive' : 'fill-text-muted'}`}
        >
          c₄={tick >= maxTicks ? carries[4] : '?'}
        </text>
        </svg>
      </div>

      {/* Explanation based on tick */}
      <ExplanationBox type={tick >= maxTicks ? 'success' : 'info'}>
        {tick === 0 && (
          <p className="text-text-secondary">
            Klicke auf "Weiter" um zu sehen, wie der Carry durch die Addierer rieselt.
          </p>
        )}
        {tick > 0 && tick < maxTicks && (
          <p className="text-text-secondary">
            <strong>Takt {tick}:</strong> Addierer {4 - tick} berechnet.
            Der Carry c{4 - tick + 1} ist jetzt {carries[4 - tick + 1]}.
            {tick < 4 && ' Der nächste Addierer muss auf diesen Carry warten.'}
          </p>
        )}
        {tick >= maxTicks && (
          <>
            <p className="font-medium text-positive">Fertig!</p>
            <p className="text-text-secondary mt-1">
              Das Ergebnis ist {a + b} ({(a + b).toString(2).padStart(5, '0')} binär).
            </p>
          </>
        )}
      </ExplanationBox>

      {/* The problem */}
      {tick >= maxTicks && (
        <ExplanationBox type="problem">
          <p className="font-medium text-negative">Das Problem</p>
          <p className="text-text-secondary mt-1">
            Jeder Addierer muss auf den Carry des vorherigen warten.
            Bei 4 Bit brauchen wir <strong>4 Taktzyklen</strong>.
          </p>
          <p className="text-text-secondary mt-2">
            Was passiert bei 64 Bit? <strong>64 Taktzyklen!</strong> Das ist viel zu langsam.
          </p>
        </ExplanationBox>
      )}
    </div>
  )
}

// ============================================
// CHAPTER 4: THE PROBLEM
// ============================================
function Chapter4Problem({ onComplete }) {
  const [bits, setBits] = useState(4)

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <ExplanationBox type="problem">
        <p className="font-medium text-negative">Die Carry-Propagation-Verzögerung</p>
        <p className="text-text-secondary mt-2">
          Das fundamentale Problem beim Ripple Carry Addierer:
          <strong> Jeder Addierer muss auf den Carry des vorherigen warten.</strong>
        </p>
      </ExplanationBox>

      {/* Interactive visualization */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm text-text-muted">Bit-Breite:</label>
          <input
            type="range"
            min={4}
            max={64}
            value={bits}
            onChange={(e) => setBits(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="font-mono text-lg w-16">{bits} Bit</span>
        </div>

        {/* Line chart comparing O(n) vs O(log n) */}
        <div className="bg-surface-secondary rounded p-4">
          <svg viewBox="0 0 400 220" className="w-full max-w-lg mx-auto">
            {/* Axes */}
            <line x1={50} y1={170} x2={380} y2={170} className="stroke-text-muted" strokeWidth={1} />
            <line x1={50} y1={170} x2={50} y2={20} className="stroke-text-muted" strokeWidth={1} />

            {/* Y-axis labels */}
            <text x={45} y={173} textAnchor="end" className="text-[10px] fill-text-muted">0</text>
            <text x={45} y={95} textAnchor="end" className="text-[10px] fill-text-muted">32</text>
            <text x={45} y={25} textAnchor="end" className="text-[10px] fill-text-muted">64</text>
            <text x={20} y={100} textAnchor="middle" className="text-[10px] fill-text-muted" transform="rotate(-90, 20, 100)">Takte</text>

            {/* X-axis labels */}
            <text x={50} y={185} textAnchor="middle" className="text-[10px] fill-text-muted">4</text>
            <text x={160} y={185} textAnchor="middle" className="text-[10px] fill-text-muted">24</text>
            <text x={270} y={185} textAnchor="middle" className="text-[10px] fill-text-muted">44</text>
            <text x={380} y={185} textAnchor="middle" className="text-[10px] fill-text-muted">64</text>
            <text x={215} y={200} textAnchor="middle" className="text-[10px] fill-text-muted">Bit-Breite</text>

            {/* Grid lines */}
            <line x1={50} y1={95} x2={380} y2={95} className="stroke-border" strokeWidth={1} strokeDasharray="2,4" />

            {/* O(n) line - Ripple Carry (red/negative) */}
            <polyline
              points={Array.from({length: 61}, (_, i) => {
                const n = i + 4
                const x = 50 + (i / 60) * 330
                const y = 170 - (n / 64) * 150
                return `${x},${y}`
              }).join(' ')}
              className="stroke-negative"
              strokeWidth={2.5}
              fill="none"
            />

            {/* O(log n) line - Optimized (green/positive) */}
            <polyline
              points={Array.from({length: 61}, (_, i) => {
                const n = i + 4
                const x = 50 + (i / 60) * 330
                const y = 170 - (Math.ceil(Math.log2(n)) / 64) * 150
                return `${x},${y}`
              }).join(' ')}
              className="stroke-positive"
              strokeWidth={2.5}
              fill="none"
            />

            {/* Current position marker */}
            <line
              x1={50 + ((bits - 4) / 60) * 330}
              y1={20}
              x2={50 + ((bits - 4) / 60) * 330}
              y2={170}
              className="stroke-accent"
              strokeWidth={1.5}
              strokeDasharray="4,4"
            />

            {/* Current value dots */}
            <circle
              cx={50 + ((bits - 4) / 60) * 330}
              cy={170 - (bits / 64) * 150}
              r={6}
              className="fill-negative"
            />
            <circle
              cx={50 + ((bits - 4) / 60) * 330}
              cy={170 - (Math.ceil(Math.log2(bits)) / 64) * 150}
              r={6}
              className="fill-positive"
            />

            {/* Legend */}
            <line x1={280} y1={30} x2={310} y2={30} className="stroke-negative" strokeWidth={2.5} />
            <text x={315} y={34} className="text-[11px] fill-negative">O(n)</text>
            <line x1={280} y1={48} x2={310} y2={48} className="stroke-positive" strokeWidth={2.5} />
            <text x={315} y={52} className="text-[11px] fill-positive">O(log n)</text>
          </svg>

          <div className="text-center mt-4 grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-2 rounded bg-negative/10 border border-negative/30">
              <span className="text-negative font-mono text-xl font-bold">{bits}</span>
              <span className="text-text-muted text-sm block">Takte (Ripple)</span>
            </div>
            <div className="p-2 rounded bg-positive/10 border border-positive/30">
              <span className="text-positive font-mono text-xl font-bold">~{Math.ceil(Math.log2(bits))}</span>
              <span className="text-text-muted text-sm block">Takte (Optimiert)</span>
            </div>
          </div>
        </div>
      </div>

      {/* The math */}
      <div className="grid md:grid-cols-2 gap-4">
        <ExplanationBox>
          <p className="font-medium text-text-secondary">Ripple Carry</p>
          <p className="font-mono text-2xl mt-2">O(n)</p>
          <p className="text-sm text-text-muted mt-1">
            Bei {bits} Bit: {bits} Takte Verzögerung
          </p>
        </ExplanationBox>

        <ExplanationBox type="aha">
          <p className="font-medium text-accent">Das Ziel</p>
          <p className="font-mono text-2xl mt-2">O(log n)</p>
          <p className="text-sm text-text-muted mt-1">
            Bei {bits} Bit: ~{Math.ceil(Math.log2(bits))} Takte Verzögerung
          </p>
        </ExplanationBox>
      </div>

      {/* Context */}
      <ExplanationBox>
        <p className="font-medium text-text-secondary">Warum ist das wichtig?</p>
        <p className="text-text-secondary mt-2">
          Moderne CPUs takten mit <strong>4-5 GHz</strong> — das sind 4-5 Milliarden Operationen pro Sekunde.
        </p>
        <p className="text-text-secondary mt-2">
          Jede Verzögerung um einen Taktzyklus kostet wertvolle Zeit.
          Ein 64-Bit Ripple Carry Addierer wäre ein enormer Flaschenhals.
        </p>
      </ExplanationBox>

      {/* The question */}
      <ExplanationBox type="aha">
        <p className="font-medium text-accent">Die zentrale Frage</p>
        <p className="text-text-secondary mt-2 text-lg">
          Können wir die Carries <strong>parallel</strong> berechnen, statt auf jeden einzeln zu warten?
        </p>
        <p className="text-text-secondary mt-4">
          Die nächsten Kapitel zeigen verschiedene Strategien, genau das zu erreichen.
        </p>
      </ExplanationBox>
    </div>
  )
}

// ============================================
// CHAPTER 5: CARRY BYPASS
// ============================================
function Chapter5CarryBypass({ onComplete }) {
  const [a, setA] = useState(15)
  const [b, setB] = useState(0)
  const [step, setStep] = useState(0)
  const [animationStep, setAnimationStep] = useState(0)

  const aBits = [(a >> 3) & 1, (a >> 2) & 1, (a >> 1) & 1, a & 1]
  const bBits = [(b >> 3) & 1, (b >> 2) & 1, (b >> 1) & 1, b & 1]

  // Calculate propagate signals
  const p = aBits.map((ai, i) => ai ^ bBits[i])
  const allPropagate = p.every(pi => pi === 1)

  // Reset animation when inputs change
  const handleInputChange = (setter) => (value) => {
    setter(value)
    setAnimationStep(0)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <ExplanationBox>
        <p className="text-text-secondary">
          Die erste Optimierungsidee: <strong>Was wenn wir vorher wissen, dass der Carry durchgereicht wird?</strong>
        </p>
      </ExplanationBox>

      {/* Propagate explanation */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">Das Propagate-Signal</h3>

        <ExplanationBox type={step >= 1 ? 'aha' : 'info'}>
          <p className="text-text-secondary">
            Wann wird ein Carry "weitergeleitet" (propagiert)?
          </p>
          <p className="text-text-secondary mt-2">
            Wenn <span className="font-mono">A=0, B=1</span> oder <span className="font-mono">A=1, B=0</span>.
            Dann ist die Summe vom Carry abhängig!
          </p>
          {step === 0 && (
            <button onClick={() => setStep(1)} className="mt-2 text-sm text-accent hover:underline">
              Das ist XOR! →
            </button>
          )}
          {step >= 1 && (
            <p className="mt-2 font-mono text-accent">P = A ⊕ B</p>
          )}
        </ExplanationBox>
      </div>

      {/* Interactive */}
      {step >= 1 && (
        <>
          <div className="flex items-center gap-6 flex-wrap">
            <BitInput label="A" value={a} onChange={handleInputChange(setA)} bits={4} />
            <BitInput label="B" value={b} onChange={handleInputChange(setB)} bits={4} />
          </div>

          {/* Propagate visualization */}
          <div className="bg-surface-secondary rounded p-4">
            <div className="flex justify-center gap-8">
              {[3, 2, 1, 0].map(i => (
                <div key={i} className="text-center">
                  <div className="text-xs text-text-muted mb-1">Bit {i}</div>
                  <div className="font-mono text-sm">
                    {aBits[3 - i]} ⊕ {bBits[3 - i]}
                  </div>
                  <div className={`text-2xl font-bold mt-1 ${p[3 - i] ? 'text-positive' : 'text-negative'}`}>
                    P{i} = {p[3 - i]}
                  </div>
                </div>
              ))}
            </div>

            <div className={`text-center mt-4 p-2 rounded ${allPropagate ? 'bg-positive/20' : 'bg-surface-tertiary'}`}>
              <span className="text-sm">
                Alle P = 1?
                <span className={`ml-2 font-bold ${allPropagate ? 'text-positive' : 'text-text-muted'}`}>
                  {allPropagate ? 'JA — Bypass möglich!' : 'NEIN — normaler Ripple-Pfad'}
                </span>
              </span>
            </div>
          </div>
        </>
      )}

      {/* The bypass idea */}
      {step >= 1 && (
        <ExplanationBox type="aha">
          <p className="font-medium text-accent">Die Autobahn-Metapher</p>
          <p className="text-text-secondary mt-2">
            Stell dir den Carry als Auto vor, das durch eine Straße mit Ampeln fährt.
          </p>
          <ul className="text-text-secondary mt-2 text-sm list-disc list-inside space-y-1">
            <li><span className="text-positive">P = 1</span>: Grüne Ampel — der Carry kann durchfahren</li>
            <li><span className="text-negative">P = 0</span>: Rote Ampel — der Carry wird blockiert oder neu erzeugt</li>
          </ul>
          <p className="text-text-secondary mt-2">
            Wenn <strong>alle Ampeln grün</strong> sind, kann der Carry direkt von c₀ nach c₄ "durchrasen".
          </p>
        </ExplanationBox>
      )}

      {/* Animated comparison */}
      {step >= 1 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary">Vergleich: Ripple vs Bypass</h3>

          {/* Animation controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAnimationStep(0)}
              className="p-2 rounded bg-surface hover:bg-surface-tertiary"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setAnimationStep(Math.max(0, animationStep - 1))}
              disabled={animationStep === 0}
              className="p-2 rounded bg-surface hover:bg-surface-tertiary disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1 bg-surface-secondary rounded h-2 relative">
              <div
                className="absolute left-0 top-0 h-full bg-accent rounded transition-all"
                style={{ width: `${(animationStep / 5) * 100}%` }}
              />
            </div>
            <button
              onClick={() => setAnimationStep(Math.min(5, animationStep + 1))}
              disabled={animationStep >= 5}
              className="p-2 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
            <span className="text-sm text-text-muted font-mono w-20">
              Schritt {animationStep}/5
            </span>
          </div>

          {/* Side-by-side comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Ripple Carry Path */}
            <div className={`p-4 rounded border-2 ${!allPropagate ? 'border-accent' : 'border-border'} bg-surface`}>
              <div className="text-sm font-medium mb-3 flex items-center justify-between">
                <span>Ripple Carry</span>
                <span className={`text-xs px-2 py-1 rounded ${animationStep >= 4 ? 'bg-negative/20 text-negative' : 'bg-surface-secondary text-text-muted'}`}>
                  {animationStep >= 4 ? '4 Takte' : `${Math.min(animationStep, 4)}/4`}
                </span>
              </div>

              <svg viewBox="0 0 220 120" className="w-full">
                {/* Adders in row */}
                {[0, 1, 2, 3].map(i => {
                  const x = 20 + i * 50
                  const isActive = animationStep === (i + 1)
                  const isDone = animationStep > (i + 1)
                  return (
                    <g key={i}>
                      <rect
                        x={x} y={30} width={40} height={35} rx={3}
                        className={`transition-all duration-300 ${
                          isActive
                            ? 'fill-accent/30 stroke-accent'
                            : isDone
                              ? 'fill-positive/20 stroke-positive'
                              : 'fill-surface-secondary stroke-border'
                        }`}
                        strokeWidth={2}
                      />
                      <text x={x + 20} y={52} textAnchor="middle" className="text-[10px] fill-text-muted font-mono">
                        FA{3-i}
                      </text>
                      {/* Carry arrow */}
                      {i < 3 && (
                        <line
                          x1={x + 40} y1={47} x2={x + 50} y2={47}
                          className={`transition-all ${isDone ? 'stroke-positive' : isActive ? 'stroke-accent' : 'stroke-text-muted'}`}
                          strokeWidth={2}
                          markerEnd="url(#arrowhead)"
                        />
                      )}
                      {/* Step number */}
                      <text x={x + 20} y={85} textAnchor="middle" className={`text-xs font-mono ${isActive ? 'fill-accent' : isDone ? 'fill-positive' : 'fill-text-muted'}`}>
                        T{i + 1}
                      </text>
                    </g>
                  )
                })}
                {/* Input */}
                <text x={10} y={52} className="text-[10px] fill-text-muted">c₀</text>
                {/* Output */}
                <text x={215} y={52} textAnchor="end" className={`text-[10px] font-mono ${animationStep >= 4 ? 'fill-positive' : 'fill-text-muted'}`}>
                  c₄
                </text>
              </svg>

              <div className="text-xs text-text-muted text-center mt-2">
                Carry muss durch jeden Addierer
              </div>
            </div>

            {/* Bypass Path */}
            <div className={`p-4 rounded border-2 ${allPropagate ? 'border-positive' : 'border-border'} bg-surface`}>
              <div className="text-sm font-medium mb-3 flex items-center justify-between">
                <span>Carry Bypass</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  allPropagate && animationStep >= 1
                    ? 'bg-positive/20 text-positive'
                    : animationStep >= 4
                      ? 'bg-negative/20 text-negative'
                      : 'bg-surface-secondary text-text-muted'
                }`}>
                  {allPropagate ? (animationStep >= 1 ? '1 Takt!' : '0/1') : (animationStep >= 4 ? '4 Takte' : `${Math.min(animationStep, 4)}/4`)}
                </span>
              </div>

              <svg viewBox="0 0 220 120" className="w-full">
                {/* P signals and bypass line */}
                {allPropagate ? (
                  <>
                    {/* Bypass line - highlighted */}
                    <line
                      x1={20} y1={25} x2={200} y2={25}
                      className={`transition-all duration-500 ${animationStep >= 1 ? 'stroke-positive' : 'stroke-text-muted'}`}
                      strokeWidth={animationStep >= 1 ? 3 : 2}
                    />
                    {animationStep >= 1 && (
                      <text x={110} y={18} textAnchor="middle" className="text-xs fill-positive font-medium">
                        BYPASS AKTIV!
                      </text>
                    )}

                    {/* Adders (grayed out when bypass active) */}
                    {[0, 1, 2, 3].map(i => {
                      const x = 20 + i * 50
                      return (
                        <g key={i} className={animationStep >= 1 ? 'opacity-30' : ''}>
                          <rect
                            x={x} y={45} width={40} height={30} rx={3}
                            className="fill-surface-secondary stroke-border"
                            strokeWidth={1}
                          />
                          <text x={x + 20} y={64} textAnchor="middle" className="text-[8px] fill-text-muted font-mono">
                            FA{3-i}
                          </text>
                        </g>
                      )
                    })}

                    {/* P signals */}
                    {[0, 1, 2, 3].map(i => {
                      const x = 40 + i * 50
                      return (
                        <g key={`p-${i}`}>
                          <circle
                            cx={x} cy={95} r={10}
                            className="fill-positive/20 stroke-positive"
                            strokeWidth={2}
                          />
                          <text x={x} y={99} textAnchor="middle" className="text-[9px] fill-positive font-mono font-bold">
                            1
                          </text>
                        </g>
                      )
                    })}
                  </>
                ) : (
                  <>
                    {/* Normal path when bypass not possible */}
                    {[0, 1, 2, 3].map(i => {
                      const x = 20 + i * 50
                      const isActive = animationStep === (i + 1)
                      const isDone = animationStep > (i + 1)
                      return (
                        <g key={i}>
                          <rect
                            x={x} y={30} width={40} height={35} rx={3}
                            className={`transition-all duration-300 ${
                              isActive
                                ? 'fill-accent/30 stroke-accent'
                                : isDone
                                  ? 'fill-surface-tertiary stroke-text-muted'
                                  : 'fill-surface-secondary stroke-border'
                            }`}
                            strokeWidth={2}
                          />
                          <text x={x + 20} y={52} textAnchor="middle" className="text-[10px] fill-text-muted font-mono">
                            FA{3-i}
                          </text>
                          {i < 3 && (
                            <line
                              x1={x + 40} y1={47} x2={x + 50} y2={47}
                              className={`${isDone ? 'stroke-text-muted' : 'stroke-text-muted'}`}
                              strokeWidth={2}
                            />
                          )}
                        </g>
                      )
                    })}

                    {/* P signals showing blockage */}
                    {[0, 1, 2, 3].map(i => {
                      const x = 40 + i * 50
                      const pVal = p[3 - i]
                      return (
                        <g key={`p-${i}`}>
                          <circle
                            cx={x} cy={95} r={10}
                            className={pVal ? 'fill-positive/20 stroke-positive' : 'fill-negative/20 stroke-negative'}
                            strokeWidth={2}
                          />
                          <text x={x} y={99} textAnchor="middle" className={`text-[9px] font-mono font-bold ${pVal ? 'fill-positive' : 'fill-negative'}`}>
                            {pVal}
                          </text>
                        </g>
                      )
                    })}

                    <text x={110} y={18} textAnchor="middle" className="text-[10px] fill-negative">
                      Bypass blockiert (P≠1)
                    </text>
                  </>
                )}

                {/* Labels */}
                <text x={10} y={100} className="text-[8px] fill-text-muted">P₃ P₂ P₁ P₀</text>
              </svg>

              <div className="text-xs text-text-muted text-center mt-2">
                {allPropagate
                  ? 'Alle P=1 → Carry springt direkt!'
                  : 'Mindestens ein P=0 → kein Bypass'
                }
              </div>
            </div>
          </div>

          {/* Explanation for current step */}
          <ExplanationBox type={animationStep >= 5 ? (allPropagate ? 'success' : 'info') : 'info'}>
            {animationStep === 0 && (
              <p className="text-text-secondary">
                Klicke auf "Weiter" um den Vergleich zu starten. Beobachte wie der Carry propagiert.
              </p>
            )}
            {animationStep >= 1 && animationStep < 5 && !allPropagate && (
              <p className="text-text-secondary">
                <strong>Schritt {animationStep}:</strong> Bei Ripple Carry muss jeder Full Adder auf den vorherigen warten.
                Da nicht alle P=1 sind, funktioniert der Bypass nicht.
              </p>
            )}
            {animationStep >= 1 && animationStep < 5 && allPropagate && (
              <p className="text-text-secondary">
                <strong>Schritt {animationStep}:</strong> Alle P-Signale sind 1! Der Bypass leitet c₀ direkt zu c₄ weiter —
                in nur <strong className="text-positive">1 Takt</strong> statt 4!
              </p>
            )}
            {animationStep >= 5 && (
              <>
                <p className="font-medium text-accent">Ergebnis</p>
                <p className="text-text-secondary mt-1">
                  {allPropagate
                    ? <>Ripple Carry: 4 Takte | <strong className="text-positive">Bypass: 1 Takt</strong> — 4× schneller!</>
                    : <>Ohne Bypass: Beide Methoden brauchen 4 Takte. Der Bypass hilft nur wenn alle P=1 sind.</>
                  }
                </p>
              </>
            )}
          </ExplanationBox>
        </div>
      )}

      {/* Benefit */}
      {step >= 1 && animationStep >= 5 && (
        <ExplanationBox>
          <p className="font-medium text-text-secondary">Praxis-Tipp</p>
          <p className="text-text-secondary mt-2">
            In echten Prozessoren teilt man die Bits in <strong>Gruppen</strong> (z.B. 4 Bit).
            Jede Gruppe hat ihren eigenen Bypass.
          </p>
          <p className="text-text-secondary mt-2 text-sm">
            Bei 64 Bit mit 4-Bit-Gruppen: Statt 64 Schritte im Worst-Case nur ~16 + einige Gruppen-Übersprünge.
            Das ist ein guter Kompromiss zwischen Hardware-Aufwand und Geschwindigkeit.
          </p>
        </ExplanationBox>
      )}
    </div>
  )
}

// ============================================
// CHAPTER 6: CARRY SELECT
// ============================================
function Chapter6CarrySelect({ onComplete }) {
  const [a, setA] = useState(11)
  const [b, setB] = useState(6)
  const [step, setStep] = useState(0)

  // Results for both cases
  const result0 = a + b
  const result1 = a + b + 1

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <ExplanationBox>
        <p className="text-text-secondary">
          Eine andere Idee: <strong>Was wenn wir beide Möglichkeiten gleichzeitig berechnen?</strong>
        </p>
      </ExplanationBox>

      <div className="flex items-center gap-6 flex-wrap">
        <BitInput label="A" value={a} onChange={setA} bits={4} />
        <span className="text-xl text-text-muted">+</span>
        <BitInput label="B" value={b} onChange={setB} bits={4} />
      </div>

      {/* The idea */}
      <ExplanationBox type={step >= 1 ? 'aha' : 'info'}>
        <p className="text-text-secondary">
          Das Problem: Wir wissen nicht, ob c_in = 0 oder c_in = 1 sein wird.
        </p>
        <p className="text-text-secondary mt-2">
          Die Lösung: Berechne <strong>beides parallel</strong> und wähle am Ende!
        </p>
        {step === 0 && (
          <button onClick={() => setStep(1)} className="mt-2 text-sm text-accent hover:underline">
            Zeige wie →
          </button>
        )}
      </ExplanationBox>

      {/* Parallel computation visualization */}
      {step >= 1 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`p-4 rounded border-2 ${step >= 2 ? 'border-positive bg-positive/10' : 'border-border bg-surface-secondary'}`}>
            <div className="text-sm text-text-muted mb-2">Addierer mit c_in = 0</div>
            <div className="text-3xl font-mono text-center">
              {a} + {b} = <span className="text-positive">{result0}</span>
            </div>
            <div className="text-xs text-text-muted text-center mt-1">
              ({result0.toString(2).padStart(5, '0')})
            </div>
          </div>

          <div className={`p-4 rounded border-2 ${step >= 2 ? 'border-border bg-surface-secondary' : 'border-border bg-surface-secondary'}`}>
            <div className="text-sm text-text-muted mb-2">Addierer mit c_in = 1</div>
            <div className="text-3xl font-mono text-center">
              {a} + {b} + 1 = <span className="text-text-secondary">{result1}</span>
            </div>
            <div className="text-xs text-text-muted text-center mt-1">
              ({result1.toString(2).padStart(5, '0')})
            </div>
          </div>
        </div>
      )}

      {/* MUX selection */}
      {step >= 1 && (
        <div className="text-center">
          <svg viewBox="0 0 300 100" className="w-full max-w-sm mx-auto">
            {/* Lines from adders */}
            <line x1={50} y1={10} x2={100} y2={40} className="stroke-text-muted" strokeWidth={2} />
            <line x1={250} y1={10} x2={200} y2={40} className="stroke-text-muted" strokeWidth={2} />

            {/* MUX */}
            <rect x={100} y={30} width={100} height={50} rx={4}
              className="fill-surface-secondary stroke-border" strokeWidth={2}
            />
            <text x={150} y={55} textAnchor="middle" className="text-sm fill-text-secondary font-mono">
              MUX
            </text>
            <text x={150} y={72} textAnchor="middle" className="text-xs fill-text-muted">
              sel = c_in
            </text>

            {/* Output */}
            <line x1={150} y1={80} x2={150} y2={95}
              className={`${step >= 2 ? 'stroke-positive' : 'stroke-text-muted'}`} strokeWidth={2}
            />
          </svg>

          {step === 1 && (
            <button onClick={() => setStep(2)} className="mt-2 text-sm text-accent hover:underline">
              c_in = 0 eintrifft →
            </button>
          )}
          {step >= 2 && (
            <p className="text-positive font-medium">
              c_in = 0 → MUX wählt Ergebnis {result0}
            </p>
          )}
        </div>
      )}

      {/* Metaphor */}
      {step >= 2 && (
        <ExplanationBox type="aha">
          <p className="font-medium text-accent">Die Zwei-Köche-Metapher</p>
          <p className="text-text-secondary mt-2">
            Stell dir zwei Köche vor, die das gleiche Gericht zubereiten:
          </p>
          <ul className="text-text-secondary mt-2 text-sm list-disc list-inside space-y-1">
            <li>Koch 1 bereitet es <strong>ohne Salz</strong> zu</li>
            <li>Koch 2 bereitet es <strong>mit Salz</strong> zu</li>
          </ul>
          <p className="text-text-secondary mt-2">
            Wenn der Gast kommt und sagt "ohne Salz bitte", servieren wir sofort von Koch 1.
            Keine Wartezeit!
          </p>
        </ExplanationBox>
      )}

      {/* Trade-off */}
      {step >= 2 && (
        <ExplanationBox>
          <p className="font-medium text-text-secondary">Der Trade-off</p>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <span className="text-positive">Vorteil:</span>
              <p className="text-text-secondary text-sm">Schneller — kein Warten auf den Carry</p>
            </div>
            <div>
              <span className="text-negative">Nachteil:</span>
              <p className="text-text-secondary text-sm">Doppelte Hardware (zwei Addierer)</p>
            </div>
          </div>
        </ExplanationBox>
      )}
    </div>
  )
}

// ============================================
// CHAPTER 7: PARALLEL PREFIX
// ============================================
function Chapter7ParallelPrefix({ onComplete }) {
  const [a, setA] = useState(13)
  const [b, setB] = useState(7)
  const [step, setStep] = useState(0)

  const aBits = [(a >> 3) & 1, (a >> 2) & 1, (a >> 1) & 1, a & 1]
  const bBits = [(b >> 3) & 1, (b >> 2) & 1, (b >> 1) & 1, b & 1]

  // G and P for each bit
  const g = aBits.map((ai, i) => ai & bBits[i])
  const p = aBits.map((ai, i) => ai ^ bBits[i])

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <ExplanationBox>
        <p className="text-text-secondary">
          Die eleganteste Lösung: <strong>Alle Carries parallel berechnen</strong> mit einer Baumstruktur.
        </p>
      </ExplanationBox>

      <div className="flex items-center gap-6 flex-wrap">
        <BitInput label="A" value={a} onChange={setA} bits={4} />
        <span className="text-xl text-text-muted">+</span>
        <BitInput label="B" value={b} onChange={setB} bits={4} />
      </div>

      {/* G and P explanation */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">Generate und Propagate</h3>

        <ExplanationBox type={step >= 1 ? 'aha' : 'info'}>
          <p className="text-text-secondary">
            Zwei wichtige Signale pro Bit-Position:
          </p>
          <ul className="text-text-secondary mt-2 text-sm list-disc list-inside space-y-1">
            <li><strong>Generate (G)</strong>: Ein Carry wird <em>erzeugt</em> wenn A=1 UND B=1</li>
            <li><strong>Propagate (P)</strong>: Ein Carry wird <em>weitergeleitet</em> wenn A=1 XOR B=1</li>
          </ul>
          {step === 0 && (
            <button onClick={() => setStep(1)} className="mt-2 text-sm text-accent hover:underline">
              Zeige G und P →
            </button>
          )}
        </ExplanationBox>
      </div>

      {/* G/P values */}
      {step >= 1 && (
        <div className="bg-surface-secondary rounded p-4">
          <div className="flex justify-center gap-8">
            {[3, 2, 1, 0].map(i => (
              <div key={i} className="text-center">
                <div className="text-xs text-text-muted mb-1">Bit {i}</div>
                <div className="font-mono text-sm text-text-muted">
                  {aBits[3 - i]} & {bBits[3 - i]} = G
                </div>
                <div className={`text-xl font-bold ${g[3 - i] ? 'text-positive' : 'text-text-muted'}`}>
                  G{i} = {g[3 - i]}
                </div>
                <div className="font-mono text-sm text-text-muted mt-2">
                  {aBits[3 - i]} ⊕ {bBits[3 - i]} = P
                </div>
                <div className={`text-xl font-bold ${p[3 - i] ? 'text-accent' : 'text-text-muted'}`}>
                  P{i} = {p[3 - i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key insight */}
      {step >= 1 && (
        <ExplanationBox type={step >= 2 ? 'aha' : 'info'}>
          <p className="font-medium text-accent">Die Schlüsseleinsicht</p>
          <p className="text-text-secondary mt-2">
            G und P lassen sich <strong>kombinieren</strong>! Für zwei benachbarte Bereiche [i:j] und [j-1:k]:
          </p>
          <div className="font-mono text-sm mt-2 p-2 bg-surface rounded">
            <p>G[i:k] = G[i:j] ∨ (P[i:j] ∧ G[j-1:k])</p>
            <p>P[i:k] = P[i:j] ∧ P[j-1:k]</p>
          </div>
          {step === 1 && (
            <button onClick={() => setStep(2)} className="mt-2 text-sm text-accent hover:underline">
              Warum ist das wichtig? →
            </button>
          )}
        </ExplanationBox>
      )}

      {/* Tree structure */}
      {step >= 2 && (
        <>
          <ExplanationBox type="aha">
            <p className="font-medium text-accent">Die Baumstruktur</p>
            <p className="text-text-secondary mt-2">
              Weil die Kombination <strong>assoziativ</strong> ist, können wir einen Baum aufbauen!
            </p>
            <p className="text-text-secondary mt-2">
              Statt O(n) Schritte nacheinander: <strong>O(log n)</strong> parallele Ebenen.
            </p>
          </ExplanationBox>

          {/* Simple tree visualization */}
          <svg viewBox="0 0 400 200" className="w-full max-w-md mx-auto bg-surface rounded border border-border">
            {/* Level 0 - individual G/P */}
            <text x={10} y={35} className="text-xs fill-text-muted">L0</text>
            {[0, 1, 2, 3].map(i => {
              const x = 60 + i * 90
              return (
                <g key={`l0-${i}`}>
                  <rect x={x} y={20} width={50} height={30} rx={4}
                    className="fill-surface-secondary stroke-border" strokeWidth={1}
                  />
                  <text x={x + 25} y={40} textAnchor="middle" className="text-xs fill-text-secondary font-mono">
                    G{3-i},P{3-i}
                  </text>
                </g>
              )
            })}

            {/* Level 1 - pairs */}
            <text x={10} y={95} className="text-xs fill-text-muted">L1</text>
            {[0, 1].map(i => {
              const x = 105 + i * 180
              return (
                <g key={`l1-${i}`}>
                  <line x1={60 + i * 180 + 25} y1={50} x2={x + 25} y2={70} className="stroke-text-muted" strokeWidth={1} />
                  <line x1={150 + i * 180 + 25} y1={50} x2={x + 25} y2={70} className="stroke-text-muted" strokeWidth={1} />
                  <rect x={x} y={70} width={50} height={30} rx={4}
                    className="fill-accent/20 stroke-accent" strokeWidth={1}
                  />
                  <text x={x + 25} y={90} textAnchor="middle" className="text-xs fill-accent font-mono">
                    {i === 0 ? 'G3:2' : 'G1:0'}
                  </text>
                </g>
              )
            })}

            {/* Level 2 - final */}
            <text x={10} y={155} className="text-xs fill-text-muted">L2</text>
            <line x1={130} y1={100} x2={200} y2={120} className="stroke-text-muted" strokeWidth={1} />
            <line x1={310} y1={100} x2={200} y2={120} className="stroke-text-muted" strokeWidth={1} />
            <rect x={175} y={120} width={50} height={30} rx={4}
              className="fill-positive/20 stroke-positive" strokeWidth={2}
            />
            <text x={200} y={140} textAnchor="middle" className="text-xs fill-positive font-mono">
              G3:0
            </text>

            {/* Result */}
            <text x={200} y={175} textAnchor="middle" className="text-sm fill-positive">
              c₄ = G3:0
            </text>
          </svg>
        </>
      )}

      {/* Complexity comparison */}
      {step >= 2 && (
        <div className="grid md:grid-cols-2 gap-4">
          <ExplanationBox type="problem">
            <p className="font-medium text-negative">Ripple Carry</p>
            <p className="font-mono text-2xl mt-2">O(n) = {4} Stufen</p>
            <p className="text-sm text-text-muted mt-1">Sequentiell, einer nach dem anderen</p>
          </ExplanationBox>

          <ExplanationBox type="aha">
            <p className="font-medium text-accent">Parallel Prefix</p>
            <p className="font-mono text-2xl mt-2">O(log n) = {Math.ceil(Math.log2(4))} Stufen</p>
            <p className="text-sm text-text-muted mt-1">Parallel, Baumstruktur</p>
          </ExplanationBox>
        </div>
      )}

      {step >= 2 && (
        <ExplanationBox>
          <p className="text-text-secondary">
            Bei 64 Bit: Ripple Carry braucht 64 Stufen, Parallel Prefix nur ~6!
          </p>
          <p className="text-text-secondary mt-2">
            Es gibt verschiedene Prefix-Strukturen (Kogge-Stone, Brent-Kung, etc.) mit unterschiedlichen Trade-offs zwischen Tiefe und Anzahl der Gatter.
          </p>
        </ExplanationBox>
      )}
    </div>
  )
}

// ============================================
// CHAPTER 8: CARRY SAVE
// ============================================
function Chapter8CarrySave({ onComplete }) {
  const [a, setA] = useState(7)
  const [b, setB] = useState(9)
  const [c, setC] = useState(5)
  const [step, setStep] = useState(0)

  const aBits = [(a >> 3) & 1, (a >> 2) & 1, (a >> 1) & 1, a & 1]
  const bBits = [(b >> 3) & 1, (b >> 2) & 1, (b >> 1) & 1, b & 1]
  const cBits = [(c >> 3) & 1, (c >> 2) & 1, (c >> 1) & 1, c & 1]

  // CSA outputs
  const sumBits = aBits.map((ai, i) => ai ^ bBits[i] ^ cBits[i])
  const carryBits = aBits.map((ai, i) => (ai & bBits[i]) | (ai & cBits[i]) | (bBits[i] & cBits[i]))

  const sumNum = sumBits.reduce((acc, b, i) => acc + (b << (3 - i)), 0)
  const carryNum = carryBits.reduce((acc, b, i) => acc + (b << (4 - i)), 0) // shifted left

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <ExplanationBox>
        <p className="text-text-secondary">
          Ein spezieller Addierer für <strong>Multiplikation</strong>:
          Wie addiert man viele Zahlen gleichzeitig?
        </p>
      </ExplanationBox>

      <div className="flex items-center gap-4 flex-wrap">
        <BitInput label="A" value={a} onChange={setA} bits={4} />
        <span className="text-text-muted">+</span>
        <BitInput label="B" value={b} onChange={setB} bits={4} />
        <span className="text-text-muted">+</span>
        <BitInput label="C" value={c} onChange={setC} bits={4} />
        <span className="text-text-muted">=</span>
        <span className="font-mono text-xl">{a + b + c}</span>
      </div>

      {/* The problem with multiple additions */}
      <ExplanationBox type={step >= 1 ? 'aha' : 'info'}>
        <p className="font-medium text-text-secondary">Das Problem bei Multiplikation</p>
        <p className="text-text-secondary mt-2">
          Bei der Multiplikation entstehen viele Partialprodukte, die addiert werden müssen.
          Wenn wir jedes Paar einzeln addieren, stapeln sich die Carry-Propagationen.
        </p>
        {step === 0 && (
          <button onClick={() => setStep(1)} className="mt-2 text-sm text-accent hover:underline">
            Zeige ein Beispiel →
          </button>
        )}
      </ExplanationBox>

      {/* Multiplication Example */}
      {step >= 1 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary">Beispiel: Binäre Multiplikation</h3>

          <div className="bg-surface-secondary rounded p-4">
            <div className="font-mono text-sm space-y-1 max-w-xs mx-auto">
              <div className="flex justify-end items-center gap-2">
                <span className="text-text-muted text-xs">(3)</span>
                <span className="text-accent">1 1</span>
              </div>
              <div className="flex justify-end items-center gap-2">
                <span className="text-text-muted text-xs">(2)</span>
                <span>× <span className="text-accent">1 0</span></span>
              </div>
              <div className="border-t border-border my-1"></div>
              <div className="flex justify-end items-center gap-2">
                <span className="text-text-muted text-xs">3×0</span>
                <span className="text-text-muted">0 0</span>
              </div>
              <div className="flex justify-end items-center gap-2">
                <span className="text-text-muted text-xs">3×1, shift</span>
                <span className="text-positive">1 1 <span className="text-text-muted">·</span></span>
              </div>
              <div className="border-t border-border my-1"></div>
              <div className="flex justify-end items-center gap-2">
                <span className="text-text-muted text-xs">(6)</span>
                <span className="text-positive font-bold">1 1 0</span>
              </div>
            </div>

            <p className="text-xs text-text-muted text-center mt-3">
              2 Bits × 2 Bits = 2 Partialprodukte
            </p>
          </div>

          <ExplanationBox type="problem">
            <p className="font-medium text-negative">Das skaliert schlecht!</p>
            <div className="grid grid-cols-3 gap-4 mt-3 text-center text-sm">
              <div>
                <div className="font-mono text-lg">4×4</div>
                <div className="text-text-muted">4 Partialprodukte</div>
              </div>
              <div>
                <div className="font-mono text-lg">8×8</div>
                <div className="text-text-muted">8 Partialprodukte</div>
              </div>
              <div>
                <div className="font-mono text-lg text-negative">32×32</div>
                <div className="text-text-muted">32 Partialprodukte!</div>
              </div>
            </div>
            <p className="text-text-secondary mt-3 text-sm">
              All diese Zahlen müssen addiert werden. Mit normalen Addierern: n-1 Additionen, jede mit Carry-Propagation!
            </p>
          </ExplanationBox>
        </div>
      )}

      {/* CSA concept */}
      {step >= 1 && (
        <>
          <h3 className="text-sm font-medium text-text-secondary">Die Lösung: Carry-Save Adder (CSA)</h3>

          <ExplanationBox type="aha">
            <p className="font-medium text-accent">Die Idee</p>
            <p className="text-text-secondary mt-2">
              Statt den Carry zu propagieren, <strong>speichern</strong> wir ihn!
            </p>
            <ul className="text-text-secondary mt-2 text-sm list-disc list-inside space-y-1">
              <li>3 Eingänge → 2 Ausgänge (Sum + Carry-Vektor)</li>
              <li>Alle Bit-Positionen parallel, <strong>KEINE</strong> Carry-Propagation</li>
              <li>Der Carry wird zur nächsten Position "gespeichert" (verschoben)</li>
            </ul>
          </ExplanationBox>

          <p className="text-sm text-text-secondary">
            Teste den CSA mit den Werten A, B, C oben — beobachte wie 3 Zahlen zu 2 Zahlen werden:
          </p>

          {/* CSA visualization */}
          <div className="bg-surface-secondary rounded p-4">
            <div className="flex justify-center gap-4">
              {[3, 2, 1, 0].map(i => (
                <div key={i} className="text-center p-2 bg-surface rounded">
                  <div className="text-xs text-text-muted mb-1">Bit {i}</div>
                  <div className="font-mono text-sm">
                    {aBits[3 - i]} ⊕ {bBits[3 - i]} ⊕ {cBits[3 - i]}
                  </div>
                  <div className="text-lg font-bold text-accent">
                    S{i} = {sumBits[3 - i]}
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    Maj = {carryBits[3 - i]}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-text-muted">Ergebnis:</p>
              <p className="font-mono">
                Sum = {sumNum} ({sumNum.toString(2).padStart(4, '0')})
              </p>
              <p className="font-mono">
                Carry = {carryNum} ({carryNum.toString(2).padStart(5, '0')}) ← um 1 nach links verschoben!
              </p>
            </div>
          </div>
        </>
      )}

      {/* Final addition */}
      {step >= 1 && (
        <ExplanationBox>
          <p className="font-medium text-text-secondary">Der letzte Schritt</p>
          <p className="text-text-secondary mt-2">
            Jetzt haben wir nur noch <strong>zwei Zahlen</strong> zu addieren:
          </p>
          <p className="font-mono text-center text-lg mt-2">
            {sumNum} + {carryNum} = <span className="text-positive">{sumNum + carryNum}</span>
          </p>
          <p className="text-text-secondary mt-2 text-sm">
            Diese letzte Addition braucht Carry-Propagation, aber nur einmal am Ende — nicht bei jedem Zwischenschritt.
          </p>
        </ExplanationBox>
      )}

      {/* Use case */}
      {step >= 1 && (
        <ExplanationBox type="aha">
          <p className="font-medium text-accent">Anwendung: Multiplizierer</p>
          <p className="text-text-secondary mt-2">
            In einem Multiplizierer gibt es oft 8, 16 oder mehr Partialprodukte.
            CSA-Bäume (Wallace Trees, Dadda Trees) reduzieren diese effizient:
          </p>
          <p className="text-center font-mono text-lg mt-2">
            n Zahlen → 2 Zahlen in O(log n) Schritten
          </p>
          <p className="text-text-secondary mt-2 text-sm">
            Erst ganz am Ende brauchen wir einen "normalen" Addierer mit Carry-Propagation.
          </p>
        </ExplanationBox>
      )}
    </div>
  )
}
