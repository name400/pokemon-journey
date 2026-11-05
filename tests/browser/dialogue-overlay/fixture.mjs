import {ensureClassicState} from '../../../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../../../lib/rogue-starter-system.mjs';
import {applyClassicAction,activeClassicRun} from '../../../lib/rogue-classic-game.mjs';
import {makeReferenceMon} from '../../../lib/rogue-reference.mjs';
import {createClassicCombat} from '../../../lib/rogue-battle-engine.mjs';
import {classicTrainerDialogue} from '../../../lib/rogue-trainer-dialogue.mjs';
export function createFixture(){
const doc={},state=ensureClassicState(doc,{initialStarterId:1}),starter=starterCatalog(state.system).find(s=>s.id===1);
applyClassicAction(doc,{action:'start',selection:[{id:1,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]});
const run=activeClassicRun(doc);run.wave=14;run.screen='battle';run.party=[makeReferenceMon(151,50,{boxId:'hero',moves:['Water Gun']}),makeReferenceMon(4,50,{boxId:'ally',moves:['Ember']})];run.encounter={kind:'trainer',trainer:{id:63,name:'검증 트레이너',sprite:'youngster',double:true}};run.combat=createClassicCombat(run,[makeReferenceMon(143,40,{boxId:'foe',moves:['Splash']}),makeReferenceMon(7,40,{boxId:'foe2',moves:['Splash']})],{trainer:true,doubles:true});
const dialogue=classicTrainerDialogue(run.encounter,'intro',run);run.npcDialogueQueue=[{...dialogue,id:'qa-double-trainer-14',pages:[...dialogue.pages,'모바일에서도 다음 버튼과 건너뛰기를 누르면 전투를 계속할 수 있어야 해.'],index:0}];
return doc;
}
