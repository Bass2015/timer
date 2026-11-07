import { buildSegments, Clock, formatTime, positionAt, PREP_SECONDS, totalMs, type Config, type Phase } from '../engine';
import { buzz, sounds, startKeepAlive, stopKeepAlive, unlockAudio } from '../audio';
import { keepScreenOn, releaseScreen } from '../wakelock';
import { Fox } from '../fox/fox';
import { icons } from './icons';

const PHASE_ICON: Record<Phase, string> = {
  prep: '',
  work: icons.work,
  rest: icons.rest,
  roundRest: icons.roundRest,
};

export function renderRun(root: HTMLElement, config: Config, onExit: () => void): void {
  const segments = buildSegments(config);
  const clock = new Clock();
  const withSound = config.sound === 'beep';

  root.innerHTML = `
    <main class="run" data-phase="prep">
      <div class="phase-icon"></div>
      <div class="count"></div>
      <div class="meta">
        <span class="ex">${icons.exercises}<span></span></span>
        <span class="rd">${icons.rounds}<span></span></span>
      </div>
      <div class="track"></div>
      <div class="bar"></div>
      <nav class="controls">
        <button type="button" data-act="resume">${icons.resume}</button>
        <button type="button" data-act="skip">${icons.skip}</button>
        <button type="button" data-act="end">${icons.stop}</button>
      </nav>
    </main>`;
  const run = root.querySelector<HTMLElement>('.run')!;
  const phaseIcon = run.querySelector<HTMLElement>('.phase-icon')!;
  const count = run.querySelector<HTMLElement>('.count')!;
  const ex = run.querySelector<HTMLElement>('.ex')!;
  const rd = run.querySelector<HTMLElement>('.rd')!;
  const track = run.querySelector<HTMLElement>('.track')!;
  const bar = run.querySelector<HTMLElement>('.bar')!;

  const fox = new Fox(4);
  track.append(fox.el);
  fox.start();
  let onScreen = fox;

  let lastIndex = -1;
  let lastSecond = -1;
  let frame = 0;
  let finished = false;

  const exit = () => {
    cancelAnimationFrame(frame);
    onScreen.stop();
    stopKeepAlive();
    releaseScreen();
    onExit();
  };

  const finish = () => {
    finished = true;
    clock.pause();
    releaseScreen();
    if (withSound) sounds.finish();
    setTimeout(stopKeepAlive, 4000); // let the last bowl ring out on Bluetooth too
    buzz([200, 120, 200]);
    run.classList.remove('paused');
    run.dataset.phase = 'done';
    const sleeper = new Fox(6);
    sleeper.setMode('sleep');
    fox.stop();
    run.replaceChildren(sleeper.el);
    run.insertAdjacentHTML('beforeend', `<div class="meta"><span>${formatTime(totalMs(segments) / 1000 - PREP_SECONDS)}</span></div>`);
    sleeper.start();
    onScreen = sleeper;
  };

  const tick = () => {
    const pos = positionAt(segments, clock.elapsed());
    if (!pos) return exit();
    if (pos.done) return finish();
    const { segment: s, index, remaining } = pos;
    const secLeft = Math.ceil(remaining / 1000);

    if (index !== lastIndex) {
      if (lastIndex !== -1) {
        if (withSound) (s.phase === 'work' ? sounds.work : sounds.rest)();
        buzz(s.phase === 'work' ? 300 : [120, 80, 120]);
      }
      lastIndex = index;
      run.dataset.phase = s.phase;
      phaseIcon.innerHTML = PHASE_ICON[s.phase];
      ex.hidden = s.phase === 'prep';
      ex.lastElementChild!.textContent = `${s.exercise}/${config.exercises}`;
      rd.hidden = s.phase === 'prep' || config.rounds < 2;
      rd.lastElementChild!.textContent = `${s.round}/${config.rounds}`;
      count.classList.toggle('long', s.duration >= 60_000);
      fox.setMode(s.phase === 'work' ? 'walk' : 'sit');
      if (s.phase === 'work') fox.reappear();
    } else if (secLeft !== lastSecond && secLeft <= 3 && s.duration > 3000) {
      if (withSound) sounds.tick();
    }
    if (secLeft !== lastSecond) {
      lastSecond = secLeft;
      count.textContent = s.duration >= 60_000 ? formatTime(secLeft) : String(secLeft);
    }
    // Walking: the fox crosses the screen over the work time. Resting: it sits where it stopped.
    const progress = s.phase === 'work' ? 1 - remaining / s.duration : s.phase === 'prep' ? 0 : 1;
    fox.place(progress, track.clientWidth);
    bar.style.width = `${(remaining / s.duration) * 100}%`;
    frame = requestAnimationFrame(tick);
  };

  const pause = () => {
    clock.pause();
    cancelAnimationFrame(frame);
    fox.freeze(true);
    run.classList.add('paused');
  };
  const resume = () => {
    unlockAudio();
    run.classList.remove('paused');
    fox.freeze(false);
    clock.start();
    frame = requestAnimationFrame(tick);
  };

  run.addEventListener('click', (e) => {
    if (finished) return exit();
    const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
    if (act === 'end') return exit();
    if (act === 'skip') {
      const next = segments[lastIndex + 1];
      clock.seek(next ? next.start : totalMs(segments));
      return resume();
    }
    if (act === 'resume' || !clock.running) return resume();
    pause();
  });

  keepScreenOn();
  if (withSound) startKeepAlive();
  clock.start();
  frame = requestAnimationFrame(tick);
}
