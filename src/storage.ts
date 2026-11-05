import { DEFAULT_CONFIG, type Config } from './engine';

const KEY = 'timer.config';

export function loadConfig(): Config {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<Config>) };
  } catch {
    /* storage unavailable: use defaults */
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(c: Config): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* storage unavailable: settings last for this session only */
  }
}
