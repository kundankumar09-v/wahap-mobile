export const colors = {
  primary: '#ff0844',
  primaryLight: '#ff4b2b',
  primaryGradient: ['#ff0844', '#ff4b2b'],
  accent: '#ffb199',
  
  // Backgrounds
  background: '#07090e',
  surface: '#0f172a',
  surfaceLight: '#1e293b',
  surfaceBorder: 'rgba(255, 255, 255, 0.08)',
  
  // Text
  text: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // System / Badges
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#38bdf8',

  // Stalls
  stall: '#ffffff',
  stage: '#ffea79',
  restroom: '#55efc4',
  food: '#fab1a0',
  entry: '#e056fd',
  exit: '#c8d6e5',
  help: '#ffeaa7',
};

export const typography = {
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: colors.textMuted,
  },
};
