import {CLASSIC_REWARD_REGISTRY} from '../../../lib/rogue-classic-rewards.mjs';
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
 if(scenario==='rewards'){run.wave=7;run.money=987654;const fainted=makeReferenceMon(4,5,{boxId:'fainted',moves:['Splash']});fainted.hp=0;run.party.push(fainted);run.rewards=['pokeball','berryleppa','beastball'].map((id,index)=>({...CLASSIC_REWARD_REGISTRY.find(r=>r.id===id),rewardId:'readability-'+index,description:(CLASSIC_REWARD_REGISTRY.find(r=>r.id===id)?.description||'')+' 포켓몬의 상태와 사용 가능한 기술을 확인한 다음 선택합니다. '+ '줄바꿈없는긴설명문구를표시해도카드안에서모든내용과등급이보여야합니다.'}));}
 else if(scenario==='beast-capture'){run.wave=21;run.balls.beastball=1;run.screen='battle';const target=makeReferenceMon(803,5,{boxId:'ultra-beast',moves:['Splash'],status:'slp'});target.hp=1;run.combat=createClassicCombat(run,[target]);}
 else if(scenario==='battle'){run.screen='battle';run.combat=createClassicCombat(run,[makeReferenceMon(915,2,{boxId:'foe',moves:['Tackle','Tail Whip']})]);}
 else state.system.pendingHatches=Array.from({length:18},(_,index)=>({id:'hatch-'+index,pokemon:makeReferenceMon([1,4,7,25,133,150][index%6],5,{boxId:'egg-mon-'+index,shiny:index%7===0}),duplicate:index%2===0,refund:index%2===0?50:0,candies:1,eggMove:index%3===0?'용의파동':null}));
 return doc;
}
