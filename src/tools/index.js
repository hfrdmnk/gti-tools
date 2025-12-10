import BinaryDivision from './division/BinaryDivision'

// Tool registry - add new tools here
export const tools = [
  {
    id: 'division',
    name: 'Binary Division',
    path: '/division',
    description: 'Restoring & Non-Restoring Division',
    component: BinaryDivision,
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
