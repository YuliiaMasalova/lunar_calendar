# AuraLunar

Lunar and astrological calendar. Daily Forecast and Monthly Calendar for any date and
location, in Ukrainian, Russian and English.

- **Storybook (Chromatic):** https://6ab63463ff05c3364eaf4654-bxumktlvxi.chromatic.com/
- **Design (Figma):** https://www.figma.com/design/M1VsbaOwwPoa1l5fpOIJq4/lunar_calendar
- **Specification:** [SPEC.md](SPEC.md)

## How it works

- **Astronomy** is computed in the browser with [`astronomy-engine`](https://github.com/cosinekitty/astronomy):
  lunar day (from New Moon and moonrise), Moon sign transits, phases, void of course,
  aspects, planetary retrogrades and eclipses. Times are in the user's timezone and
  location, and no dates are hardcoded, so it works for any year.
- **Texts** are static Russian content in [`src/knowledge-base`](src/knowledge-base),
  mapped onto the computed data by `KnowledgeService`.
- **Location** comes from the browser Geolocation API or a city search (Nominatim),
  defaulting to Kyiv.

## Stack

Vite, React, TypeScript, Tailwind CSS (all styling), React Router, TanStack Query,
react-i18next, Storybook, Chromatic.

## Scripts

```bash
npm install
npm run dev              # app on http://localhost:5173
npm run build            # type-check + production build to dist/
npm run storybook        # Storybook on http://localhost:6006
npm run build-storybook  # static Storybook
npm run chromatic        # publish Storybook (needs CHROMATIC_PROJECT_TOKEN)
```

## Team

The project was built by a pipeline of Claude Code sub-agents defined in
[`.claude/agents`](.claude/agents): `lead`, `spec`, `builder`, `reviewer`, `storybook`
and `shipper`. [`agents.html`](agents.html) is a map of their roles and order.
