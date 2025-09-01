Constantes de Design (src/constants) - App Nexo
Estes arquivos irão centralizar toda a nossa identidade visual, garantindo consistência em todo o aplicativo.

src/constants/colors.ts
Este arquivo exporta nossa paleta de cores, permitindo que a gente use `COLORS.PRIMARY` em vez de decorar códigos hexadecimais.

// src/constants/colors.ts

export const COLORS = {
  primary: '#005F73',     // Azul Petróleo Escuro
  secondary: '#0A9396',   // Verde Água
  action: '#EE9B00',      // Laranja Queimado
  success: '#94D2BD',     // Verde Menta
  danger: '#AE2012',      // Vermelho para Rejeitar/Cancelar

  white: '#FFFFFF',
  background: '#F1F1F1', // Cinza Claro
  textDark: '#333333',
  textMedium: '#777777',
  textLight: '#FFFFFF',
  lightGray: '#CCCCCC',   // Para bordas
};

src/constants/typography.js
Este arquivo define os tamanhos e pesos de fonte, seguindo nossa hierarquia tipográfica.

// src/constants/typography.js

export const FONT_SIZES = {
  h1: 28,
  h2: 20,
  body: 16,
  caption: 14,
};

export const FONT_WEIGHTS = {
  regular: 'NunitoSans_400Regular',
  bold: 'NunitoSans_700Bold',
};

src/constants/index.js
Este arquivo serve como um ponto de entrada único para todas as nossas constantes, simplificando as importações em outros arquivos.

// src/constants/index.js

import { COLORS } from './colors';
import { FONT_SIZES, FONT_WEIGHTS } from './typography';

export { COLORS, FONT_SIZES, FONT_WEIGHTS };

Com estes documentos, temos uma base extremamente sólida. Agora temos não só a estrutura de pastas, mas também a lista de ferramentas (package.json) e os materiais de construção (constants) definidos.