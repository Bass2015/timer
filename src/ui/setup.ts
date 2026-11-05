import { buildSegments, formatTime, PREP_SECONDS, totalMs, type Config } from '../engine';
import { sounds, unlockAudio } from '../audio';
import { saveConfig } from '../storage';
import { icons } from './icons';
import { pad2, range, wheel } from './wheel';

type Field = { key: keyof Config; icon: string; kind: 'time' | 'count' | 'sound'; tone?: string; min?: number; max?: number };

const FIELDS: Field[] = [
  { key: 'work', icon: icons.work, kind: 'time', tone: 'work' },
  { key: 'rest', icon: icons.rest, kind: 'time', tone: 'rest' },
  { key: 'exercises', icon: icons.exercises, kind: 'count', min: 1, max: 60 },
  { key: 'rounds', icon: icons.rounds, kind: 'count', min: 1, max: 30 },
  { key: 'roundRest', icon: icons.roundRest, kind: 'time', tone: 'round' },
  { key: 'sound', icon: icons.sound, kind: 'sound' },
];

function totalLabel(c: Config): string {
  const s = Math.max(0, Math.round(totalMs(buildSegments(c)) / 1000) - PREP_SECONDS);
  const h = Math.floor(s / 3600);
  return h ? `${h}:${formatTime(s % 3600)}` : formatTime(s);
}

export function renderSetup(root: HTMLElement, config: Config, onStart: () => void): void {
  root.innerHTML = `
    <main class="setup">
      <div class="rows"></div>
      <div class="start"><button type="button" aria-label="Empezar">${icons.play}</button><span class="total"></span></div>
    </main>`;
  const rows = root.querySelector<HTMLElement>('.rows')!;
  const startBtn = root.querySelector<HTMLButtonElement>('.start button')!;
  const total = root.querySelector<HTMLElement>('.total')!;
  let open: { row: HTMLElement; close: () => void } | null = null;

  const refreshTotal = () => {
    total.textContent = totalLabel(config);
    startBtn.disabled = buildSegments(config).length === 0;
  };

  const valueHtml = (f: Field) => {
    const v = config[f.key];
    if (f.kind === 'time') return `<span class="value ${f.tone}">${formatTime(v as number)}</span>`;
    if (f.kind === 'sound') return `<span class="value glyph">${v === 'beep' ? icons.soundOn : icons.soundOff}</span>`;
    return `<span class="value">${v}</span>`;
  };

  const set = (f: Field, v: Config[keyof Config]) => {
    (config as unknown as Record<string, unknown>)[f.key] = v;
    saveConfig(config);
    refreshTotal();
  };

  for (const f of FIELDS) {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<span class="label">${f.icon}</span><div class="value-wrap">${valueHtml(f)}</div>`;
    const wrap = row.querySelector<HTMLElement>('.value-wrap')!;
    const showValue = () => (wrap.innerHTML = valueHtml(f));

    row.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.wheels')) return;
      if (f.kind === 'sound') {
        set(f, config.sound === 'beep' ? 'silent' : 'beep');
        showValue();
        if (config.sound === 'beep') {
          unlockAudio();
          sounds.tick();
        }
        return;
      }
      const wasOpen = open?.row === row;
      open?.close();
      if (wasOpen) return;

      const wheels = document.createElement('div');
      wheels.className = 'wheels';
      if (f.kind === 'time') {
        const secs = config[f.key] as number;
        let m = Math.floor(secs / 60);
        let s = secs % 60;
        const update = () => set(f, m * 60 + s);
        const sep = document.createElement('span');
        sep.className = `sep value ${f.tone}`;
        sep.textContent = ':';
        wheels.append(
          wheel(range(0, 59), m, f.tone!, (v) => ((m = v), update()), pad2),
          sep,
          wheel(range(0, 59), s, f.tone!, (v) => ((s = v), update()), pad2),
        );
      } else {
        wheels.append(wheel(range(f.min!, f.max!), config[f.key] as number, '', (v) => set(f, v)));
      }
      wrap.replaceChildren(wheels);
      row.classList.add('editing');
      open = {
        row,
        close: () => {
          row.classList.remove('editing');
          showValue();
          open = null;
        },
      };
    });
    rows.append(row);
  }

  // Tapping anywhere outside the open row puts the value back.
  root.querySelector('.setup')!.addEventListener('pointerdown', (e) => {
    if (open && !open.row.contains(e.target as Node)) open.close();
  });

  startBtn.addEventListener('click', () => {
    open?.close();
    unlockAudio();
    onStart();
  });
  refreshTotal();
}
