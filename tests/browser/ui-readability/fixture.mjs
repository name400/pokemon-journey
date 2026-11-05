import {CLASSIC_REWARD_REGISTRY} from '../../../lib/rogue-classic-rewards.mjs';
import {fixture} from '../../fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../../../lib/rogue-reference.mjs';
import {createClassicCombat} from '../../../lib/rogue-battle-engine.mjs';
import {ensureClassicState} from '../../../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../../../lib/rogue-starter-system.mjs';
import {applyClassicAction,activeClassicRun} from '../../../lib/rogue-classic-game.mjs';
import {recordClassicLevelGrowth} from '../../../lib/rogue-classic-growth.mjs';
export function createFixture(scenario='eggs'){
 if(['pp-empty','pp-all-empty','pp-restored'].includes(scenario)){
  const empty=scenario==='pp-all-empty',pp={tackle:empty?0:35,quickattack:empty?0:30,ember:empty?0:25,extremespeed:scenario==='pp-restored'?5:0};
  const {doc,run}=fixture([makeReferenceMon(813,9,{boxId:'bunny',moves:['Tackle','Quick Attack','Ember','Extreme Speed'],pp})]);
  run.screen='battle';run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]);run.party=run.combat.teams[0];return doc;
 }
 if(['rival-m','rival-f','trainer-normal','trainer-failed'].includes(scenario)){
  const doc=createFixture('trainer'),run=activeClassicRun(doc);
  const rival=scenario.startsWith('rival-');run.encounter.kind=rival?'rival':'trainer';
  run.encounter.trainer={...run.encounter.trainer,name:rival?'라이벌':'벌레마니아',title:rival?'라이벌 · 3차전':'트레이너',gender:scenario==='rival-f'?'F':'M',sprite:rival?'/game/trainers/fallback.svg':scenario==='trainer-normal'?'/game/trainers/bug-superfan.png':'/game/trainers/missing-qa.png'};
  for(const dialogue of run.npcDialogueQueue||[])dialogue.speaker=run.encounter.trainer.name;
  return doc;
 }
 if(scenario==='evolution'||scenario==='evolution-prompt'){
  const {doc,run}=fixture([makeReferenceMon(10,9,{boxId:'evolving',moves:['Tackle','String Shot','Protect','Growl']})]);
  if(scenario==='evolution-prompt')recordClassicLevelGrowth(run,run.party[0],[7,8,9],[]);
  return doc;
 }
 if(scenario==='mystery-motion'){
  const {doc,run}=fixture([makeReferenceMon(151,20,{boxId:'hero',moves:['Seismic Toss']}),makeReferenceMon(7,10,{boxId:'ally',moves:['Tackle']})]);
  run.screen='mystery';run.wave=22;run.biome=4;run.encounter={kind:'mystery',key:'mysterious-chest'};run.mystery={type:'mysterious-chest',stage:'choose',selection:null};return doc;
 }
 if(scenario==='single-types'||scenario==='double-types'){
  const {doc,run}=fixture([730,6].map(id=>makeReferenceMon(id,41,{boxId:'types-own-'+id,moves:['Splash']})));
  run.party[0].hp=12;run.screen='battle';run.combat=createClassicCombat(run,[6,730].map(id=>makeReferenceMon(id,41,{boxId:'types-foe-'+id,moves:['Splash']})),{doubles:scenario==='double-types'});return doc;
 }
 if(scenario==='double-layout'||scenario==='single-layout'){
  const {doc,run}=fixture([150,440].map(id=>makeReferenceMon(id,30,{boxId:'layout-own-'+id,moves:['Splash']})));
  run.wave=38;run.screen='battle';run.encounter={kind:'trainer',name:'더블 배치 검증'};
  run.combat=createClassicCombat(run,[674,264].map(id=>makeReferenceMon(id,30,{boxId:'layout-foe-'+id,moves:['Splash']})),{trainer:true,doubles:scenario==='double-layout'});
  return doc;
 }
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
