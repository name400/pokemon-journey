import React,{Profiler} from 'react';
import {createRoot} from 'react-dom/client';
import Page from '../../../app/page';
import '../../../app/globals.css';
import '../../../app/game-shell.css';
import '../../../app/adventure-theme.css';
import '../../../app/rogue-shell-redesign.css';
import '../../../app/pokemon-shell-theme.css';
// Query-gated diagnostic wrapper survives Page's URL normalization on reconnect.
const app=<Page/>;
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).has('profile')?<Profiler id="Page" onRender={(id,phase,actualDuration,baseDuration,startTime,commitTime)=>window.dispatchEvent(new CustomEvent('classic-profile-commit',{detail:{id,phase,actualDuration,baseDuration,startTime,commitTime}}))}>{app}</Profiler>:app);
