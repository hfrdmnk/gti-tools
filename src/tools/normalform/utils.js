// Variable names based on count (highest index first)
export function getVariableNames(numVars) {
  if (numVars === 2) return ['x₁', 'x₀']
  return ['x₂', 'x₁', 'x₀']
}

// Generate truth table with all combinations
export function generateTruthTable(numVars) {
  const rows = Math.pow(2, numVars)
  const table = []

  for (let i = 0; i < rows; i++) {
    const vars = []
    for (let j = numVars - 1; j >= 0; j--) {
      vars.push((i >> j) & 1)
    }
    table.push({
      index: i,
      vars,
      output: 0
    })
  }

  return table
}

// Construct a minterm string from variable values
// For minterm: xi=0 → ¬xi, xi=1 → xi
export function constructMinterm(vars, varNames) {
  const parts = vars.map((val, i) => {
    if (val === 0) {
      return `¬${varNames[i]}`
    }
    return varNames[i]
  })
  return parts.join('·')
}

// Construct a maxterm string from variable values
// For maxterm: xi=0 → xi, xi=1 → ¬xi (inverted!)
export function constructMaxterm(vars, varNames) {
  const parts = vars.map((val, i) => {
    if (val === 0) {
      return varNames[i]
    }
    return `¬${varNames[i]}`
  })
  return `(${parts.join('+')})`
}

// Explain how a minterm is constructed
export function explainMintermConstruction(vars, varNames) {
  return vars.map((val, i) => ({
    variable: varNames[i],
    value: val,
    result: val === 0 ? `¬${varNames[i]}` : varNames[i],
    explanation: val === 0
      ? `${varNames[i]}=0 → negiert zu ¬${varNames[i]}`
      : `${varNames[i]}=1 → bleibt ${varNames[i]}`
  }))
}

// Explain how a maxterm is constructed
export function explainMaxtermConstruction(vars, varNames) {
  return vars.map((val, i) => ({
    variable: varNames[i],
    value: val,
    result: val === 0 ? varNames[i] : `¬${varNames[i]}`,
    explanation: val === 0
      ? `${varNames[i]}=0 → bleibt ${varNames[i]}`
      : `${varNames[i]}=1 → negiert zu ¬${varNames[i]}`
  }))
}

// Generate steps for DNF visualization
export function generateDNFSteps(table, varNames) {
  const steps = []
  const minterms = table.filter(row => row.output === 1)
  const mintermIndices = minterms.map(row => row.index)

  // Step 1: Overview
  steps.push({
    type: 'overview',
    title: 'Zeilen mit f=1 identifizieren',
    desc: minterms.length === 0
      ? 'Keine Zeilen mit Ausgabe 1 gefunden. Die Funktion ist konstant 0.'
      : `${minterms.length} Zeile(n) mit Ausgabe 1: ${mintermIndices.map(i => `m${i}`).join(', ')}`,
    highlightRows: mintermIndices,
    currentRowIndex: null,
    term: null,
    construction: null,
    isFinal: false
  })

  // Steps for each minterm
  minterms.forEach((row, idx) => {
    const term = constructMinterm(row.vars, varNames)
    const construction = explainMintermConstruction(row.vars, varNames)

    steps.push({
      type: 'minterm',
      title: `Minterm m${row.index} konstruieren`,
      desc: `Zeile ${row.index}: Variablenwerte so verknüpfen, dass der Term nur hier 1 ergibt`,
      highlightRows: mintermIndices,
      currentRowIndex: row.index,
      term,
      termLabel: `m${row.index}`,
      construction,
      vars: row.vars,
      isFinal: false
    })
  })

  // Final step: Combine
  if (minterms.length > 0) {
    const allTerms = minterms.map(row => constructMinterm(row.vars, varNames))
    const formula = allTerms.join(' + ')
    const mintermLabels = minterms.map(row => `m${row.index}`).join(' + ')

    steps.push({
      type: 'combine',
      title: 'Minterme mit ODER verknüpfen',
      desc: `DNF: ${mintermLabels}`,
      highlightRows: mintermIndices,
      currentRowIndex: null,
      formula,
      formulaWithLabels: mintermLabels,
      allTerms,
      isFinal: true
    })
  }

  return steps
}

// Generate steps for KNF visualization
export function generateKNFSteps(table, varNames) {
  const steps = []
  const maxterms = table.filter(row => row.output === 0)
  const maxtermIndices = maxterms.map(row => row.index)

  // Step 1: Overview
  steps.push({
    type: 'overview',
    title: 'Zeilen mit f=0 identifizieren',
    desc: maxterms.length === 0
      ? 'Keine Zeilen mit Ausgabe 0 gefunden. Die Funktion ist konstant 1.'
      : `${maxterms.length} Zeile(n) mit Ausgabe 0: ${maxtermIndices.map(i => `M${i}`).join(', ')}`,
    highlightRows: maxtermIndices,
    currentRowIndex: null,
    term: null,
    construction: null,
    isFinal: false
  })

  // Steps for each maxterm
  maxterms.forEach((row, idx) => {
    const term = constructMaxterm(row.vars, varNames)
    const construction = explainMaxtermConstruction(row.vars, varNames)

    steps.push({
      type: 'maxterm',
      title: `Maxterm M${row.index} konstruieren`,
      desc: `Zeile ${row.index}: Variablenwerte invertiert verknüpfen, damit der Term nur hier 0 ergibt`,
      highlightRows: maxtermIndices,
      currentRowIndex: row.index,
      term,
      termLabel: `M${row.index}`,
      construction,
      vars: row.vars,
      isFinal: false
    })
  })

  // Final step: Combine
  if (maxterms.length > 0) {
    const allTerms = maxterms.map(row => constructMaxterm(row.vars, varNames))
    const formula = allTerms.join(' · ')
    const maxtermLabels = maxterms.map(row => `M${row.index}`).join(' · ')

    steps.push({
      type: 'combine',
      title: 'Maxterme mit UND verknüpfen',
      desc: `KNF: ${maxtermLabels}`,
      highlightRows: maxtermIndices,
      currentRowIndex: null,
      formula,
      formulaWithLabels: maxtermLabels,
      allTerms,
      isFinal: true
    })
  }

  return steps
}

// Format final DNF formula
export function formatDNF(table, varNames) {
  const minterms = table.filter(row => row.output === 1)
  if (minterms.length === 0) return '0'
  return minterms.map(row => constructMinterm(row.vars, varNames)).join(' + ')
}

// Format final KNF formula
export function formatKNF(table, varNames) {
  const maxterms = table.filter(row => row.output === 0)
  if (maxterms.length === 0) return '1'
  return maxterms.map(row => constructMaxterm(row.vars, varNames)).join(' · ')
}
