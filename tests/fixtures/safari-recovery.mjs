import {ensureClassicState} from '../../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../../lib/rogue-starter-system.mjs';
import {applyClassicAction,activeClassicRun} from '../../lib/rogue-classic-game.mjs';
import {makeReferenceMon,rogueSpecies} from '../../lib/rogue-reference.mjs';
import {classicSafariPokemon} from '../../lib/rogue-safari.mjs';

// Construct the encounter through real controller actions; only encounter placement
// and a deterministic guaranteed-catch seed are fixture inputs.
export function safariFixture({full=true,wave=43,dialogue=false}={}){
 const doc={coins:77,adventure:{safe:true}},state=ensureClassicState(doc,{initialStarterId:1}),starter=starterCatalog(state.system).find(s=>s.id===1);
 applyClassicAction(doc,{action:'start',selection:[{id:1,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]});
 const run=activeClassicRun(doc);Object.assign(run,{wave,rng:12345678,biome:5,biomeStep:(wave-1)%10+1,screen:'mystery',money:100000,mystery:{type:'safari-zone',stage:'choose'},mysteryState:{spawnWeight:3,history:[]},encounter:{kind:'mystery',key:'safari-zone'},rewards:[]});
 delete run.combat;delete run.pendingMysteryPreBattle;delete run.pendingRewardGeneration;run.npcDialogueQueue=[];
 if(!dialogue)delete run.npcDialogueRule;
 run.party=Array.from({length:full?6:1},(_,i)=>makeReferenceMon(i===0?151:7,50,{boxId:'member-'+i,moves:['Splash']}));
 run.modifiers=[{id:'leftovers',boxId:'member-1',count:1},{id:'quickclaw',boxId:'member-2',count:1}];
 state.slots[1]={id:'other-slot',unchanged:true};
 for(let i=0;i<10000;i++){const seed='safari-recovery-'+i,p=classicSafariPokemon({...run,seed},2);if(rogueSpecies.get(p.rogueSourceId).catchRate===255){run.seed=seed;break;}}
 applyClassicAction(doc,{action:'mysterySelect',job:'enter'});applyClassicAction(doc,{action:'mysteryConfirm'});
 return doc;
}
export function clearSafariDialogue(doc){const run=activeClassicRun(doc);while(run.npcDialogueQueue?.length){const d=run.npcDialogueQueue[0];applyClassicAction(doc,{action:'npcDialogueSkip',dialogueId:d.id,index:d.index});}}
export function safariLastEncounter(doc){clearSafariDialogue(doc);for(let i=0;i<2;i++){const run=activeClassicRun(doc);applyClassicAction(doc,{action:'safariAction',choice:'leave',step:run.mystery.safari.step});}return activeClassicRun(doc);}
export function blockedSafariFixture(){const doc=safariFixture();safariLastEncounter(doc);applyClassicAction(doc,{action:'safariAction',choice:'ball',step:2});applyClassicAction(doc,{action:'acceptCapture',release:true});return JSON.parse(JSON.stringify(doc));}
