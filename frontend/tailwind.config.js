/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Produce palette — fixed hues, independent of the role-scoped
        // --primary/--accent vars above, for illustrations & one-off accents.
        basil: {
          50: '#EEF5EC',
          100: '#D6E7D1',
          400: '#4C8A57',
          600: '#2F6B3E',
          700: '#234F2E',
          900: '#152F1B',
        },
        plum: {
          50: '#F3EEF3',
          100: '#E0D2E1',
          400: '#7A527D',
          600: '#5B3A5E',
          700: '#452B47',
          900: '#2A1A2B',
        },
        tomato: {
          100: '#FBE0D6',
          400: '#EE7B5C',
          500: '#E85D3D',
          600: '#C94627',
        },
        corn: {
          100: '#FCEDC7',
          400: '#F0B429',
          500: '#DE9C15',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 6px)',
        '2xl': 'calc(var(--radius) + 14px)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(27, 36, 25, 0.04), 0 8px 24px -12px rgba(27, 36, 25, 0.12)',
      },
    },
  },
  plugins: [],
};
