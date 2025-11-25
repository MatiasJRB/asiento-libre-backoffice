/**
 * Design Tokens para Asiento Libre
 * 
 * Tokens de diseño centralizados extraídos del análisis de la UI actual.
 * Basados en el estilo BlaBlaCar implementado en auth screens.
 * 
 * ⚠️ NUNCA hardcodear colores/espaciados directamente en componentes.
 * ⚠️ Siempre usar estos tokens para consistencia.
 */

export const tokens = {
  /**
   * Paleta de colores
   * Nueva identidad visual de Asiento Libre
   */
  colors: {
    // Brand colors (colores de marca)
    brand: {
      primary: '#1B365D',      // Azul petróleo suave - Base de identidad, confianza y solidez
      primaryDark: '#0F1F3A',  // Azul petróleo oscuro - Hover/pressed states
      primaryLight: '#E8ECF3', // Azul petróleo claro - Backgrounds suaves
      
      secondary: '#A8E05F',    // Verde lima - Economía y sostenibilidad
      secondaryDark: '#8BC34A',
      secondaryLight: '#E8F5E9',
      
      accent: '#FF6B35',       // Naranja coral - Energía, conexión humana, dinamismo
      accentDark: '#E55A2B',
      accentLight: '#FFE8E0',
    },
    
    // Neutral scale (escala de grises)
    neutral: {
      50: '#F8F8F8',   // Fondo claro - Gris cálido neutro y amable para la vista
      100: '#F3F3F3',  // Backgrounds claros
      200: '#E5E5E5',  // Borders, dividers
      300: '#D1D1D1',  // Borders hover
      400: '#9CA3AF',  // Placeholder text, disabled text
      500: '#6B7280',  // Labels, secondary text
      600: '#4B5563',  // Secondary text dark
      700: '#3D3D3D',  // Text muted
      800: '#2E2E2E',  // Gris carbón - Texto principal de alta legibilidad
      900: '#1A1A1A',  // Headings, emphasis
    },
    
    // Semantic colors (colores con significado)
    semantic: {
      // Error states
      error: '#EF4444',
      errorLight: '#FEE2E2',
      errorDark: '#DC2626',
      
      // Warning states
      warning: '#F59E0B',
      warningLight: '#FEF3C7',
      warningDark: '#D97706',
      
      // Success states
      success: '#10B981',
      successLight: '#D1FAE5',
      successDark: '#059669',
      
      // Info states
      info: '#3B82F6',
      infoLight: '#DBEAFE',
      infoDark: '#2563EB',
    },
    
    // Surface colors (colores de superficie)
    surface: {
      background: '#FFFFFF',
      backgroundDark: '#F9FAFB',
      card: '#FFFFFF',
      cardHover: '#F9FAFB',
      overlay: 'rgba(0, 0, 0, 0.5)',
      overlayLight: 'rgba(0, 0, 0, 0.3)',
    },
    
    // Special colors
    special: {
      transparent: 'transparent',
      white: '#FFFFFF',
      black: '#000000',
    }
  },
  
  /**
   * Sistema de espaciado
   * Basado en múltiplos de 4 para consistencia
   */
  spacing: {
    0: 0,
    1: 4,    // 4px
    2: 8,    // 8px
    3: 12,   // 12px
    4: 16,   // 16px
    5: 20,   // 20px
    6: 24,   // 24px
    7: 28,   // 28px
    8: 32,   // 32px
    9: 36,   // 36px
    10: 40,  // 40px
    12: 48,  // 48px
    14: 56,  // 56px
    15: 60,  // 60px - Header top padding común
    16: 64,  // 64px
    20: 80,  // 80px
    24: 96,  // 96px
  },
  
  /**
   * Border radius (esquinas redondeadas)
   */
  radius: {
    none: 0,
    xs: 4,
    sm: 8,    // Inputs, cards pequeñas
    md: 12,   // Cards medianas
    lg: 16,   // Cards grandes
    xl: 20,   // Cards extra grandes
    '2xl': 25, // Botones pill (auth screens)
    '3xl': 30,
    full: 9999, // Círculo perfecto
  },
  
  /**
   * Tamaños de fuente
   */
  fontSize: {
    xs: 12,
    sm: 14,   // Labels
    base: 16, // Text normal, inputs
    lg: 18,   // Botones
    xl: 20,
    '2xl': 24,
    '3xl': 28, // Títulos de pantalla (auth)
    '4xl': 32, // Títulos grandes
    '5xl': 36,
    '6xl': 48, // Logo, hero text
  },
  
  /**
   * Font weights
   */
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const, // Títulos, botones
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  /**
   * Line heights
   */
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
    // Valores específicos
    24: 24, // Para fontSize: 16
    32: 32, // Para fontSize: 24
    36: 36, // Para fontSize: 28 (títulos auth)
  },
  
  /**
   * Shadows (sombras)
   */
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
    lg: '0 4px 8px 0 rgb(0 0 0 / 0.15)',
    xl: '0 8px 16px 0 rgb(0 0 0 / 0.2)',
  },
  
  /**
   * Opacidades
   */
  opacity: {
    0: 0,
    5: 0.05,
    10: 0.1,
    20: 0.2,
    30: 0.3,
    40: 0.4,
    50: 0.5,
    60: 0.6,
    70: 0.7,
    80: 0.8,
    90: 0.9,
    100: 1,
  },
  
  /**
   * Z-index layers
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
  
  /**
   * Tiempos de animación
   */
  animation: {
    fast: 150,
    base: 200,
    slow: 300,
    slower: 500,
  },
} as const;

/**
 * Type-safe helpers para acceder a tokens
 */

export type ColorToken = keyof typeof tokens.colors;
export type SpacingToken = keyof typeof tokens.spacing;
export type RadiusToken = keyof typeof tokens.radius;
export type FontSizeToken = keyof typeof tokens.fontSize;

/**
 * Helper para obtener color de forma type-safe
 * @example
 * color('brand.primary') // '#1B365D'
 * color('neutral.800') // '#2E2E2E'
 */
export const color = (path: string): string => {
  const parts = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = tokens.colors;
  
  for (const part of parts) {
    value = value[part];
    if (value === undefined) {
      console.warn(`Color token "${path}" not found`);
      return '#000000';
    }
  }
  
  return value;
};

/**
 * Helper para obtener espaciado
 * @example
 * spacing(4) // 16
 * spacing(8) // 32
 */
export const spacing = (key: keyof typeof tokens.spacing): number => {
  return tokens.spacing[key];
};

/**
 * Helper para obtener radius
 * @example
 * radius('sm') // 8
 * radius('2xl') // 25
 */
export const radius = (key: keyof typeof tokens.radius): number => {
  return tokens.radius[key];
};

export default tokens;
