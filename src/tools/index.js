import BinaryDivision from './division/BinaryDivision'
import FloatVisualizer from './float/FloatVisualizer'

// Tool registry - add new tools here
export const tools = [
  {
    id: 'division',
    name: 'Binary Division',
    path: '/division',
    description: 'Restoring & Non-Restoring Division',
    component: BinaryDivision,
  },
  {
    id: 'float',
    name: 'IEEE 754 Float',
    path: '/float',
    description: 'Gleitkommazahlen visualisieren',
    component: FloatVisualizer,
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
