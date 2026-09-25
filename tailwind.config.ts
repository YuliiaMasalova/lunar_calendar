import type { Config } from 'tailwindcss';

/**
 * All design tokens come from SPEC §9 (synced with Figma fileKey M1VsbaOwwPoa1l5fpOIJq4).
 * Nothing is hardcoded as hex in JSX — components reference these tokens only.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        // §9.1 surfaces & background
        bg: {
          primary: '#0d1320',
          secondary: '#0e1423',
        },
        card: {
          primary: '#121621cc',
        },
        overlay: {
          dark: '#080d1980',
        },
        surface: {
          'dark-alt': '#1f1f26',
          'panel': '#1a1f2d99',
        },
        // §9.2 text
        text: {
          primary: '#e7eef8',
          secondary: '#e7eef7cc',
          tertiary: '#e7eef7b2',
          disabled: '#e7eef766',
          'disabled-strong': '#e7eef799',
          'heading-accent': '#5fe3b0',
          'heading-secondary': '#e7eef7f2',
          // Figma color/gray/neutral-slate — meta text (aspect times etc, node 136:2174).
          meta: '#94a3b8',
        },
        // §9.3 status & semantics
        status: {
          favorable: '#5fe3b0',
          neutral: '#ffd166',
          critical: '#ff6b6b',
        },
        success: '#5fe3b0',
        warning: '#ffd166',
        error: '#ff6b6b',
        accent: '#a88bff',
        'link-hover': '#cebdff',
        info: {
          primary: '#2563eb',
          secondary: '#62bfeae5',
        },
        // §9.4 borders
        border: {
          primary: '#ffffff1a',
          secondary: '#ffffff0d',
          focus: '#a88bff',
          success: '#5fe3b066',
          inverse: '#e5e7eb33',
        },
        // §6.6 CalendarCell fill/border matrix (status × state)
        cell: {
          'favorable-fill': '#5fe3b033',
          'favorable-fill-hover': '#5fe3b059',
          'favorable-border': '#5fe3b066',
          'favorable-border-hover': '#5fe3b099',
          'favorable-border-selected': '#5fe3b0cc',
          'favorable-border-today': '#5fe3b0',
          'neutral-fill': '#ffd16633',
          'neutral-fill-hover': '#ffd16659',
          'neutral-border': '#ffd16666',
          'neutral-border-hover': '#ffd16699',
          'neutral-border-selected': '#ffd166cc',
          'neutral-border-today': '#ffd166',
          'critical-fill': '#ff6b6b33',
          'critical-fill-hover': '#ff6b6b59',
          'critical-border': '#ff6b6b66',
          'critical-border-hover': '#ff6b6b99',
          'critical-border-selected': '#ff6b6bcc',
          'critical-border-today': '#ff6b6b',
        },
        // §9.8 AspectBadge
        badge: {
          'tension-text': '#ff6b6b',
          'tension-fill': '#ff6b6b33',
          'tension-border': '#ff6b6b66',
          'harmony-text': '#5fe3b0',
          'harmony-fill': '#5fe3b026',
          'harmony-border': '#5fe3b033',
          'insight-text': '#a88bff',
          'insight-fill': '#1a1f2d99',
          'insight-border': '#a88bff59',
        },
      },
      fontSize: {
        // §9.5 typography (size / line-height / weight)
        'display-lunar': ['76px', { lineHeight: '96px', fontWeight: '600' }],
        'display-cal': ['32px', { lineHeight: '48px', fontWeight: '600' }],
        'mobile-cal-date': ['36px', { lineHeight: '40px', fontWeight: '600' }],
        'label-md': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'label-md-regular': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md-strong': ['16px', { lineHeight: '24px', fontWeight: '700' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'caption-sm': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'meta-sm': ['12px', { lineHeight: '18px', fontWeight: '500' }],
        'cal-lunar-day': ['12px', { lineHeight: '18px', fontWeight: '500' }],
        'cal-lunar-time': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'mobile-cal-weekday': ['10px', { lineHeight: '16px', fontWeight: '500' }],
      },
      borderRadius: {
        // §9.6
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '28px',
        full: '10000px',
      },
      spacing: {
        // §9.6 scale — numeric class === px (overrides the default rem scale
        // for these keys so p-24 = 24px, gap-8 = 8px, h-8 w-8 = 8px, etc.)
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        20: '20px',
        24: '24px',
        28: '28px',
        32: '32px',
        36: '36px',
        40: '40px',
        48: '48px',
        60: '60px',
        64: '64px',
        96: '96px',
      },
      boxShadow: {
        // §9.13
        card: '0 24px 60px #00000080',
      },
      backgroundImage: {
        // §9.13 radial purple glow behind hero
        'hero-glow':
          'radial-gradient(circle at 50% 40%, #a88bff26 0%, rgba(168,139,255,0) 60%)',
      },
    },
  },
  plugins: [],
};

export default config;
