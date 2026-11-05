import { describe, expect, it } from 'vitest';
import { H, PALETTE, SIT, SLEEP, W, WALK } from './sprites';

describe('fox sprites', () => {
  for (const [name, frames] of Object.entries({ WALK, SIT, SLEEP })) {
    it(`${name} frames are ${W}×${H} and use only palette colours`, () => {
      for (const f of frames) {
        expect(f).toHaveLength(H);
        for (const row of f) {
          expect(row).toHaveLength(W);
          for (const ch of row) expect(ch === '.' || ch in PALETTE).toBe(true);
        }
      }
    });
  }
});
