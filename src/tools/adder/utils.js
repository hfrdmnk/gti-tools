// Bit manipulation helpers

export function toBits(num, width = 4) {
  // Convert number to array of bits [MSB, ..., LSB]
  const bits = []
  for (let i = width - 1; i >= 0; i--) {
    bits.push((num >> i) & 1)
  }
  return bits
}

export function bitsToNum(bits) {
  // Convert array of bits to number
  let num = 0
  for (let i = 0; i < bits.length; i++) {
    num = (num << 1) | bits[i]
  }
  return num
}

export function toBinaryString(num, width = 4) {
  return num.toString(2).padStart(width, '0')
}

// Adder type configurations
export const ADDER_TYPES = [
  { id: 'ripple', name: 'Ripple Carry', desc: 'Sequentielle Carry-Propagation' },
  { id: 'bypass', name: 'Carry Bypass', desc: 'Mit Propagate-Bypass' },
  { id: 'select', name: 'Carry Select', desc: 'Parallele Addierer + MUX' },
  { id: 'prefix', name: 'Parallel Prefix', desc: 'Generate/Propagate Baum' },
  { id: 'wallace', name: 'Wallace Tree', desc: 'Carry-Save für 3 Summanden' },
]

// Default values for each adder type
export const DEFAULT_VALUES = {
  ripple: { a: 7, b: 9 },    // Full carry chain
  bypass: { a: 7, b: 9 },    // Compare with ripple
  select: { a: 11, b: 6 },   // Shows MUX selection
  prefix: { a: 13, b: 7 },   // Complex G/P patterns
  wallace: { a: 7, b: 9, c: 5 }, // Three inputs
}

// ============================================
// RIPPLE CARRY ADDER
// ============================================
export function generateRippleCarrySteps(a, b, cin = 0) {
  const steps = []
  const aBits = toBits(a, 4)
  const bBits = toBits(b, 4)

  // Step 0: Introduction
  steps.push({
    title: 'Start',
    desc: 'Der Ripple-Carry-Addierer berechnet die Summe sequentiell von rechts nach links. Der Übertrag "rieselt" durch alle Stufen.',
    detail: `A = ${a} (${toBinaryString(a)}), B = ${b} (${toBinaryString(b)})`,
    activeComponents: [],
    values: { carries: [cin], sums: [], computed: [] }
  })

  // Steps 1-4: Each adder stage (right to left)
  let carries = [cin]
  let sums = []

  for (let i = 0; i < 4; i++) {
    const ai = aBits[3 - i]  // LSB first
    const bi = bBits[3 - i]
    const ci = carries[i]
    const sum = ai ^ bi ^ ci
    const cout = (ai & bi) | (ai & ci) | (bi & ci)

    sums.push(sum)
    carries.push(cout)

    const isHA = (i === 0 && cin === 0)
    const computed = [...Array(i + 1).keys()] // [0], [0,1], [0,1,2], [0,1,2,3]

    steps.push({
      title: isHA ? `Halbaddierer (Bit ${i})` : `Volladdierer ${i}`,
      desc: isHA
        ? `Der Halbaddierer berechnet s₀ und c₁ aus a₀ und b₀ (kein Eingangs-Carry).`
        : `Der Volladdierer berechnet s${i} und c${i + 1} aus a${i}, b${i} und dem Carry c${i}.`,
      detail: isHA
        ? `${ai} ⊕ ${bi} = s₀=${sum}, ${ai} ∧ ${bi} = c₁=${cout}`
        : `${ai} ⊕ ${bi} ⊕ ${ci} = s${i}=${sum}, c${i + 1}=${cout}`,
      activeComponents: [`adder-${i}`],
      values: {
        carries: [...carries],
        sums: [...sums],
        computed,
        currentBit: i
      }
    })
  }

  // Final step
  const result = a + b + cin
  steps.push({
    title: 'Ergebnis',
    desc: 'Die Addition ist abgeschlossen. Der finale Übertrag c₄ ist das Overflow-Bit.',
    detail: `${a} + ${b} = ${result} (${toBinaryString(result, 5)})`,
    activeComponents: ['adder-0', 'adder-1', 'adder-2', 'adder-3'],
    values: { carries, sums, computed: [0, 1, 2, 3] },
    isFinal: true,
    result
  })

  return steps
}

// ============================================
// CARRY BYPASS ADDER
// ============================================
export function generateCarryBypassSteps(a, b, cin = 0) {
  const steps = []
  const aBits = toBits(a, 4)
  const bBits = toBits(b, 4)

  // Step 0: Introduction
  steps.push({
    title: 'Carry-Bypass Konzept',
    desc: 'Der Carry-Bypass-Addierer berechnet Propagate-Signale vorab. Wenn alle P=1, wird der Carry direkt durchgereicht (Bypass).',
    detail: `A = ${a} (${toBinaryString(a)}), B = ${b} (${toBinaryString(b)})`,
    activeComponents: [],
    values: { carries: [cin], sums: [], propagate: [], computed: [] }
  })

  // Step 1: Compute P signals
  const p = []
  for (let i = 0; i < 4; i++) {
    p.push(aBits[3 - i] ^ bBits[3 - i])
  }

  steps.push({
    title: 'Propagate-Signale berechnen',
    desc: 'P_i = a_i ⊕ b_i zeigt an, ob ein Carry weitergeleitet wird (falls c_{i-1}=1).',
    detail: `P = [${p.join(', ')}]`,
    activeComponents: ['p-calc'],
    values: { carries: [cin], sums: [], propagate: [...p], computed: [] }
  })

  // Step 2: Check bypass condition
  const bypassActive = p.every(pi => pi === 1)

  steps.push({
    title: 'Bypass-Bedingung prüfen',
    desc: bypassActive
      ? 'Alle P=1! Der Bypass ist aktiv: c₄ = c₀ (der Carry wird direkt durchgereicht).'
      : 'Nicht alle P=1. Der Bypass ist nicht aktiv, normale Ripple-Berechnung.',
    detail: `P_all = ${p.join(' ∧ ')} = ${bypassActive ? 1 : 0}`,
    activeComponents: bypassActive ? ['bypass-path'] : ['ripple-path'],
    values: { carries: [cin], sums: [], propagate: [...p], bypassActive, computed: [] }
  })

  // Steps 3-6: Compute sums (can be parallel since carries are known via bypass)
  let carries = [cin]
  let sums = []

  for (let i = 0; i < 4; i++) {
    const ai = aBits[3 - i]
    const bi = bBits[3 - i]
    const ci = carries[i]
    const sum = ai ^ bi ^ ci
    const cout = (ai & bi) | (ai & ci) | (bi & ci)

    sums.push(sum)
    carries.push(cout)

    steps.push({
      title: `Berechne Bit ${i}`,
      desc: `Summe s${i} = a${i} ⊕ b${i} ⊕ c${i}`,
      detail: `${ai} ⊕ ${bi} ⊕ ${ci} = ${sum}`,
      activeComponents: [`adder-${i}`],
      values: {
        carries: [...carries],
        sums: [...sums],
        propagate: [...p],
        bypassActive,
        computed: [...Array(i + 1).keys()],
        currentBit: i
      }
    })
  }

  // Final step
  const result = a + b + cin
  steps.push({
    title: 'Ergebnis',
    desc: bypassActive
      ? 'Durch den aktiven Bypass war c₄ sofort bekannt - nur die Summen mussten berechnet werden.'
      : 'Der Bypass war nicht aktiv. Die Berechnung verlief wie beim Ripple-Carry.',
    detail: `${a} + ${b} = ${result}`,
    activeComponents: ['adder-0', 'adder-1', 'adder-2', 'adder-3'],
    values: { carries, sums, propagate: [...p], bypassActive, computed: [0, 1, 2, 3] },
    isFinal: true,
    result
  })

  return steps
}

// ============================================
// CARRY SELECT ADDER
// ============================================
export function generateCarrySelectSteps(a, b, cin = 0) {
  const steps = []
  const aBits = toBits(a, 4)
  const bBits = toBits(b, 4)

  // Step 0: Introduction
  steps.push({
    title: 'Carry-Select Konzept',
    desc: 'Zwei parallele Addierer berechnen gleichzeitig: einer mit c_in=0, einer mit c_in=1. Ein MUX wählt das richtige Ergebnis basierend auf dem echten Carry.',
    detail: `A = ${a} (${toBinaryString(a)}), B = ${b} (${toBinaryString(b)})`,
    activeComponents: [],
    values: { phase: 'intro' }
  })

  // Helper to compute addition result
  const addBits = (aBits, bBits, cin) => {
    let carries = [cin]
    let sums = []
    for (let i = 0; i < 4; i++) {
      const ai = aBits[3 - i]
      const bi = bBits[3 - i]
      const ci = carries[i]
      sums.push(ai ^ bi ^ ci)
      carries.push((ai & bi) | (ai & ci) | (bi & ci))
    }
    return { sums, carries, result: bitsToNum(sums.reverse()) }
  }

  // Step 1: Show parallel computation with cin=0
  const result0 = addBits(aBits, bBits, 0)
  steps.push({
    title: 'Addiernetz mit c_in=0',
    desc: 'Das erste Addiernetz nimmt an, dass kein Eingangs-Carry existiert.',
    detail: `Ergebnis: S=${toBinaryString(result0.result)}, c_out=${result0.carries[4]}`,
    activeComponents: ['adder-block-0'],
    values: {
      result0,
      phase: 'compute0',
      sums0: result0.sums,
      cout0: result0.carries[4]
    }
  })

  // Step 2: Show parallel computation with cin=1
  const result1 = addBits(aBits, bBits, 1)
  steps.push({
    title: 'Addiernetz mit c_in=1',
    desc: 'Das zweite Addiernetz nimmt an, dass ein Eingangs-Carry existiert. Beide Berechnungen laufen parallel!',
    detail: `Ergebnis: S=${toBinaryString(result1.result)}, c_out=${result1.carries[4]}`,
    activeComponents: ['adder-block-1'],
    values: {
      result0,
      result1,
      phase: 'compute1',
      sums0: result0.sums,
      cout0: result0.carries[4],
      sums1: result1.sums,
      cout1: result1.carries[4]
    }
  })

  // Step 3: MUX selection
  const selectedResult = cin === 0 ? result0 : result1
  steps.push({
    title: 'MUX-Auswahl',
    desc: `Der tatsächliche c_in=${cin}. Der MUX wählt das Ergebnis vom Addiernetz ${cin}.`,
    detail: `Gewählt: S=${toBinaryString(selectedResult.result)} vom Netz ${cin}`,
    activeComponents: ['mux', `adder-block-${cin}`],
    values: {
      result0,
      result1,
      selectedResult,
      phase: 'mux',
      selected: cin,
      sums0: result0.sums,
      cout0: result0.carries[4],
      sums1: result1.sums,
      cout1: result1.carries[4]
    }
  })

  // Final step
  const result = a + b + cin
  steps.push({
    title: 'Ergebnis',
    desc: 'Die Carry-Select-Technik reduziert die Latenz: Statt auf jeden Carry zu warten, werden beide Möglichkeiten vorberechnet.',
    detail: `${a} + ${b} + ${cin} = ${result}`,
    activeComponents: ['mux', `adder-block-${cin}`],
    values: {
      result0,
      result1,
      selectedResult,
      phase: 'final',
      selected: cin,
      sums0: result0.sums,
      cout0: result0.carries[4],
      sums1: result1.sums,
      cout1: result1.carries[4]
    },
    isFinal: true,
    result
  })

  return steps
}

// ============================================
// PARALLEL PREFIX ADDER
// ============================================
export function generateParallelPrefixSteps(a, b, cin = 0) {
  const steps = []
  const aBits = toBits(a, 4)
  const bBits = toBits(b, 4)

  // Step 0: Introduction
  steps.push({
    title: 'Parallel Prefix Konzept',
    desc: 'Der Parallel-Prefix-Addierer nutzt Generate (G) und Propagate (P) Signale. Durch parallele Prefix-Berechnung sind alle Carries gleichzeitig verfügbar.',
    detail: `A = ${a} (${toBinaryString(a)}), B = ${b} (${toBinaryString(b)})`,
    activeComponents: [],
    values: { phase: 'intro' }
  })

  // Step 1: Compute initial G and P
  const g = []  // Generate: g_i = a_i AND b_i
  const p = []  // Propagate: p_i = a_i XOR b_i

  for (let i = 0; i < 4; i++) {
    const ai = aBits[3 - i]
    const bi = bBits[3 - i]
    g.push(ai & bi)
    p.push(ai ^ bi)
  }

  steps.push({
    title: 'G/P-Signale berechnen',
    desc: 'Generate g_i = a_i ∧ b_i (Carry wird erzeugt). Propagate p_i = a_i ⊕ b_i (Carry wird weitergeleitet).',
    detail: `G = [${g.join(',')}], P = [${p.join(',')}]`,
    activeComponents: ['gp-initial'],
    values: {
      generate: [...g],
      propagate: [...p],
      phase: 'gp'
    }
  })

  // Step 2: Prefix Level 1 - combine adjacent pairs
  // GP(i:j) = (G_i + P_i * G_j, P_i * P_j)
  // For 4 bits: compute (3:2), (1:0)
  const gp_3_2 = { g: g[3] | (p[3] & g[2]), p: p[3] & p[2] }
  const gp_1_0 = { g: g[1] | (p[1] & g[0]), p: p[1] & p[0] }

  steps.push({
    title: 'Prefix-Ebene 1',
    desc: 'Kombiniere benachbarte Paare: G_{i:j} = G_i + P_i·G_j, P_{i:j} = P_i·P_j',
    detail: `G_{3:2}=${gp_3_2.g}, P_{3:2}=${gp_3_2.p} | G_{1:0}=${gp_1_0.g}, P_{1:0}=${gp_1_0.p}`,
    activeComponents: ['prefix-level-1'],
    values: {
      generate: [...g],
      propagate: [...p],
      gp_3_2,
      gp_1_0,
      phase: 'prefix1'
    }
  })

  // Step 3: Prefix Level 2 - final combination
  // Compute (3:0) from (3:2) and (1:0)
  const gp_3_0 = {
    g: gp_3_2.g | (gp_3_2.p & gp_1_0.g),
    p: gp_3_2.p & gp_1_0.p
  }

  steps.push({
    title: 'Prefix-Ebene 2',
    desc: 'Finale Prefix-Kombination: G_{3:0} enthält die Information für c₄.',
    detail: `G_{3:0}=${gp_3_0.g}, P_{3:0}=${gp_3_0.p}`,
    activeComponents: ['prefix-level-2'],
    values: {
      generate: [...g],
      propagate: [...p],
      gp_3_2,
      gp_1_0,
      gp_3_0,
      phase: 'prefix2'
    }
  })

  // Step 4: Compute all carries
  // c_i = G_{i-1:0} + P_{i-1:0} * c_in
  const carries = [cin]
  carries.push(g[0] | (p[0] & cin))                              // c1
  carries.push(gp_1_0.g | (gp_1_0.p & cin))                      // c2
  carries.push(g[2] | (p[2] & gp_1_0.g) | (p[2] & gp_1_0.p & cin)) // c3
  carries.push(gp_3_0.g | (gp_3_0.p & cin))                      // c4

  steps.push({
    title: 'Carries berechnen',
    desc: 'Alle Carries sind jetzt parallel verfügbar: c_i = G_{i-1:0} + P_{i-1:0}·c₀',
    detail: `Carries: c=[${carries.join(',')}]`,
    activeComponents: ['carry-calc'],
    values: {
      generate: [...g],
      propagate: [...p],
      gp_3_2,
      gp_1_0,
      gp_3_0,
      carries: [...carries],
      phase: 'carries'
    }
  })

  // Step 5: Compute sums
  const sums = []
  for (let i = 0; i < 4; i++) {
    sums.push(p[i] ^ carries[i])
  }

  steps.push({
    title: 'Summen berechnen',
    desc: 's_i = p_i ⊕ c_i - Alle Summen werden parallel berechnet.',
    detail: `S = [${sums.join(',')}] = ${toBinaryString(bitsToNum(sums.reverse()), 4)}`,
    activeComponents: ['sum-xor'],
    values: {
      generate: [...g],
      propagate: [...p],
      carries: [...carries],
      sums: [...sums],
      phase: 'sums'
    }
  })

  // Final step
  const result = a + b + cin
  steps.push({
    title: 'Ergebnis',
    desc: 'Der Parallel-Prefix-Addierer hat O(log n) Tiefe statt O(n) beim Ripple-Carry.',
    detail: `${a} + ${b} = ${result}`,
    activeComponents: ['gp-initial', 'prefix-level-1', 'prefix-level-2', 'carry-calc', 'sum-xor'],
    values: {
      generate: [...g],
      propagate: [...p],
      carries: [...carries],
      sums: [...sums],
      phase: 'final'
    },
    isFinal: true,
    result
  })

  return steps
}

// ============================================
// WALLACE TREE / CARRY SAVE ADDER
// ============================================
export function generateWallaceTreeSteps(a, b, c) {
  const steps = []
  const aBits = toBits(a, 4)
  const bBits = toBits(b, 4)
  const cBits = toBits(c, 4)

  // Step 0: Introduction
  steps.push({
    title: 'Carry-Save / Wallace Tree Konzept',
    desc: 'Der Carry-Save-Addierer (CSA) reduziert 3 Eingänge auf 2 Ausgänge (Summe und Carry-Vektor) ohne Carry-Propagation. Ideal für Multiplikation.',
    detail: `A=${a} (${toBinaryString(a)}), B=${b} (${toBinaryString(b)}), C=${c} (${toBinaryString(c)})`,
    activeComponents: [],
    values: { phase: 'intro', aBits, bBits, cBits }
  })

  // Step 1: Explain CSA operation
  steps.push({
    title: 'CSA-Prinzip',
    desc: 'Für jede Bit-Position: s = a ⊕ b ⊕ c (Summe), cv = Majority(a,b,c) (Carry). Kein Carry rippled - alle CSA arbeiten parallel!',
    detail: 's_i = a_i ⊕ b_i ⊕ c_i, cv_i = (a∧b) ∨ (a∧c) ∨ (b∧c)',
    activeComponents: ['csa-explain'],
    values: { phase: 'explain', aBits, bBits, cBits }
  })

  // Step 2: Compute CSA layer - each bit position
  const s = []   // Sum vector
  const cv = []  // Carry vector

  for (let i = 0; i < 4; i++) {
    const ai = aBits[3 - i]
    const bi = bBits[3 - i]
    const ci = cBits[3 - i]
    s.push(ai ^ bi ^ ci)
    cv.push((ai & bi) | (ai & ci) | (bi & ci))
  }

  // Reverse to get proper order [s3,s2,s1,s0]
  const sumBits = [...s].reverse()
  const carryBits = [...cv].reverse()

  const sumNum = bitsToNum(sumBits)
  const carryNum = bitsToNum(carryBits) << 1  // Shifted left by 1

  steps.push({
    title: 'CSA-Schicht berechnen',
    desc: 'Alle 4 CSA arbeiten parallel. 3 Zahlen werden zu 2 Zahlen reduziert.',
    detail: `S = ${sumNum} (${toBinaryString(sumNum, 4)}), CV = ${carryNum} (${toBinaryString(carryNum, 5)}, links-shifted)`,
    activeComponents: ['csa-0', 'csa-1', 'csa-2', 'csa-3'],
    values: {
      phase: 'csa',
      aBits, bBits, cBits,
      sumBits,
      carryBits,
      sumNum,
      carryNum
    }
  })

  // Step 3: Show the two intermediate results
  steps.push({
    title: 'Zwischenergebnis',
    desc: 'Jetzt haben wir nur noch 2 Zahlen zu addieren. Der Carry-Vektor ist um 1 nach links verschoben (Wertigkeit beachten!).',
    detail: `Summe S = ${sumNum}, Carry CV = ${carryNum}`,
    activeComponents: ['intermediate'],
    values: {
      phase: 'intermediate',
      sumBits,
      carryBits,
      sumNum,
      carryNum
    }
  })

  // Step 4: Final addition with ripple carry
  const finalResult = sumNum + carryNum
  steps.push({
    title: 'Finale Addition',
    desc: 'S + CV wird mit einem normalen Addierer (z.B. Ripple-Carry) berechnet. Nur diese letzte Stufe hat Carry-Propagation.',
    detail: `${sumNum} + ${carryNum} = ${finalResult}`,
    activeComponents: ['final-adder'],
    values: {
      phase: 'final-add',
      sumNum,
      carryNum,
      finalResult
    }
  })

  // Step 5: Verification
  const expected = a + b + c
  steps.push({
    title: 'Ergebnis',
    desc: `Verifikation: ${a} + ${b} + ${c} = ${expected}. Wallace Trees werden für Multiplikation verwendet, um viele Partialprodukte effizient zu addieren.`,
    detail: finalResult === expected ? 'Korrekt!' : `Erwartet: ${expected}`,
    activeComponents: ['final-adder'],
    values: {
      phase: 'result',
      sumNum,
      carryNum,
      finalResult,
      expected
    },
    isFinal: true,
    result: finalResult
  })

  return steps
}

// Main step generator
export function generateSteps(adderType, a, b, c = 0, cin = 0) {
  switch (adderType) {
    case 'ripple':
      return generateRippleCarrySteps(a, b, cin)
    case 'bypass':
      return generateCarryBypassSteps(a, b, cin)
    case 'select':
      return generateCarrySelectSteps(a, b, cin)
    case 'prefix':
      return generateParallelPrefixSteps(a, b, cin)
    case 'wallace':
      return generateWallaceTreeSteps(a, b, c)
    default:
      return generateRippleCarrySteps(a, b, cin)
  }
}
