import { buzz } from '../audio';

const ITEM = 52;

/** A drum-style picker built on native scroll snapping, so momentum feels like the phone's own. */
export function wheel(values: number[], selected: number, cls: string, onChange: (v: number) => void, format: (v: number) => string = String): HTMLElement {
  const el = document.createElement('div');
  el.className = `wheel ${cls}`;
  el.innerHTML = `<div class="pad"></div>${values.map((v) => `<div class="item">${format(v)}</div>`).join('')}<div class="pad"></div>`;

  let index = Math.max(0, values.indexOf(selected));
  // Position once the element is in the DOM and has a height.
  requestAnimationFrame(() => (el.scrollTop = index * ITEM));

  el.addEventListener('scroll', () => {
    const i = Math.min(values.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM)));
    if (i === index) return;
    index = i;
    buzz(4);
    onChange(values[i]!);
  });
  el.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.item');
    if (!item) return;
    const i = [...el.querySelectorAll('.item')].indexOf(item);
    el.scrollTo({ top: i * ITEM, behavior: 'smooth' });
  });
  return el;
}

export const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
export const pad2 = (n: number) => String(n).padStart(2, '0');
