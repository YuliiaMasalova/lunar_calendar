import type { Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Fonts + Tailwind — same pipeline as the real app (SPEC §1, §2).
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '../src/index.css';
import '../src/i18n';

import { LocationProvider } from '../src/context/LocationContext';

// App is dark-only (SPEC §5) — surface/bg/bg-primary #0d1320.
const BG_PRIMARY = '#0d1320';
const BG_SECONDARY = '#0e1423';

// Seed a saved location so LocationProvider does not fire a geolocation prompt
// inside stories (SPEC §6.1 — detect() only runs on first visit).
try {
  localStorage.setItem(
    'auralunar.location',
    JSON.stringify({ lat: 50.45, lon: 30.52, city: 'Kyiv' }),
  );
} catch {
  /* storage may be unavailable */
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        primary: { name: 'BG Primary', value: BG_PRIMARY },
        secondary: { name: 'BG Secondary', value: BG_SECONDARY },
      },
    },
    a11y: { test: 'todo' },
    // Responsive presets matching the Figma frames: iPhone 13/14 (390), tablet, desktop (1280).
    // Pick one from the toolbar viewport menu, or a story selects it via `globals.viewport`.
    viewport: {
      options: {
        mobile: {
          name: 'Mobile · iPhone 13/14 (390)',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (768)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop (1280)',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'primary' },
  },
  decorators: [
    // Single global Router. A story picks its active route via `parameters.route`
    // (never nest another <Router> inside a story — React Router forbids it).
    (Story, context) => (
      <QueryClientProvider client={queryClient}>
        <LocationProvider>
          <MemoryRouter
            key={String(context.parameters.route ?? 'default')}
            initialEntries={[(context.parameters.route as string | undefined) ?? '/day/2027-10-15']}
          >
            <div className="min-h-[120px] bg-bg-primary p-24 font-sans text-text-primary antialiased">
              <Story />
            </div>
          </MemoryRouter>
        </LocationProvider>
      </QueryClientProvider>
    ),
  ],
};

export default preview;
