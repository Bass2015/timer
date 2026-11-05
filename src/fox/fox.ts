import { H, PALETTE, SIT, SLEEP, W, WALK, type Frame } from './sprites';

export type Mode = 'walk' | 'sit' | 'sleep';

const ANIM: Record<Mode, { frames: Frame[]; fps: number }> = {
  walk: { frames: WALK, fps: 8 },
  sit: { frames: SIT, fps: 3 },
  sleep: { frames: SLEEP, fps: 1.2 },
};

/** The fox sprite on a tiny canvas, scaled up with crisp pixels by CSS. */
export class Fox {
  readonly el: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mode: Mode = 'sit';
  private frame = -1;
  private raf = 0;
  private startedAt = 0;
  private frozen = false;

  constructor(readonly scale = 4) {
    this.el = document.createElement('canvas');
    this.el.className = 'fox';
    this.el.width = W;
    this.el.height = H;
    this.el.style.width = `${W * scale}px`;
    this.el.style.height = `${H * scale}px`;
    this.ctx = this.el.getContext('2d')!;
  }

  get width(): number {
    return W * this.scale;
  }

  setMode(mode: Mode): void {
    if (mode === this.mode) return;
    this.mode = mode;
    this.startedAt = performance.now();
    this.frame = -1;
  }

  /** Stops on the current frame (the fox stands still while paused). */
  freeze(frozen: boolean): void {
    this.frozen = frozen;
  }

  /** Moves the fox along `trackWidth`, snapped to whole sprite pixels. */
  place(progress: number, trackWidth: number): void {
    const room = Math.max(0, trackWidth - this.width);
    const x = Math.round((Math.min(1, Math.max(0, progress)) * room) / this.scale) * this.scale;
    this.el.style.transform = `translateX(${x}px)`;
  }

  /** Fades the fox in again, used when it starts a new walk from the left. */
  reappear(): void {
    this.el.classList.remove('appear');
    void this.el.offsetWidth;
    this.el.classList.add('appear');
  }

  start(): void {
    const loop = (now: number) => {
      if (!this.frozen) {
        const { frames, fps } = ANIM[this.mode];
        const i = Math.floor(((now - this.startedAt) / 1000) * fps) % frames.length;
        if (i !== this.frame) this.draw(frames[i]!, i);
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.startedAt = performance.now();
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
  }

  private draw(f: Frame, i: number): void {
    this.frame = i;
    this.ctx.clearRect(0, 0, W, H);
    f.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        if (ch === '.') return;
        this.ctx.fillStyle = PALETTE[ch]!;
        this.ctx.fillRect(x, y, 1, 1);
      }),
    );
  }
}
