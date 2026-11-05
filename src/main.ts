import '@fontsource-variable/manrope';
import './style.css';
import { loadConfig } from './storage';
import { renderSetup } from './ui/setup';
import { renderRun } from './ui/run';

const app = document.getElementById('app')!;
const config = loadConfig();

const showSetup = () => renderSetup(app, config, () => renderRun(app, config, showSetup));
showSetup();
