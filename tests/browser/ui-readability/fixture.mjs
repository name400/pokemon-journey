import {fixture} from '../../fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../../../lib/rogue-reference.mjs';
import {createClassicCombat} from '../../../lib/rogue-battle-engine.mjs';
import {ensureClassicState} from '../../../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../../../lib/rogue-starter-system.mjs';
import {applyClassicAction,activeClassicRun} from '../../../lib/rogue-classic-game.mjs';
export function createFixture(scenario='eggs'){
 if(scenario==='trainer'||scenario==='victory'){
  const doc={adventure:{safe:true},coins:37},state=ensureClassicState(doc,{initialStarterId:1}),starter=starterCatalog(state.system).find(s=>s.id===1);
  applyClassicAction(doc,{action:'start',selection:[{id:1,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]});
  const run=activeClassicRun(doc);run.seed='dialogue-test';run.rng=42;run.wave=4;run.screen='advance';run.party=[makeReferenceMon(150,5,{boxId:'hero',moves:['Disable','Confusion','Teleport','Psywave']})];state.slots[1]={id:'other',untouched:true};applyClassicAction(doc,{action:'next'});
  if(scenario==='victory'){while(run.npcDialogueQueue?.length){const d=run.npcDialogueQueue[0];applyClassicAction(doc,{action:'npcDialogueSkip',dialogueId:d.id,index:d.index});}run.party=[makeReferenceMon(150,100,{boxId:'hero',moves:['Seismic Toss']})];run.combat=createClassicCombat(run,[makeReferenceMon(19,1,{boxId:'last-foe',moves:['Splash'],hp:1})],{trainer:true});run.initialSwitchSlots=[];run.screen='battle';}
  return doc;
 }
 const {doc,state,run}=fixture([makeReferenceMon(150,5,{boxId:'hero',moves:['Disable','Confusion','Teleport','Psywave']})]);run.wave=1;run.biome=0;
 if(scenario==='battle'){run.screen='battle';run.combat=createClassicCombat(run,[makeReferenceMon(915,2,{boxId:'foe',moves:['Tackle','Tail Whip']})]);}
 else state.system.pendingHatches=Array.from({length:18},(_,index)=>({id:'hatch-'+index,pokemon:makeReferenceMon([1,4,7,25,133,150][index%6],5,{boxId:'egg-mon-'+index,shiny:index%7===0}),duplicate:index%2===0,refund:index%2===0?50:0,candies:1,eggMove:index%3===0?'용의파동':null}));
 return doc;
}
