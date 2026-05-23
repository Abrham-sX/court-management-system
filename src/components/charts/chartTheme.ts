// Premium harmonious palette for a judicial system
export const chartColors = [
  'var(--app-accent)', // Deep Primary (e.g. Brown/Blue)
  '#f59e0b', // Amber (High contrast vs Primary)
  '#6366f1', // Indigo (High contrast vs Green/Brown)
  '#10b981', // Emerald (Status: Success)
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f43f5e', // Rose
];

export const demoStatusData = [
  { name: 'Registered', value: 36, fill: '#3b82f6' }, // Blue
  { name: 'Ongoing', value: 54, fill: '#f59e0b' },    // Amber
  { name: 'Closed', value: 29, fill: '#10b981' },     // Emerald
  { name: 'Adjourned', value: 12, fill: '#ef4444' },   // Red
];

export const demoMonthlyData = [
  { month: 'Jan', cases: 18 },
  { month: 'Feb', cases: 22 },
  { month: 'Mar', cases: 25 },
  { month: 'Apr', cases: 21 },
  { month: 'May', cases: 28 },
  { month: 'Jun', cases: 31 },
];

// Grid and Axis styling
export const chartGrid = 'var(--app-border)';
export const chartText = 'var(--app-muted)';
export const chartTooltipBg = 'var(--app-panel)';
export const chartTooltipBorder = 'var(--app-border)';
