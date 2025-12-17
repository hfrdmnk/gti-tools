import AdderVisualizer from './adder/AdderVisualizer'
import BinaryDivision from './division/BinaryDivision'
import FloatVisualizer from './float/FloatVisualizer'
import HackVisualizer from './hack/HackVisualizer'
import TwosComplement from './twoscomplement/TwosComplement'
import NormalFormVisualizer from './normalform/NormalFormVisualizer'

// Tool registry - add new tools here (sorted alphabetically by name)
export const tools = [
  {
    id: 'adder',
    name: 'Addierer',
    path: '/adder',
    description: 'Ripple, Bypass, Select, Prefix & Wallace Tree',
    component: AdderVisualizer,
  },
  {
    id: 'division',
    name: 'Binary Division',
    path: '/division',
    description: 'Restoring & Non-Restoring Division',
    component: BinaryDivision,
  },
  {
    id: 'hack',
    name: 'Hack Assembly',
    path: '/hack',
    description: 'Register & Speicher visualisieren',
    component: HackVisualizer,
  },
  {
    id: 'float',
    name: 'IEEE 754 Float',
    path: '/float',
    description: 'Gleitkommazahlen visualisieren',
    component: FloatVisualizer,
  },
  {
    id: 'normalform',
    name: 'Normalformen',
    path: '/normalform',
    description: 'DNF & KNF verstehen',
    component: NormalFormVisualizer,
  },
  {
    id: 'twoscomplement',
    name: 'Zweierkomplement',
    path: '/twoscomplement',
    description: 'Darstellung negativer Zahlen',
    component: TwosComplement,
  },
  // Add more tools:
  // {
  //   id: 'multiplication',
  //   name: 'Binary Multiplication',
  //   path: '/multiplication',
  //   description: 'Booth Algorithm visualisieren',
  //   component: BinaryMultiplication,
  // },
]
