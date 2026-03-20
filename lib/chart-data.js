export const metricOptions = [
  { id: 'ebitda', label: 'Annual EBITDA', projected: '$337B By 2030', description: 'How profitable are core operations?' },
  { id: 'revenue', label: 'Annual Revenue', projected: '$644B By 2030', description: 'Is the business growing fast?' },
  { id: 'earnings', label: 'Annual Earnings', projected: '$249B By 2030', description: 'What is the real profit?' },
  { id: 'eps_diluted', label: 'Annual EPS Diluted', projected: '$33.4 By 2030', description: 'How much profit per share?' },
  { id: 'eps_basic', label: 'Annual EPS Basic', projected: '$33.4 By 2030', description: 'Basic earnings per share' },
  { id: 'quarterly_revenue', label: 'Quarterly Revenue', projected: "$115B By Dec '26", description: 'Revenue trends by quarter' },
]

export const colorPresets = [
  '#22c55e', // green
  '#ef4444', // red
  '#f97316', // orange
  '#fb923c', // light orange
  '#eab308', // yellow
  '#15803d', // dark green
  '#4ade80', // light green
  '#14b8a6', // teal
  '#38bdf8', // sky blue
  '#3b82f6', // blue
  '#4338ca', // dark indigo
  '#a855f7', // purple
  '#ec4899', // hot pink
  '#be185d', // dark pink
  '#374151', // dark gray
]

export const allChartsData = [
  {
    id: 'revenue',
    title: 'Annual Revenue',
    subtitle: 'Annual Revenue Projected To Reach $644B By 2030',
    unit: 'B',
    data: [
      { year: 2014, value: 86.8, change: 11, isFuture: false },
      { year: 2015, value: 93.5, change: 8, isFuture: false },
      { year: 2016, value: 85.3, change: -9, isFuture: false },
      { year: 2017, value: 89.9, change: 5, isFuture: false },
      { year: 2018, value: 110.3, change: 23, isFuture: false },
      { year: 2019, value: 125.8, change: 14, isFuture: false },
      { year: 2020, value: 143.0, change: 14, isFuture: false },
      { year: 2021, value: 168.0, change: 17, isFuture: false },
      { year: 2022, value: 198.2, change: 18, isFuture: false },
      { year: 2023, value: 211.9, change: 7, isFuture: false },
      { year: 2024, value: 245.1, change: 16, isFuture: false },
      { year: 2025, value: 282.0, change: 15, isFuture: true },
      { year: 2026, value: 328.0, change: 16, isFuture: true },
      { year: 2027, value: 378.0, change: 15, isFuture: true },
      { year: 2028, value: 441.0, change: 17, isFuture: true },
      { year: 2029, value: 522.0, change: 18, isFuture: true },
      { year: 2030, value: 644.0, change: 23, isFuture: true },
    ],
  },
  {
    id: 'ebitda',
    title: 'Annual EBITDA',
    subtitle: 'Annual EBITDA Projected To Reach $337B By 2030',
    unit: 'B',
    data: [
      { year: 2014, value: 33.6, change: 8, isFuture: false },
      { year: 2015, value: 25.2, change: -25, isFuture: false },
      { year: 2016, value: 33.5, change: 33, isFuture: false },
      { year: 2017, value: 40.9, change: 22, isFuture: false },
      { year: 2018, value: 49.5, change: 21, isFuture: false },
      { year: 2019, value: 58.1, change: 17, isFuture: false },
      { year: 2020, value: 68.4, change: 18, isFuture: false },
      { year: 2021, value: 85.1, change: 24, isFuture: false },
      { year: 2022, value: 100.0, change: 18, isFuture: false },
      { year: 2023, value: 105.0, change: 5, isFuture: false },
      { year: 2024, value: 133.0, change: 27, isFuture: false },
      { year: 2025, value: 160.0, change: 20, isFuture: true },
      { year: 2026, value: 172.0, change: 7, isFuture: true },
      { year: 2027, value: 198.0, change: 15, isFuture: true },
      { year: 2028, value: 231.0, change: 17, isFuture: true },
      { year: 2029, value: 273.0, change: 18, isFuture: true },
      { year: 2030, value: 337.0, change: 23, isFuture: true },
    ],
  },
  {
    id: 'earnings',
    title: 'Annual Earnings',
    subtitle: 'Annual Earnings Projected To Reach $249B By 2030',
    unit: 'B',
    data: [
      { year: 2014, value: 22.0, change: 1, isFuture: false },
      { year: 2015, value: 12.1, change: -45, isFuture: false },
      { year: 2016, value: 16.7, change: 38, isFuture: false },
      { year: 2017, value: 21.2, change: 27, isFuture: false },
      { year: 2018, value: 16.5, change: -22, isFuture: false },
      { year: 2019, value: 39.2, change: 137, isFuture: false },
      { year: 2020, value: 44.2, change: 13, isFuture: false },
      { year: 2021, value: 61.2, change: 38, isFuture: false },
      { year: 2022, value: 72.7, change: 19, isFuture: false },
      { year: 2023, value: 72.4, change: -1, isFuture: false },
      { year: 2024, value: 88.1, change: 22, isFuture: false },
      { year: 2025, value: 102.0, change: 16, isFuture: true },
      { year: 2026, value: 120.0, change: 18, isFuture: true },
      { year: 2027, value: 142.0, change: 18, isFuture: true },
      { year: 2028, value: 167.0, change: 18, isFuture: true },
      { year: 2029, value: 200.0, change: 19, isFuture: true },
      { year: 2030, value: 249.0, change: 24, isFuture: true },
    ],
  },
  {
    id: 'eps_diluted',
    title: 'Annual EPS Diluted',
    subtitle: 'Annual EPS Diluted Projected To Reach $33.4 By 2030',
    unit: '',
    data: [
      { year: 2014, value: 2.6, change: 0, isFuture: false },
      { year: 2015, value: 1.4, change: -46, isFuture: false },
      { year: 2016, value: 2.1, change: 50, isFuture: false },
      { year: 2017, value: 2.7, change: 28, isFuture: false },
      { year: 2018, value: 2.1, change: -22, isFuture: false },
      { year: 2019, value: 5.0, change: 138, isFuture: false },
      { year: 2020, value: 5.7, change: 14, isFuture: false },
      { year: 2021, value: 8.0, change: 40, isFuture: false },
      { year: 2022, value: 9.6, change: 20, isFuture: false },
      { year: 2023, value: 9.8, change: 2, isFuture: false },
      { year: 2024, value: 11.8, change: 20, isFuture: false },
      { year: 2025, value: 13.6, change: 15, isFuture: true },
      { year: 2026, value: 16.5, change: 21, isFuture: true },
      { year: 2027, value: 19.0, change: 15, isFuture: true },
      { year: 2028, value: 22.5, change: 18, isFuture: true },
      { year: 2029, value: 26.8, change: 19, isFuture: true },
      { year: 2030, value: 33.4, change: 25, isFuture: true },
    ],
  },
  {
    id: 'eps_basic',
    title: 'Annual EPS Basic',
    subtitle: 'Annual EPS Basic Projected To Reach $33.4 By 2030',
    unit: '',
    data: [
      { year: 2014, value: 2.6, change: 0, isFuture: false },
      { year: 2015, value: 1.4, change: -46, isFuture: false },
      { year: 2016, value: 2.1, change: 50, isFuture: false },
      { year: 2017, value: 2.7, change: 28, isFuture: false },
      { year: 2018, value: 2.1, change: -22, isFuture: false },
      { year: 2019, value: 5.0, change: 138, isFuture: false },
      { year: 2020, value: 5.7, change: 14, isFuture: false },
      { year: 2021, value: 8.1, change: 42, isFuture: false },
      { year: 2022, value: 9.7, change: 19, isFuture: false },
      { year: 2023, value: 9.9, change: 2, isFuture: false },
      { year: 2024, value: 11.9, change: 20, isFuture: false },
      { year: 2025, value: 13.7, change: 15, isFuture: true },
      { year: 2026, value: 16.5, change: 20, isFuture: true },
      { year: 2027, value: 19.0, change: 15, isFuture: true },
      { year: 2028, value: 22.5, change: 18, isFuture: true },
      { year: 2029, value: 26.8, change: 19, isFuture: true },
      { year: 2030, value: 33.4, change: 25, isFuture: true },
    ],
  },
  {
    id: 'quarterly_revenue',
    title: 'Quarterly Revenue',
    subtitle: "Quarterly Revenue Projected To Reach $115B By Dec '26",
    unit: 'B',
    isQuarterly: true,
    data: [
      { date: "Mar '23", year: 2023, quarter: 1, value: 52.9, change: 0,  isFuture: false },
      { date: "Jun '23", year: 2023, quarter: 2, value: 56.2, change: 6,  isFuture: false },
      { date: "Sep '23", year: 2023, quarter: 3, value: 56.5, change: 1,  isFuture: false },
      { date: "Dec '23", year: 2023, quarter: 4, value: 62.0, change: 10, isFuture: false },
      { date: "Mar '24", year: 2024, quarter: 1, value: 61.9, change: 0,  isFuture: false },
      { date: "Jun '24", year: 2024, quarter: 2, value: 64.7, change: 5,  isFuture: false },
      { date: "Sep '24", year: 2024, quarter: 3, value: 65.6, change: 1,  isFuture: false },
      { date: "Dec '24", year: 2024, quarter: 4, value: 69.6, change: 6,  isFuture: false },
      { date: "Mar '25", year: 2025, quarter: 1, value: 70.1, change: 1,  isFuture: true },
      { date: "Jun '25", year: 2025, quarter: 2, value: 76.4, change: 9,  isFuture: true },
      { date: "Sep '25", year: 2025, quarter: 3, value: 83.0, change: 9,  isFuture: true },
      { date: "Dec '25", year: 2025, quarter: 4, value: 90.0, change: 8,  isFuture: true },
      { date: "Mar '26", year: 2026, quarter: 1, value: 96.0, change: 7,  isFuture: true },
      { date: "Jun '26", year: 2026, quarter: 2, value: 103.0, change: 7, isFuture: true },
      { date: "Sep '26", year: 2026, quarter: 3, value: 109.0, change: 6, isFuture: true },
      { date: "Dec '26", year: 2026, quarter: 4, value: 115.0, change: 6, isFuture: true },
    ],
  },
]
