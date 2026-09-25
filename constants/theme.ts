export const theme = {
  colors: {
    // Warm, soft palette inspired by cozy self-care companion apps —
    // muted sage/peach rather than saturated primary colors.
    primary: '#5FB89C',
    primaryDark: '#3F9A80',
    secondary: '#FFB199',
    background: '#FBF6EE',
    card: '#FFFFFF',
    cardAlt: '#FFF8EF',
    text: '#3D3229',
    subtext: '#8A7F72',
    gray: '#ABA096',
    lightGray: '#F3ECE1',
    border: '#EFE6D8',
    success: '#5FB89C',
    warning: '#FFC168',
    error: '#F0787E',
    happiness: '#FFB55E',
    hunger: '#F0898F',
    energy: '#6FB8DE',
    health: '#7ED6A7',
  },
  fonts: {
    regular: 'Nunito-Regular',
    semiBold: 'Nunito-SemiBold',
    bold: 'Nunito-Bold',
    extraBold: 'Nunito-ExtraBold',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 10,
    md: 20,
    lg: 26,
    xl: 32,
    full: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#4A3B2A',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#4A3B2A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.09,
      shadowRadius: 16,
      elevation: 5,
    },
  },
};

// ---------------------------------------------------------------------------
// Candy-bright accents for the Toolkit grid — bold flat colors (not pastel),
// inspired by playful self-care "journey" apps rather than muted wellness UI.
// ---------------------------------------------------------------------------
export const toolColors = {
  purple: '#6C5CE7',
  purpleDark: '#5A4BD1',
  pink: '#F0507A',
  blue: '#4FA8E0',
  orange: '#FFA726',
  navy: '#1B2A5C',
  teal: '#26A69A',
  amber: '#F0A030',
  brown: '#8D6E63',
};

// ---------------------------------------------------------------------------
// Three-band outdoor "scene" gradients (sky / horizon / ground) used behind
// hero content — a recurring structural motif in journey/exploration-style
// self-care apps.
// ---------------------------------------------------------------------------
export const sceneBands = {
  day: ['#8FD4F0', '#5FA8D8', '#F5C572'] as [string, string, string],
  meadow: ['#9AD9F0', '#6FBF8F', '#4FA96B'] as [string, string, string],
  dusk: ['#8478D6', '#6B5FC4', '#5A4BD1'] as [string, string, string],
};
