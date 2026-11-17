import {eventDoubleUnequalAliasFixture} from '../../fixtures/event-double-unequal-alias.mjs';
import {doubleUnequalAliasFixture} from '../../fixtures/double-unequal-alias.mjs';
import {activeLeadAliasFixture} from '../../fixtures/active-lead-alias.mjs';
import {randomizedFusionAliasFixture} from '../../fixtures/randomized-fusion-alias.mjs';
import {randomizedAliasFixture} from '../../fixtures/randomized-alias.mjs';
import {wildEventReviewFixture} from '../../fixtures/wild-event-alias.mjs';
import {CLASSIC_REWARD_REGISTRY} from '../../../lib/rogue-classic-rewards.mjs';
import {fixture} from '../../fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../../../lib/rogue-reference.mjs';
import {createClassicCombat} from '../../../lib/rogue-battle-engine.mjs';
import {ensureClassicState} from '../../../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../../../lib/rogue-starter-system.mjs';
import {applyClassicAction,activeClassicRun} from '../../../lib/rogue-classic-game.mjs';
import {recordClassicLevelGrowth} from '../../../lib/rogue-classic-growth.mjs';
import {applyClassicPokemonChallenges} from '../../../lib/rogue-challenge-pokemon.mjs';
import {previewClassicDnaFusion} from '../../../lib/rogue-dna-fusion.mjs';
import {applyClassicForm} from '../../../lib/rogue-transformations.mjs';
export function createFixture(scenario='eggs'){
 if(['rogue-v52-moves-single','rogue-v52-moves-double'].includes(scenario)){
  const double=scenario.endsWith('double'),doc=createFixture(double?'profile-double':'profile-single'),run=activeClassicRun(doc);
  run.party=[makeReferenceMon(6,50,{boxId:'moves-own-a',moves:['Flamethrower','Thunderbolt','Surf','Growl']}),...(double?[makeReferenceMon(25,50,{boxId:'moves-own-b',moves:['Quick Attack']})]:[])];run.encounter={kind:'wild'};run.initialSwitchSlots=[];
  run.combat=createClassicCombat(run,[makeReferenceMon(3,50,{boxId:'moves-foe-a',moves:['Splash']}),...(double?[makeReferenceMon(130,50,{boxId:'moves-foe-b',moves:['Splash']})]:[])],{doubles:double});run.party=run.combat.teams[0];return doc;
 }
 if(['rogue-v52-screen-single','rogue-v52-screen-double','rogue-v52-screen-trainer','rogue-v52-screen-empty'].includes(scenario)){
  const double=scenario.endsWith('double'),trainer=scenario.endsWith('trainer'),doc=createFixture(double?'rogue-v52-party-double':'rogue-v52-party-single'),run=activeClassicRun(doc);run.balls={...run.balls,pokeball:5,greatball:3,ultraball:2};run.encounter=trainer?{kind:'trainer',trainer:{name:'시험 트레이너',title:'트레이너'}}:{kind:'wild'};
  if(scenario.endsWith('empty'))for(const key of Object.keys(run.balls))run.balls[key]=0;
  run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'screen-foe-a',moves:['Splash']}),...(double?[makeReferenceMon(143,100,{boxId:'screen-foe-b',moves:['Splash']})]:[])],{doubles:double,trainer});run.party=run.combat.teams[0];return doc;
 }
 if(scenario==='rogue-v52-party-trapped'){
  const doc=createFixture('rogue-v52-party-single'),run=activeClassicRun(doc);run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'party-trapper',moves:['Splash'],ability:'shadowtag'})]);run.party=run.combat.teams[0];return doc;
 }
 if(scenario==='rogue-v52-party-forced'){
  const doc=createFixture('rogue-v52-party-single'),run=activeClassicRun(doc);run.party[0].hp=1;run.encounter={kind:'wild'};
  run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'party-attacker',moves:['Quick Attack']})]);run.party=run.combat.teams[0];applyClassicAction(doc,{action:'turn',command:{type:'move',move:'splash'}});return doc;
 }
 if(['rogue-v52-party-single','rogue-v52-party-double'].includes(scenario)){
  const double=scenario.endsWith('double'),doc=createFixture(double?'profile-double':'profile-single'),run=activeClassicRun(doc);
  run.party=[1,4,7,25,39,52].map((id,index)=>makeReferenceMon(id,50,{boxId:'party-'+index,moves:['Splash']}));run.party[5].hp=0;
  run.encounter={kind:'wild'};run.initialSwitchSlots=[];run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'party-foe-a',moves:['Splash']}),...(double?[makeReferenceMon(143,100,{boxId:'party-foe-b',moves:['Splash']})]:[])],{doubles:double});run.party=run.combat.teams[0];return doc;
 }
 if(['double-special-dynamax','double-special-tera','double-special-zmove'].includes(scenario)){
  const doc=createFixture('profile-double'),run=activeClassicRun(doc),z=scenario==='double-special-zmove';
  run.party=[makeReferenceMon(133,50,{boxId:'special-a',moves:['Quick Attack'],teraType:'Ghost',...(z?{item:'normaliumz'}:{})}),makeReferenceMon(7,50,{boxId:'special-b',moves:['Splash']})];
  run.tools.dynamaxBand=true;run.tools.teraOrb=true;run.tools.zRing=true;run.teraCharged=true;run.encounter={kind:'wild'};run.initialSwitchSlots=[];
  run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'special-foe-a',moves:['Splash']}),makeReferenceMon(143,100,{boxId:'special-foe-b',moves:['Splash']})],{doubles:true});run.party=run.combat.teams[0];return doc;
 }
 if(['reviewed-dynamax','reviewed-tera','reviewed-zmove'].includes(scenario)){
  const doc=createFixture('profile-single'),run=activeClassicRun(doc),z=scenario==='reviewed-zmove';
  run.party=[makeReferenceMon(133,50,{boxId:'reviewed-hero',moves:['Quick Attack'],teraType:'Normal',...(z?{item:'normaliumz'}:{})})];
  run.tools.dynamaxBand=true;run.tools.teraOrb=true;run.tools.zRing=true;run.teraCharged=true;
  run.encounter={kind:'wild'};run.initialSwitchSlots=[];run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'reviewed-foe',moves:['Splash']})]);run.party=run.combat.teams[0];return doc;
 }
 if(scenario==='mega-double-v60'){
  const doc=createFixture('profile-double'),run=activeClassicRun(doc);
  run.party=[makeReferenceMon(6,100,{boxId:'mega-a',moves:['Splash']}),makeReferenceMon(9,100,{boxId:'mega-b',moves:['Splash']})];
  run.tools.megaBracelet=true;run.formItems={'mega-a':['charizarditex'],'mega-b':['blastoisinite']};run.formItemStateRule='source-v1';run.formItemStates={'mega-a':{charizarditex:false},'mega-b':{blastoisinite:false}};
  run.encounter={kind:'wild'};run.initialSwitchSlots=[];run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe-a',moves:['Splash']}),makeReferenceMon(143,100,{boxId:'foe-b',moves:['Splash']})],{doubles:true});run.party=run.combat.teams[0];return doc;
 }
 if(['primal-toggle','necrozma-toggle','primal-double-toggle','necrozma-double-toggle','primal-unavailable','necrozma-unavailable'].includes(scenario)){
  const double=scenario.includes('-double-'),doc=createFixture(double?'profile-double':'profile-single'),run=activeClassicRun(doc),necrozma=scenario.startsWith('necrozma'),item=necrozma?'nsolarizer':'blueorb';
  run.party=[makeReferenceMon(necrozma?800:382,100,{boxId:'form-ui',moves:['Splash']})];
  if(double)run.party.push(makeReferenceMon(7,100,{boxId:'form-ally',moves:['Splash']}));
  run.tools.megaBracelet=true;run.formItems={'form-ui':[item]};run.formItemStateRule='source-v1';run.formItemStates={'form-ui':{[item]:false}};
  if(scenario.endsWith('-unavailable')){run.formItems={'form-ui':[]};run.formItemStates={'form-ui':{}};}
  if(necrozma)doc.classic.system.dex[791]={...doc.classic.system.dex[791],caught:true};
  run.encounter={kind:'wild'};run.initialSwitchSlots=[];run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'form-foe',moves:['Splash']}),...(double?[makeReferenceMon(143,100,{boxId:'form-foe-2',moves:['Splash']})]:[])],{system:doc.classic.system,doubles:double});run.party=run.combat.teams[0];return doc;
 }
 if(scenario==='tera-ogerpon'||scenario==='tera-terapagos'){
  const doc=createFixture('profile-single'),run=activeClassicRun(doc);run.tools.teraOrb=true;run.teraCharged=true;run.party=[makeReferenceMon(scenario==='tera-ogerpon'?1017:1024,100,{boxId:'tera-ui',moves:['Splash']})];run.encounter={kind:'wild'};run.initialSwitchSlots=[];run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'tera-foe',moves:['Splash']})]);run.party=run.combat.teams[0];return doc;
 }
 if(scenario==='gmax-entry'){
  const doc=createFixture('profile-single'),run=activeClassicRun(doc);run.tools.dynamaxBand=true;run.party=[makeReferenceMon(6,100,{boxId:'gmax-ui',moves:['Splash']})];run.formItems={'gmax-ui':['maxmushrooms']};run.party[0]=applyClassicForm(run.party[0],run,'maxmushrooms');run.encounter={kind:'wild'};run.initialSwitchSlots=[];run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'gmax-foe',moves:['Splash']})]);run.party=run.combat.teams[0];return doc;
 }
 if(scenario==='mega-command'||scenario==='mega-command-many'){
  const doc=createFixture('profile-single'),run=activeClassicRun(doc),moves=scenario==='mega-command-many'?['Splash','Protect','Growl','Tackle']:['Splash'];run.party=[makeReferenceMon(6,100,{boxId:'mega-ui',moves})];run.tools.megaBracelet=true;run.balls.pokeball=5;run.balls.greatball=2;run.formItems={'mega-ui':['charizarditex','charizarditey']};run.formItemStateRule='source-v1';run.formItemStates={'mega-ui':{charizarditex:false,charizarditey:false}};run.encounter={kind:'wild'};run.initialSwitchSlots=[];run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'mega-foe',moves:['Splash']})]);run.party=run.combat.teams[0];return doc;
 }
 if(scenario==='active-unequal-pp-double-separated-review')return doubleUnequalAliasFixture({boxId:'alias',targetSlot:1,separated:true});
 if(scenario==='active-unequal-pp-event-double-review')return eventDoubleUnequalAliasFixture('clowning-around',{boxId:'alias'});
 if(['active-unequal-pp-event-review','active-switched-sketch-event-review'].includes(scenario)){const doc=wildEventReviewFixture('berries',{activeSlot:0,sketch:scenario.includes('sketch'),reserveId:'alias'}),run=doc.classic.slots[0];applyClassicAction(doc,{action:'turn',command:{type:'move',move:'tackle'}});for(const id of ['fighter','alias']){const choice=run.combat.requests[0].actors[0].switches.find(s=>run.party[s.index].boxId===id);applyClassicAction(doc,{action:'turn',command:{type:'switch',slot:choice.slot}});}return doc;}
 if(scenario==='active-unequal-pp-double-review')return doubleUnequalAliasFixture({boxId:'alias',targetSlot:1});
 if(scenario==='active-switched-sketch-fusion-review'){const f=randomizedFusionAliasFixture({boxId:'alias',active:true,leadActive:true,abilityRandom:true,sketch:true}),doc=f.doc,run=doc.classic.slots[0];applyClassicAction(doc,{action:'turn',command:{type:'move',move:f.key}});for(let i=0;i<2;i++)applyClassicAction(doc,{action:'turn',command:{type:'switch',slot:run.combat.requests[0].actors[0].switches[0].slot}});return doc;}
 if(scenario==='active-unequal-pp-fusion-review'){const f=randomizedFusionAliasFixture({boxId:'alias',active:true,leadActive:true,abilityRandom:true}),doc=f.doc,run=doc.classic.slots[0];applyClassicAction(doc,{action:'turn',command:{type:'move',move:f.key}});for(let i=0;i<2;i++)applyClassicAction(doc,{action:'turn',command:{type:'switch',slot:run.combat.requests[0].actors[0].switches[0].slot}});return doc;}
 if(scenario==='active-unequal-pp-separated-review'){const doc=activeLeadAliasFixture({boxId:'alias'}),run=doc.classic.slots[0];run.party[0].moves=['Tackle','Growl','몸통박치기'];run.combat=createClassicCombat(run,[makeReferenceMon(143,30,{boxId:'foe',moves:['Splash']})]);run.party=run.combat.teams[0];applyClassicAction(doc,{action:'turn',command:{type:'move',move:'tackle'}});for(let i=0;i<2;i++)applyClassicAction(doc,{action:'turn',command:{type:'switch',slot:run.combat.requests[0].actors[0].switches[0].slot}});return doc;}
 if(scenario==='active-unequal-pp-review'){const doc=activeLeadAliasFixture({boxId:'alias'}),run=doc.classic.slots[0];applyClassicAction(doc,{action:'turn',command:{type:'move',move:'tackle'}});for(let i=0;i<2;i++)applyClassicAction(doc,{action:'turn',command:{type:'switch',slot:run.combat.requests[0].actors[0].switches[0].slot}});return doc;}
 if(['active-lead-alias-review','active-lead-randomized-review','active-lead-rival-randomized-review'].includes(scenario))return activeLeadAliasFixture({boxId:'alias',randomized:scenario.includes('randomized'),kind:scenario.includes('rival')?'rival':'wild'});
 if(['randomized-fusion-active-alias-review','randomized-fusion-active-sketch-review'].includes(scenario))return randomizedFusionAliasFixture({boxId:'alias',active:true,abilityRandom:true,sketch:scenario.includes('sketch')}).doc;
 if(['randomized-alias-review','randomized-ended-alias-review','randomized-active-alias-review','randomized-sketch-review','randomized-active-sketch-review'].includes(scenario))return randomizedAliasFixture({boxId:'alias',ended:scenario==='randomized-ended-alias-review',active:scenario==='randomized-active-alias-review'||scenario==='randomized-active-sketch-review',sketch:scenario.includes('sketch')});
 if(scenario==='randomized-fusion-form-event-sketch-review')return wildEventReviewFixture('berries',{randomMoves:1,randomFusion:true,randomForm:{id:479,key:'wash'},formAsDonor:true,sketch:true,reserveId:'alias'});
 if(scenario==='randomized-fusion-event-sketch-review')return wildEventReviewFixture('fiery-fallout',{randomMoves:1,randomFusion:true,sketch:true,reserveId:'alias'});
 if(scenario==='randomized-fusion-event-alias-review')return wildEventReviewFixture('fiery-fallout',{randomMoves:1,randomFusion:true,reserveId:'alias'});
 if(scenario==='randomized-event-alias-review')return wildEventReviewFixture('fiery-fallout',{randomMoves:1,reserveId:'alias'});
 if(scenario==='active-breeder-alias'||scenario==='active-breeder-sketch')return wildEventReviewFixture('expert-breeder',{sketch:scenario.endsWith('sketch'),reserveId:'alias'});
 if(scenario.startsWith('active-wild-event-')){const item=scenario.slice('active-wild-event-'.length),type=['mysterious-chest','berries','fight-or-flight','uncommon-breed'].find(t=>item===t+'-normal'||item===t+'-sketch');if(type)return wildEventReviewFixture(type,{sketch:item.endsWith('-sketch'),reserveId:'alias'});}
 if(['active-alias-repair','active-sketch-repair','active-trainer-alias-repair','active-trainer-sketch-repair','active-challenge-alias-repair','active-ability-alias-repair','active-ability-sketch-repair','active-ability-fusion-alias-repair','active-ability-fusion-sketch-repair','active-event-alias-repair','active-event-sketch-repair','active-dream-alias-repair','active-dream-sketch-repair','active-event-challenge-alias-repair','active-event-ability-sketch-repair'].includes(scenario)){
  const reserve=scenario.includes('sketch')?makeReferenceMon(235,50,{boxId:'alias',moves:['Tackle','Sketch','몸통박치기'],rogueSketchRule:'source-v1',rogueSketchPP:[2,1,17]}):makeReferenceMon(1,50,{boxId:'alias',moves:['Tackle','몸통박치기','Growl'],pp:{tackle:3,growl:5},roguePPUps:{tackle:2}});
  const challenge=scenario==='active-challenge-alias-repair'||scenario==='active-event-challenge-alias-repair',abilityChallenge=scenario.startsWith('active-ability-')||scenario==='active-event-ability-sketch-repair',{doc,run}=fixture([makeReferenceMon(challenge||abilityChallenge?1:151,50,{boxId:'lead',moves:['Tackle']}),reserve]);
  if(scenario.startsWith('active-dream-')){run.wave=82;run.biome=1;run.screen='mystery';run.party.push(makeReferenceMon(25,50,{boxId:'ally',moves:['Thunderbolt']}));run.formItems={};const drafts=run.party.map((mon,i)=>{const next=makeReferenceMon([10,13,16][i],50,{boxId:'dream'+i,moves:['Splash']});return {oldBoxId:mon.boxId,mon:next,dexIvs:next.ivs,eggMoveIndex:null};});run.encounter={kind:'mystery',key:'weird-dream'};run.mystery={type:'weird-dream',stage:'choose',drafts,alternateTrainer:{name:'또 다른 나',title:'트레이너',moneyMultiplier:0}};run.combat=null;run.npcDialogueQueue=[];applyClassicAction(doc,{action:'mysterySelect',job:'battle'});applyClassicAction(doc,{action:'mysteryConfirm'});const current=activeClassicRun(doc);while(current.npcDialogueQueue?.length){const d=current.npcDialogueQueue[0];applyClassicAction(doc,{action:'npcDialogueSkip',dialogueId:d.id,index:d.index});}return doc;}
  if(scenario.startsWith('active-event-')){run.wave=122;run.biome=4;run.screen='mystery';run.mysteryRule='part-timer-v18';run.encounter={kind:'mystery',key:'a-trainers-test'};run.mystery={type:'a-trainers-test',stage:'choose',trainerId:121};run.combat=null;run.npcDialogueQueue=[];if(challenge||abilityChallenge){run.challenges=abilityChallenge?[{id:12,value:2},{id:10,value:2}]:[{id:0,value:1},{id:1,value:12},{id:5,value:1},{id:8,value:3}];run.challengeEligibilityRule='source-subset-v1';}applyClassicAction(doc,{action:'mysterySelect',job:'battle'});applyClassicAction(doc,{action:'mysteryConfirm'});while(run.npcDialogueQueue?.length){const d=run.npcDialogueQueue[0];applyClassicAction(doc,{action:'npcDialogueSkip',dialogueId:d.id,index:d.index});}return doc;}
  const trainer=scenario.startsWith('active-trainer-');run.screen='battle';run.encounter=trainer?{kind:'trainer',trainer:{id:1,name:'Trainer'}}:{kind:'wild'};run.mystery=null;run.initialSwitchSlots=[];if(challenge){run.challenges=[{id:0,value:1},{id:1,value:12},{id:5,value:1},{id:8,value:3}];run.challengeEligibilityRule='source-subset-v1';}if(abilityChallenge){run.challenges=[{id:12,value:2},{id:10,value:2}];run.challengeEligibilityRule='source-subset-v1';}if(abilityChallenge&&scenario.includes('fusion')){const primary=applyClassicPokemonChallenges(run.party[1],run),donor=applyClassicPokemonChallenges(makeReferenceMon(7,50,{boxId:'donor',moves:['Splash']}),run);run.party[1]=previewClassicDnaFusion(primary,donor,{random:()=>0}).fused;}run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})],{trainer});run.party=run.combat.teams[0];return doc;
 }
 if(/^profile-log-(0|300|1500)$/.test(scenario)){const doc=createFixture('profile-double'),run=activeClassicRun(doc),count=Number(scenario.split('-').at(-1));run.waveLog=Array.from({length:count},(_,i)=>`뮤츠의 스피드스타! · ${i+1}번째 행동 · HP 120/300`);run.waveLogTurnStart=count;return doc;}
 if(scenario==='profile-single'||scenario==='profile-double'){
  const {doc,run}=fixture([makeReferenceMon(150,30,{boxId:'profile-own-150',moves:['Swift','Confusion','Recover','Disable']}),makeReferenceMon(440,30,{boxId:'profile-own-440',moves:['Splash']})]);
  run.wave=38;run.screen='battle';run.encounter={kind:'trainer',name:'격리 성능 검사'};
  run.combat=createClassicCombat(run,[674,264].map(id=>makeReferenceMon(id,100,{boxId:'profile-foe-'+id,moves:['Splash']})),{trainer:true,doubles:scenario==='profile-double'});return doc;
 }
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
 if(scenario==='switch-names'){
  const {doc,run}=fixture([makeReferenceMon(150,30,{boxId:'hero',moves:['Splash']}),makeReferenceMon(130,30,{boxId:'gyara',moves:['Splash']}),makeReferenceMon(925,30,{boxId:'maushold',moves:['Splash']})]);
  run.party[1].name='갸라도스 · Normal';run.party[2].name='파밀리쥐 · Family of Four';run.wave=38;run.screen='battle';run.encounter={kind:'wild'};run.combat=createClassicCombat(run,[makeReferenceMon(674,50,{boxId:'foe',moves:['Splash']})]);run.party=run.combat.teams[0];return doc;
 }
 if(scenario==='evolution-psyduck'){
  const {doc,run}=fixture([makeReferenceMon(54,33,{boxId:'evolving-duck',moves:['Splash']})]);
  Object.assign(run.party[0],{battleAppearance:'psyduck',battleArtId:54,battleSprite:'psyduck',rogueBaseBattleAppearance:'psyduck'});recordClassicLevelGrowth(run,run.party[0],[33],[]);return doc;
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
 else state.system.pendingHatches=Array.from({length:18},(_,index)=>({id:'hatch-'+index,productId:'common',pokemon:makeReferenceMon([1,4,7,25,133,150][index%6],5,{boxId:'egg-mon-'+index,shiny:index%7===0}),duplicate:index%2===0,refund:index%2===0?50:0,candies:1,eggMove:index%3===0?'용의파동':null}));
 return doc;
}
