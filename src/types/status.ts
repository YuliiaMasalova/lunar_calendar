// SPEC §4 — unified day statuses (only three, "неблагоприятный" is never used).
export type DayStatus = 'favorable' | 'neutral' | 'critical';

export const DAY_STATUSES: DayStatus[] = ['favorable', 'neutral', 'critical'];
