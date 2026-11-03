import assert from 'node:assert/strict';
import {TOTAL_WAVES,BOSS_WAVES,waveLevel,rogueEncounter} from '../lib/rogue-campaign.mjs';
import {rules} from '../lib/pokemon-config.mjs';
assert.equal(waveLevel(1),2);assert.ok(waveLevel(5)<5);assert.equal(TOTAL_WAVES,200);
for(let wave=1;wave<=200;wave++){assert.ok(waveLevel(wave)>=2&&waveLevel(wave)<=100);if(wave>1)assert.ok(waveLevel(wave)>=waveLevel(wave-1));}
for(let i=0;i<100;i++){const e=rogueEncounter(1,()=>i/100);assert.equal(e.team[0].level,2);assert.ok(Object.values(rules.species[e.team[0].id].baseStats).reduce((n,x)=>n+x,0)<=340);}
for(const wave of BOSS_WAVES){const e=rogueEncounter(wave,()=>0);assert.ok(e.trainer);assert.ok(e.team.length>=2);assert.ok(e.team.every(p=>p.level<=100));}
assert.equal(rogueEncounter(200).trainer.name,'그린');
console.log('Level-5 starters face level-2 early encounters, bounded early species strength and monotonic progression to the level-100 finale: passed');
