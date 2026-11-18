import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {previewClassicDnaFusion,validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {starterProgress} from '../lib/rogue-starter-system.mjs';
import {addClassicFriendship} from '../lib/rogue-classic-growth.mjs';
import {createClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function setup(donorId=4){
 const primary=makeReferenceMon(1,20,{boxId:'primary',moves:['Seismic Toss'],friendship:50}),donor=makeReferenceMon(donorId,20,{boxId:'donor',moves:['Tackle']});
 const fused=previewClassicDnaFusion(primary,donor,{random:()=>0}).fused;return fixture([fused]);
}

test('actual battle friendship credits both families and survives save recovery',async()=>{
 let {doc,state,run}=setup();assert.ok(validatedClassicDnaFusion(run.party[0]));const first=starterProgress(state.system,1),second=starterProgress(state.system,4);first.friendshipPoints=74;second.friendshipPoints=74;
 const foe=makeReferenceMon(19,1,{boxId:'weak',moves:['Splash']});foe.hp=1;run.screen='battle';run.initialSwitchSlots=[];run.combat=createClassicCombat(run,[foe]);run.party=run.combat.teams[0];applyClassicAction(doc,{action:'turn',command:{type:'move',move:'seismictoss'}});
 assert.equal(run.party[0].friendship,53);assert.equal(first.candies,1);assert.equal(second.candies,1);assert.equal(first.friendshipPoints,3);assert.equal(second.friendshipPoints,3);
 doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);assert.equal(state.system.starterData[1].candies,1);assert.equal(state.system.starterData[4].candies,1);assert.equal(state.system.starterData[1].friendshipPoints,3);assert.equal(state.system.starterData[4].friendshipPoints,3);assert.equal(state.slots[0].party[0].fusionSpecies,4);assert.deepEqual(doc.adventure,{safe:true});assert.equal(state.slots[1].id,'other');
});

test('ordinary, ambiguous and separated Pokémon retain ordinary future progress',()=>{
 for(const mode of ['ordinary','invalid','unspliced']){const {doc,state,run}=setup();if(mode==='ordinary')run.party[0]=makeReferenceMon(1,20,{boxId:'primary',moves:['Tackle']});else if(mode==='invalid')run.party[0].fusionSpecies=25;else applyClassicAction(doc,{action:'unsplice',boxId:'primary',confirm:true});
  addClassicFriendship(run.party[0],3,state.system);assert.equal(state.system.starterData[1].friendshipPoints,9);assert.equal(state.system.starterData[4]?.friendshipPoints||0,0);
 }
});

test('two fusion components in one family each contribute their rounded share',()=>{
 const {state,run}=setup(2);assert.ok(validatedClassicDnaFusion(run.party[0]));addClassicFriendship(run.party[0],3,state.system);assert.equal(state.system.starterData[1].friendshipPoints,8);
});

test('soothe bell applies before splitting and does not change existing candy balances',()=>{
 const {state,run}=setup();starterProgress(state.system,1).candies=2;starterProgress(state.system,4).candies=3;addClassicFriendship(run.party[0],3,state.system,{sootheBells:1});assert.equal(run.party[0].friendship,54);assert.equal(state.system.starterData[1].friendshipPoints,6);assert.equal(state.system.starterData[4].friendshipPoints,6);assert.equal(state.system.starterData[1].candies,2);assert.equal(state.system.starterData[4].candies,3);
});
