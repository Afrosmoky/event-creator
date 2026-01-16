const SPRITES_META = {
  'air-conditioner': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'arrow': {
    viewBox: '135.394 151.529 242.004 207.123',
    width: 234.004, height: 199.123,
  },
  'cake': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'caution-sign': {
    viewBox: '126.426 107 259.148 225.5',
    width: 251.148, height: 217.5,
  },
  'compass': {
    viewBox: '148 56.454 224.5 313.546',
    width: 216.5, height: 305.546,
  },
  'dance-area': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'disability-sing': {
    viewBox: '128 98 256.003 312',
    width: 248.003, height: 304,
  },
  'dj-controller': {
    viewBox: '79.5 103.5 303 203',
    width: 295, height: 195,
  },
  'electrical-outlet': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'fan': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'firework': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'gifts': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'heater': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'high-chair-sign': {
    viewBox: '173 43.5 219 361.5',
    width: 211, height: 353.5,
  },
  'left door': {
    viewBox: '99.86 108.63 312.06 308',
    width: 304.06, height: 300,
  },
  'light': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'microphone': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'pillar': {
    viewBox: '177 177 158 158',
    width: 150, height: 150,
  },
  'right-door': {
    viewBox: '97.95 73.5 312.05 333.5',
    width: 304.05, height: 325.5,
  },
  'round-table': {
    viewBox: '92 100 328 328',
    width: 320, height: 320,
  },
  'smoke': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'sound': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'square-table': {
    viewBox: '84 80 332 328',
    width: 324, height: 320,
  },
  'stage': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  },
  'strainght-wall': {
    viewBox: '102 252 308 8',
    width: 300, height: 0,
  },
  't-table': {
    viewBox: '0 0 512 512',
    width: 512, height: 512,
  },
  'target': {
    viewBox: '126.867 143.739 223.05 220.812',
    width: 215.05, height: 212.812,
  },
  'toilet-sign': {
    viewBox: '98.397 102.226 315.014 301.474',
    width: 307.014, height: 293.474,
  },
  'tree': {
    viewBox: '102 152 308 208',
    width: 300, height: 200,
  },
  'u-table': {
    viewBox: '0 0 512 512',
    width: 512, height: 512,
  },
  'water': {
    viewBox: '102 102 308 308',
    width: 300, height: 300,
  }
} as const;

const VALID_ICONS = Object.keys(SPRITES_META).filter(
  key => key !== 'u-table' &&
  key !== 't-table' &&
  key !== 'square-table' &&
  key !== 'round-table'
);

export { SPRITES_META, VALID_ICONS };