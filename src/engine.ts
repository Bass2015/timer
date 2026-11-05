export type Phase = 'prep' | 'work' | 'rest' | 'roundRest';

export interface Config {
  /** Seconds. */
  work: number;
  rest: number;
  exercises: number;
  rounds: number;
  /** Rest between rounds, seconds. */
  roundRest: number;
  sound: 'beep' | 'silent';
}

export interface Segment {
  phase: Phase;
  /** Milliseconds. */
  duration: number;
  /** Start offset from the beginning of the workout, ms. */
  start: number;
  exercise: number;
  round: number;
}

export const PREP_SECONDS = 10;

export const DEFAULT_CONFIG: Config = { work: 330, rest: 0, exercises: 10, rounds: 1, roundRest: 0, sound: 'beep' };

/** Turns the settings into the ordered list of timed stretches; zero-length stretches are left out. */
export function buildSegments(c: Config): Segment[] {
  const out: Segment[] = [];
  let start = 0;
  const push = (phase: Phase, seconds: number, exercise: number, round: number) => {
    if (seconds <= 0) return;
    const duration = seconds * 1000;
    out.push({ phase, duration, start, exercise, round });
    start += duration;
  };
  if (c.work <= 0 || c.exercises <= 0 || c.rounds <= 0) return out;
  push('prep', PREP_SECONDS, 1, 1);
  for (let r = 1; r <= c.rounds; r++) {
    for (let e = 1; e <= c.exercises; e++) {
      push('work', c.work, e, r);
      if (e < c.exercises) push('rest', c.rest, e + 1, r);
    }
    if (r < c.rounds) push('roundRest', c.roundRest, 1, r + 1);
  }
  return out;
}

export function totalMs(segments: Segment[]): number {
  const last = segments[segments.length - 1];
  return last ? last.start + last.duration : 0;
}

export interface Position {
  index: number;
  segment: Segment;
  /** Milliseconds left in the current segment. */
  remaining: number;
  done: boolean;
}

export function positionAt(segments: Segment[], elapsed: number): Position | null {
  if (segments.length === 0) return null;
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]!;
    if (elapsed < s.start + s.duration) return { index: i, segment: s, remaining: s.start + s.duration - elapsed, done: false };
  }
  const last = segments[segments.length - 1]!;
  return { index: segments.length - 1, segment: last, remaining: 0, done: true };
}

/** Wall-clock based stopwatch: elapsed time comes from timestamps, so throttled frames never drift. */
export class Clock {
  private startedAt: number | null = null;
  private accumulated = 0;

  constructor(private now: () => number = () => performance.now()) {}

  get running(): boolean {
    return this.startedAt !== null;
  }

  elapsed(): number {
    return this.accumulated + (this.startedAt === null ? 0 : this.now() - this.startedAt);
  }

  start(): void {
    if (this.startedAt === null) this.startedAt = this.now();
  }

  pause(): void {
    if (this.startedAt === null) return;
    this.accumulated += this.now() - this.startedAt;
    this.startedAt = null;
  }

  /** Jumps to an absolute elapsed time, keeping the running state. */
  seek(ms: number): void {
    this.accumulated = ms;
    if (this.startedAt !== null) this.startedAt = this.now();
  }
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
