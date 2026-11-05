import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import policy from '../data/rogue-dream-native-item-policy.json' with {type:'json'};
import {classicDreamNativeItem} from '../lib/rogue-dream-native-items.mjs';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {prepareWeirdDreamEncounter,stageWeirdDreamParty,stageWeirdDreamBattle} from '../lib/rogue-weird-dream.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
const approved=policy.items.filter(i=>i.allowed);
test('policy matches the pinned native item catalog and explicitly reports rejected categories',()=>{execFileSync(process.execPath,['scripts/build-dream-native-item-policy.mjs','--check'],{cwd:process.cwd(),stdio:'pipe'});assert.equal(approved.length,134);for(const item of ['rustedsword','blueorb','flameplate','wellspringmask','abilitycapsule','missing-item'])assert.equal(classicDreamNativeItem({item},{dreamNativeItemsRule:'reviewed-native-v2'}),null);assert.equal(classicDreamNativeItem({item:''},{}),'');assert.equal(classicDreamNativeItem({item:'airballoon'},{}),null);});
test('every approved item survives full-party dream transformation and alternate native combat with legacy isolation',async()=>{
 for(const {id}of approved){const {doc,run}=fixture([4,1,25].map((species,i)=>makeReferenceMon(species,20,{boxId:'old'+i,item:i===0?id:'',moves:['Splash']})));run.dreamNativeItemsRule='reviewed-native-v2';const before=structuredClone(doc),prepared=prepareWeirdDreamEncounter(run);assert.ok(prepared,id);assert.deepEqual(doc,before,id);
 const drafts=run.party.map((old,i)=>{const mon=makeReferenceMon([7,10,16][i],20,{boxId:'new'+i,moves:['Splash']});return {oldBoxId:old.boxId,mon,dexIvs:mon.ivs,eggMoveIndex:null};});
 const staged=stageWeirdDreamParty(run,doc.classic.system,drafts);assert.equal(staged.run.party[0].item,id);assert.deepEqual(doc,before);
 const enemies=stageWeirdDreamBattle(run,drafts);assert.equal(enemies[0].item,id);assert.equal(enemies[0].rogueNativeItemNontransferable,true);
 const restored=await decodeGameData(await encodeGameData({...doc,classic:{...doc.classic,slots:[staged.run,...doc.classic.slots.slice(1)]}}));assert.equal(restored.classic.slots[0].party[0].item,id);assert.deepEqual(restored.adventure,doc.adventure);
 const battleRun={...staged.run,screen:'battle',encounter:{kind:'mystery'},combat:null};battleRun.combat=createClassicCombat(battleRun,enemies,{trainer:true});assert.ok(battleRun.combat.snapshot);assert.deepEqual(doc,before);
 }
});
test('newly admitted Air Balloon pops in a real hit after a dream transaction',()=>{const {doc,run}=fixture([4,1,25].map((species,i)=>makeReferenceMon(species,50,{boxId:'balloon'+i,item:i===0?'airballoon':'',moves:['Splash']})));run.dreamNativeItemsRule='reviewed-native-v2';const drafts=run.party.map((old,i)=>{const mon=makeReferenceMon(7,50,{boxId:'balloonnew'+i,moves:['Splash']});return {oldBoxId:old.boxId,mon,dexIvs:mon.ivs};}),staged=stageWeirdDreamParty(run,doc.classic.system,drafts).run;staged.party=[staged.party[0]];staged.screen='battle';staged.encounter={kind:'wild'};staged.combat=createClassicCombat(staged,[makeReferenceMon(915,2,{boxId:'balloonhit',moves:['Tackle']})]);staged.combat=playClassicCombat(staged,{type:'move',move:'splash'});assert.equal(staged.combat.teams[0][0].item,'');assert.ok(staged.combat.teams[0][0].hp>0);});
