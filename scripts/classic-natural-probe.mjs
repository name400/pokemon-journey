// Exploratory player: uses only classic game actions, serializes between actions,
// and reports defeat honestly. This is not a 200-floor completion test.
import {readFileSync,writeFileSync} from 'node:fs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../lib/rogue-starter-system.mjs';
import {chooseClassicProbeAction} from './classic-probe-policy.mjs';
import {applyClassicAction,activeClassicRun} from '../lib/rogue-classic-game.mjs';
const option=name=>{const index=process.argv.indexOf(name);if(index<0)return null;if(!process.argv[index+1])throw Error(`${name} requires a path`);return process.argv[index+1];};
const resume=option('--resume'),saveStart=option('--save-start'),saveFailure=option('--save-failure'),saveEnd=option('--save-end');let doc;
if(resume)doc=JSON.parse(readFileSync(resume,'utf8'));
else{const starterId=Number(option('--starter')||1);if(!Number.isSafeInteger(starterId)||starterId<1)throw Error('Invalid --starter');doc={coins:0,collection:[]};const state=ensureClassicState(doc,{initialStarterId:starterId}),starter=starterCatalog(state.system).find(p=>p.id===starterId);if(!starter)throw Error('Starter is unavailable: '+starterId);
 applyClassicAction(doc,{action:'start',selection:[{id:starterId,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]});}
if(saveStart)writeFileSync(saveStart,JSON.stringify(doc));
console.log('Run seed:',activeClassicRun(doc).seed);
let actions=0,last=0,lastPayload=null;const strategy=option('--strategy')||'balanced';if(!['balanced','conserve'].includes(strategy))throw Error('Invalid --strategy');const policy={lastSwitchWave:0,conserveMoney:strategy==='conserve'},trace=process.argv.includes('--trace');console.log('Policy:',strategy);
try{while(actions++<5000){doc=JSON.parse(JSON.stringify(doc));const run=activeClassicRun(doc);if(run.wave!==last){last=run.wave;console.log('wave',last,'screen',run.screen,'party',run.party.map(p=>`${p.name}:${p.hp}/${p.maxHp}`).join(','));}if(['defeat','victory'].includes(run.screen)){console.log('END',run.screen,'wave',run.wave,'actions',actions);if(saveEnd)writeFileSync(saveEnd,JSON.stringify(doc));break;}lastPayload=chooseClassicProbeAction(doc,policy);if(trace)console.log('ACTION',run.wave,JSON.stringify(lastPayload));applyClassicAction(doc,lastPayload);
}if(actions>5000)console.log('STOP action limit',actions-1,'wave',activeClassicRun(doc).wave); }catch(e){if(saveFailure)writeFileSync(saveFailure,JSON.stringify(doc));console.error('ERROR wave',activeClassicRun(doc)?.wave,'screen',activeClassicRun(doc)?.screen,'action',actions,'payload',JSON.stringify(lastPayload),e.stack);process.exitCode=1;}
