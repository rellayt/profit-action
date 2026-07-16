import { createTheme, MantineColorsTuple } from '@mantine/core';

const paGreen: MantineColorsTuple = [
  '#e6fff4',
  '#c7fde4',
  '#8ef9c8',
  '#51f5a8',
  '#21f18b',
  '#14d977',
  '#0ea85c',
  '#0b8449',
  '#09663a',
  '#074d2d',
];

export const copilotTheme = createTheme({
  primaryColor: 'paGreen',
  focusRing: 'auto',
  cursorType: 'pointer',
  colors: {
    paGreen,
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#0a1218',
    ],
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
  primaryShade: { light: 5, dark: 4 },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
  },
});
