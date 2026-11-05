/** Thin line icons (24×24, stroke = currentColor) so they sit next to the light numerals. */
const svg = (d: string, label: string) =>
  `<svg class="icon" viewBox="0 0 24 24" role="img" aria-label="${label}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;

export const icons = {
  work: svg('M6.5 7.5v9M3.5 10v4M17.5 7.5v9M20.5 10v4M6.5 12h11', 'Trabajo'),
  rest: svg('M9.5 6.5v11M14.5 6.5v11', 'Descanso'),
  exercises: svg('M13 3 5.5 13.5H11L10 21l7.5-10.5H12L13 3z', 'Ejercicios'),
  rounds: svg('M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4', 'Rondas'),
  roundRest: svg('M7 3.5h10M7 20.5h10M8 3.5c0 4.5 8 4.5 8 8.5s-8 4-8 8.5M16 3.5c0 4.5-8 4.5-8 8.5s8 4 8 8.5', 'Reinicio de la ronda'),
  sound: svg('M9 17.5V6l10-2v11.5M9 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 15.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z', 'Sonido'),
  soundOn: svg('M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11', 'Con sonido'),
  soundOff: svg('M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5', 'Sin sonido'),
  play: svg('M8 5.5v13l10.5-6.5z', 'Empezar'),
  resume: svg('M8 5.5v13l10.5-6.5z', 'Seguir'),
  skip: svg('M6 6l8.5 6L6 18zM18 6v12', 'Saltar'),
  stop: svg('M7 7h10v10H7z', 'Terminar'),
};
