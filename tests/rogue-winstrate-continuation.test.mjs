import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {configure} from '../lib/pokemon-config.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
const doc={coins:13,collection:[],adventure:{untouched:true}},state=ensureClassicState(doc),hero=makeReferenceMon(150,100,{boxId:'hero',moves:['Tackle']});
hero.rogueBaseStats={hp:9999,atk:9999,def:9999,spa:9999,spd:9999,spe:9999};Object.assign(hero,configure(hero));
const run={id:'winstrate',seed:'winstrate',wave:101,biome:1,rng:42,weather:'raindance',screen:'winstrateNext',party:[hero],balls:{pokeball:5},money:1000,modifiers:[{id:'lure',boxId:null,count:1,remaining:2}],tools:{},encounter:{kind:'mystery',key:'winstrate'},mystery:{type:'winstrate',stage:'between',job:'battle',round:0},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[],rerolls:0,mysteryState:{spawnWeight:3,history:[]}};state.slots[0]=run;
let current=doc;
for(let round=0;round<5;round++){
 let live=ensureClassicState(current).slots[0];if(round===4)live.npcDialogueRule='source-v1';assert.equal(live.screen,'winstrateNext');assert.equal(live.mystery.round,round);if(round>0)assert.throws(()=>applyClassicAction(current,{action:'winstrateContinue',round:round-1}));const oldHp=live.party[0].hp;
 applyClassicAction(current,{action:'winstrateContinue',round});assert.equal(live.screen,'battle');assert.equal(live.party[0].hp,oldHp);
 assert.throws(()=>applyClassicAction(current,{action:'winstrateContinue',round}));
 // Lower only synthetic test enemies' HP; all progression uses real battle actions.
 for(const p of live.combat.snapshot.sides[1].pokemon)p.hp=1;for(const p of live.combat.teams[1])p.hp=1;
 let turns=0;while(live.screen==='battle'&&turns++<40){const req=live.combat.requests[0];if(req.kind==='switch')throw Error('unexpected test party knockout');applyClassicAction(current,{action:'turn',command:{type:'move',move:'tackle'}});}
 assert.ok(turns<40,`round ${round} ended`);current=JSON.parse(JSON.stringify(current));live=ensureClassicState(current).slots[0];if(round<4){assert.equal(live.mystery.stage,'between');assert.equal(live.weather,'raindance');assert.equal(live.modifiers.find(m=>m.id==='lure').remaining,2);}
}
const done=ensureClassicState(current),final=done.slots[0];assert.equal(final.mystery.stage,'resolved');assert.equal(final.modifiers.find(m=>m.id==='lure').remaining,1);assert.equal(final.screen,'reward');assert.equal(done.system.vouchers.premium,1);assert.deepEqual(final.npcDialogueQueue.map(q=>q.sourceKey),['winstrate.victory','winstrate.victory2']);while(final.npcDialogueQueue.length){const q=final.npcDialogueQueue[0];applyClassicAction(current,{action:'npcDialogueSkip',dialogueId:q.id,index:q.index});}assert.equal(final.rewards.length,1);assert.equal(final.rewards[0].id,'machobrace');assert.throws(()=>applyClassicAction(current,{action:'winstrateContinue'}));assert.deepEqual(current.adventure,{untouched:true});
console.log('Winstrate five-battle progression, serialization and one-time voucher passed');
// The refusal path restores fainted allies and PP and offers exactly one party candy.
{
 const declined={coins:77,collection:[],adventure:{untouched:'rest'}},st=ensureClassicState(declined),p=makeReferenceMon(1,20,{boxId:'rest',moves:['Tackle']});p.hp=0;p.status='독';p.pp={tackle:1};
 const r={id:'rest',seed:'rest',wave:101,biome:1,rng:44,screen:'mystery',party:[p],balls:{pokeball:1},money:200,modifiers:[],tools:{},encounter:{kind:'mystery',key:'winstrate'},mystery:{type:'winstrate',stage:'choose'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[],rerolls:0,mysteryState:{spawnWeight:3,history:[]}};st.slots[0]=r;
 applyClassicAction(declined,{action:'mysterySelect',job:'rest'});const resume=JSON.parse(JSON.stringify(declined));applyClassicAction(resume,{action:'mysteryConfirm'});const saved=ensureClassicState(resume).slots[0];assert.equal(saved.party[0].hp,saved.party[0].maxHp);assert.equal(saved.party[0].status,null);assert.deepEqual(saved.party[0].pp,{});assert.equal(saved.rewards.length,1);assert.equal(saved.rewards[0].id,'rarercandy');assert.throws(()=>applyClassicAction(resume,{action:'mysteryConfirm'}));assert.equal(resume.coins,77);assert.deepEqual(resume.adventure,{untouched:'rest'});
}
// Confirming the challenge starts at round zero and cannot be confirmed twice.
{
 const startDoc={coins:0,collection:[],adventure:{marker:1}},st=ensureClassicState(startDoc),p=makeReferenceMon(150,60,{boxId:'starter',moves:['Tackle']});
 const r={id:'start',seed:'start',wave:101,biome:1,rng:42,screen:'mystery',party:[p],balls:{},money:0,modifiers:[],tools:{},encounter:{kind:'mystery',key:'winstrate'},mystery:{type:'winstrate',stage:'choose'},participants:[],awardedFoes:[],pendingMoves:[],rewards:[],rerolls:0};st.slots[0]=r;
 applyClassicAction(startDoc,{action:'mysterySelect',job:'battle'});applyClassicAction(startDoc,{action:'mysteryConfirm'});assert.equal(r.screen,'winstrateNext');assert.equal(r.mystery.round,0);assert.throws(()=>applyClassicAction(startDoc,{action:'mysteryConfirm'}));applyClassicAction(startDoc,{action:'winstrateContinue',round:0});assert.equal(r.screen,'battle');
}
