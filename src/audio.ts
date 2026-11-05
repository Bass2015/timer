let ctx: AudioContext | null = null;

/** Must run inside a user gesture (iOS only lets audio start from a tap). */
export function unlockAudio(): void {
  // Safari 17+: play through the ringer switch, like a media app.
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (session) session.type = 'playback';
  ctx ??= new AudioContext();
  if (ctx.state !== 'running') void ctx.resume();
}

/** A soft sine with a slow fade-out; extra partials give it a bowl-like colour. */
function tone(freq: number, { gain = 0.25, decay = 1.6, partials = [1], delay = 0 } = {}): void {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(gain, t + 0.015);
  out.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  out.connect(ctx.destination);
  partials.forEach((ratio, i) => {
    const osc = ctx!.createOscillator();
    const g = ctx!.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * ratio;
    g.gain.value = 1 / (i * 2 + 1);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + decay);
  });
}

const BOWL = [1, 2.76, 5.4];

export const sounds = {
  tick: () => tone(660, { gain: 0.18, decay: 0.35 }),
  work: () => tone(523.25, { gain: 0.3, decay: 2.2, partials: BOWL }),
  rest: () => tone(392, { gain: 0.3, decay: 2.2, partials: BOWL }),
  finish: () => {
    tone(392, { gain: 0.28, decay: 2.5, partials: BOWL });
    tone(587.33, { gain: 0.28, decay: 3, partials: BOWL, delay: 0.45 });
  },
};

export function buzz(ms: number | number[]): void {
  navigator.vibrate?.(ms);
}
