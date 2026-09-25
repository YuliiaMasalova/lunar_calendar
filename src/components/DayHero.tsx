import { useTranslation } from 'react-i18next';
import type { AstroData } from '../types/astro';
import { ZodiacIcon } from './ZodiacIcon';
import { HeroBackground } from './HeroBackground';

interface DayHeroProps {
  astro: AstroData;
  motto: string;
  eyebrow: string;
}

/** SPEC §5.2.1 — hero block with radial purple glow. */
export function DayHero({ astro, motto, eyebrow }: DayHeroProps) {
  const { t } = useTranslation();
  const days = astro.lunar_days.join('/');
  const signName = t(`zodiac.${astro.zodiac_sign}`);
  const transitionName = astro.zodiac_transition_sign
    ? t(`zodiac.${astro.zodiac_transition_sign}`)
    : null;

  return (
    <section className="relative px-16 py-40 text-center md:py-60">
      <HeroBackground />
      <div className="relative z-10 flex flex-col items-center gap-16">
        <p className="text-label-sm uppercase tracking-[0.2em] text-status-favorable">
          {eyebrow}
        </p>

        <h1 className="text-display-cal text-text-primary md:text-display-lunar">
          {t('daily:lunarDay', { days })}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-8 text-accent">
          <span className="text-label-md tracking-[0.15em]">{t('daily:moonIn')}</span>
          <span className="flex items-center gap-8 text-label-md tracking-[0.15em]">
            {signName.toUpperCase()}
            <ZodiacIcon sign={astro.zodiac_sign} title={signName} />
          </span>
          {transitionName && astro.zodiac_transition_sign && (
            <span className="flex items-center gap-8 text-label-md tracking-[0.15em]">
              ➔ {transitionName.toUpperCase()}
              <ZodiacIcon sign={astro.zodiac_transition_sign} title={transitionName} />
            </span>
          )}
        </div>

        <p className="max-w-2xl text-label-md-regular text-text-secondary">{motto}</p>
      </div>
    </section>
  );
}
