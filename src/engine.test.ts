import { describe, expect, it } from 'vitest';
import { buildSegments, Clock, DEFAULT_CONFIG, formatTime, positionAt, totalMs, type Config } from './engine';

const cfg = (over: Partial<Config>): Config => ({ ...DEFAULT_CONFIG, ...over });

describe('buildSegments', () => {
  it('builds the screenshot workout: prep + 10 work blocks, no rests', () => {
    const s = buildSegments(DEFAULT_CONFIG);
    expect(s.map((x) => x.phase)).toEqual(['prep', ...Array(10).fill('work')]);
    expect(totalMs(s)).toBe((10 + 330 * 10) * 1000);
    expect(s[10]!.exercise).toBe(10);
  });

  it('alternates rest between exercises but not after the last one, and rests between rounds', () => {
    const s = buildSegments(cfg({ work: 5, rest: 3, exercises: 2, rounds: 2, roundRest: 4 }));
    expect(s.map((x) => `${x.phase}:${x.exercise}/${x.round}`)).toEqual([
      'prep:1/1', 'work:1/1', 'rest:2/1', 'work:2/1', 'roundRest:1/2', 'work:1/2', 'rest:2/2', 'work:2/2',
    ]);
    expect(totalMs(s)).toBe((10 + 5 + 3 + 5 + 4 + 5 + 3 + 5) * 1000);
  });

  it('starts each segment where the previous one ends', () => {
    const s = buildSegments(cfg({ work: 5, rest: 3, exercises: 3, rounds: 2, roundRest: 4 }));
    for (let i = 1; i < s.length; i++) expect(s[i]!.start).toBe(s[i - 1]!.start + s[i - 1]!.duration);
  });

  it('is empty when there is nothing to do', () => {
    expect(buildSegments(cfg({ work: 0 }))).toEqual([]);
    expect(buildSegments(cfg({ exercises: 0 }))).toEqual([]);
  });
});

describe('positionAt', () => {
  const s = buildSegments(cfg({ work: 5, rest: 3, exercises: 2, rounds: 1 }));

  it('finds the current segment and time left', () => {
    expect(positionAt(s, 0)).toMatchObject({ index: 0, remaining: 10_000, done: false });
    expect(positionAt(s, 12_000)).toMatchObject({ index: 1, remaining: 3_000 });
    expect(positionAt(s, 15_000)!.segment.phase).toBe('rest');
  });

  it('reports done past the end', () => {
    expect(positionAt(s, totalMs(s))).toMatchObject({ done: true, remaining: 0 });
  });
});

describe('Clock', () => {
  it('pauses, resumes and seeks', () => {
    let t = 0;
    const c = new Clock(() => t);
    c.start();
    t = 1000;
    c.pause();
    t = 5000;
    expect(c.elapsed()).toBe(1000);
    c.start();
    t = 5500;
    expect(c.elapsed()).toBe(1500);
    c.seek(10_000);
    t = 6000;
    expect(c.elapsed()).toBe(10_500);
  });
});

it('formats mm:ss', () => {
  expect(formatTime(330)).toBe('05:30');
  expect(formatTime(0)).toBe('00:00');
});
