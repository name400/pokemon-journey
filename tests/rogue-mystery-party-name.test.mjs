import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {classicDisplayPokemonName,classicPartyMemberDisplayName} from '../lib/rogue-display-name.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

test('mystery selection and confirmation show the same nickname after save and reload',async()=>{
 let doc={coins:99,adventure:{safe:true}},state=ensureClassicState(doc),hero=makeReferenceMon(151,40,{boxId:'hero',moves:['Splash']}),other=makeReferenceMon(7,40,{boxId:'ally',moves:['Splash']});
 hero.nickname='내 친구';state.slots[0]={id:'names',seed:'names',rng:42,wave:22,biome:4,screen:'mystery',mysteryRule:'part-timer-v17',party:[hero,other],modifiers:[],tools:{},balls:{},money:100000,encounter:{kind:'mystery',key:'fun-and-games'},mystery:{type:'fun-and-games',stage:'choose'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[]};state.slots[1]={id:'other',safe:true};
 const before=structuredClone(state.slots[0].party),view=classicGameView(doc),listed=view.run.party.find(p=>p.boxId==='hero');assert.equal(classicDisplayPokemonName(listed),'내 친구');assert.notEqual(listed.name,'내 친구');
 applyClassicAction(doc,{action:'mysterySelect',job:'play',boxId:'hero'});doc=await decodeGameData(await encodeGameData(doc));const selected=classicGameView(doc);
 assert.equal(classicPartyMemberDisplayName(selected.run.party,selected.run.mystery.selection.boxId),'내 친구');assert.deepEqual(doc.classic.slots[0].party,before);assert.deepEqual(doc.classic.slots[1],{id:'other',safe:true});assert.deepEqual(doc.adventure,{safe:true});
 applyClassicAction(doc,{action:'mysteryCancel'});assert.deepEqual(doc.classic.slots[0].party,before);
});
test('party lookup retains form presentation and handles a missing member without changing data',()=>{
 const party=[{boxId:'form',name:'쉐이미 · Sky',baseName:'쉐이미',formName:'Sky'},{boxId:'named',name:'뮤',nickname:'별 · Blue'}],before=structuredClone(party);
 assert.equal(classicPartyMemberDisplayName(party,'form'),'쉐이미');assert.equal(classicPartyMemberDisplayName(party,'named'),'별 · Blue');assert.equal(classicPartyMemberDisplayName(party,'missing'),'포켓몬');assert.equal(classicPartyMemberDisplayName([{name:'정보 없음'}],undefined),'포켓몬');assert.deepEqual(party,before);
});
