const ALL_ICONS = [
  'air-conditioner',
  'arrow',
  'cake',
  'caution-sign',
  'compass',
  'dance-area',
  'disability-sing',
  'dj-controller',
  'electrical-outlet',
  'fan',
  'firework',
  'gifts',
  'heater',
  'high-chair-sign',
  'left door',
  'light',
  'microphone',
  'pillar',
  'right-door',
  'round-table',
  'smoke',
  'sound',
  'square-table',
  'stage',
  'strainght-wall',
  't-table',
  'target',
  'toilet-sign',
  'tree',
  'u-table',
  'water'
] as const;

const VALID_ICONS = ALL_ICONS.filter(
  key => key !== 'u-table' &&
  key !== 't-table' &&
  key !== 'square-table' &&
  key !== 'round-table'
);

export { ALL_ICONS, VALID_ICONS };