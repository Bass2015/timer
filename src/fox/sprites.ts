/**
 * Pixel-art fox, facing right, on a 24×11 grid.
 * o = fur, d = shade, c = cream, k = dark (ears, eye, nose, paws), . = empty.
 */
export const W = 24;
export const H = 11;

export const PALETTE: Record<string, string> = {
  o: '#c66a3d',
  d: '#9a4f2c',
  c: '#f1e4cf',
  k: '#3a2d25',
};

export type Frame = string[];

/** Head, tail and body without legs (8 rows). */
const BODY: Frame = [
  '.................k..k...',
  '.ccc.............oo.oo..',
  'cccco...........oooooo..',
  '.coooo..........ooookook',
  '..ooooooooooooooooccccc.',
  '...ddoooooooooooooccc...',
  '.....ooooooooooooocc....',
  '......ccccccccccoo......',
];

function blank(): string[][] {
  return Array.from({ length: H }, () => Array<string>(W).fill('.'));
}

function stamp(grid: string[][], rows: Frame, top: number): void {
  rows.forEach((row, y) => [...row].forEach((ch, x) => ch !== '.' && (grid[top + y]![x] = ch)));
}

function legs(grid: string[][], rows: Array<[number, number[]]>): void {
  for (const [y, xs] of rows) for (const x of xs) grid[y]![x] = 'k';
}

const toFrame = (g: string[][]): Frame => g.map((r) => r.join(''));

/** Four-step walk: legs apart, body up with legs under it, legs apart (other side), body up. */
export const WALK: Frame[] = (() => {
  const apartA = blank();
  stamp(apartA, BODY, 1);
  legs(apartA, [[9, [7, 10, 14, 17]], [10, [7, 10, 14, 17]]]);

  const up = blank();
  stamp(up, BODY, 0);
  legs(up, [[8, [8, 10, 15, 17]], [9, [8, 10, 15, 17]], [10, [8, 10, 15, 17]]]);

  const apartB = blank();
  stamp(apartB, BODY, 1);
  legs(apartB, [[9, [6, 9, 13, 16]], [10, [6, 9, 13, 16]]]);

  return [toFrame(apartA), toFrame(up), toFrame(apartB), toFrame(up)];
})();

const SIT_BASE: Frame = [
  '.................k..k...',
  '.................oo.oo..',
  '................oooooo..',
  '................ooookook',
  '................occccc..',
  '..............oocccc....',
  '............ooooccc.....',
  '...........ooooocco.....',
  '..........ooooooocok....',
  '....ccoooooooooood.kk...',
  '.....oooooodkk.....kk...',
];

const swap = (f: Frame, y: number, x: number, ch: string): Frame =>
  f.map((row, i) => (i === y ? row.slice(0, x) + ch + row.slice(x + 1) : row));

const tailUp = swap(swap(swap(SIT_BASE, 8, 4, 'c'), 8, 5, 'c'), 9, 4, '.');
const blink = swap(SIT_BASE, 3, 20, 'o');

/** Sitting, slow tail flick and an occasional blink. */
export const SIT: Frame[] = [SIT_BASE, SIT_BASE, tailUp, tailUp, SIT_BASE, SIT_BASE, blink, SIT_BASE];

const SLEEP_BASE: Frame = [
  '........................',
  '........................',
  '........................',
  '........................',
  '...............k.k......',
  '......oooooooo.ooo......',
  '....oooooooooooooooo....',
  '...oooooooooooooddook...',
  '..ooooooooooooooooo.....',
  '...dooooooooooocccc.....',
  '....dddddddddddddd......',
];

/** Curled up asleep, breathing. */
export const SLEEP: Frame[] = [SLEEP_BASE, swap(swap(swap(SLEEP_BASE, 4, 8, 'o'), 4, 9, 'o'), 4, 10, 'o')];
