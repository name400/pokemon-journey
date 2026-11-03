import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {CLASSIC_REWARD_REGISTRY} from '../lib/rogue-classic-rewards.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {chooseClassicProbeAction,probePokemonValue} from '../scripts/classic-probe-policy.mjs';
const mon=(id,boxId,level=10,moves=['Tackle'])=>makeReferenceMon(id,level,{boxId,moves});
function fixture(party,screen='reward'){const doc={coins:0,collection:[],adventure:{unchanged:true}},state=ensureClassicState(doc),r={id:'policy',seed:'policy',wave:21,biome:1,rng:42,screen,party,balls:{},money:4000,modifiers:[],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[],rewards:[],rerolls:0};state.slots[0]=r;return {doc,r};}
// Existing game allows ordinary ready evolutions; the policy must not require a stone.
{const {doc,r}=fixture([mon(1,'bulb',16)]);const action=chooseClassicProbeAction(doc);assert.equal(action.action,'evolve');applyClassicAction(doc,action);assert.equal(r.party[0].rogueSourceId,2);assert.deepEqual(doc.adventure,{unchanged:true});}
// Buy a real, affordable heal for a badly injured strong party member.
{const hero=mon(4,'hero');hero.hp=2;const {doc,r}=fixture([hero]);const before=r.money,action=chooseClassicProbeAction(doc);assert.equal(action.action,'buyService');assert.equal(action.boxId,'hero');applyClassicAction(doc,action);assert.ok(r.party[0].hp>2);assert.ok(r.money<before);}
// Restore a depleted offensive move before choosing the free reward.
{const hero=mon(7,'hero');hero.pp={tackle:0};const {doc,r}=fixture([hero]);const action=chooseClassicProbeAction(doc);assert.equal(action.action,'buyService');assert.equal(action.itemId,'ether');assert.equal(action.moveIndex,0);applyClassicAction(doc,action);assert.equal(r.party[0].pp.tackle,10);}
// Prefer EXP Share over a low-value money reward when no service is needed.
{const {doc,r}=fixture([mon(7,'hero')]);const share=CLASSIC_REWARD_REGISTRY.find(x=>x.id==='expshare'),nugget=CLASSIC_REWARD_REGISTRY.find(x=>x.id==='nugget');r.rewards=[{...nugget,rewardId:'money'},{...share,rewardId:'share'}];const action=chooseClassicProbeAction(doc);assert.equal(action.action,'reward');assert.equal(action.rewardId,'share');}
// A stronger capture can replace an under-levelled full-party member.
{const party=[1,2,3,4,5,6].map(i=>mon(19,'weak-'+i,3)),{doc,r}=fixture(party,'capture');r.pendingCapture=mon(59,'strong',25);const action=chooseClassicProbeAction(doc);assert.equal(action.action,'acceptCapture');assert.ok(party.some(p=>p.boxId===action.replaceBoxId));assert.ok(probePokemonValue(r.pendingCapture,party)>probePokemonValue(party.find(p=>p.boxId===action.replaceBoxId),party));}
// Returned commands for a real double battle target foes and are accepted by the real action handler.
{const party=[mon(151,'one',30,['Seismic Toss']),mon(151,'two',30,['Seismic Toss'])],{doc,r}=fixture(party,'battle'),foes=[mon(143,'foe-one',100,['Splash']),mon(143,'foe-two',100,['Splash'])];r.combat=createClassicCombat(r,foes,{doubles:true});r.initialSwitchSlots=[];const action=chooseClassicProbeAction(doc);assert.equal(action.action,'turn');assert.equal(action.command.actions.length,2);assert.ok(action.command.actions.every(a=>a.type==='move'&&a.target>0));applyClassicAction(doc,action);assert.ok(r.combat.turn>1||r.combat.ended);}
console.log('Exploratory player: evolution, services, PP, rewards, team replacement and legal double turn passed');
// A saved public request can be stale after a move is learned; use the current restored request.
{const hero=mon(151,'stale',30,['Seismic Toss']),{doc,r}=fixture([hero],'battle');r.combat=createClassicCombat(r,[mon(143,'foe',100,['Splash'])]);r.initialSwitchSlots=[];r.combat.requests[0].actors[0].moves[0].id='peck';r.combat.requests[0].moves[0].id='peck';const action=chooseClassicProbeAction(doc);assert.equal(action.command.move,'seismictoss');applyClassicAction(doc,action);assert.ok(r.combat.turn>1||r.combat.ended);}
// A vulnerable lead can be replaced before a wild turn without advancing the battle.
{const party=[mon(19,'lead',2,['Tackle']),mon(151,'strong',80,['Seismic Toss'])],{doc,r}=fixture(party,'battle');r.combat=createClassicCombat(r,[mon(143,'opponent',30,['Tackle'])]);r.initialSwitchSlots=[0];const turn=r.combat.turn,action=chooseClassicProbeAction(doc);assert.equal(action.action,'initialSwitch');assert.equal(action.boxId,'strong');applyClassicAction(doc,action);assert.equal(r.combat.turn,turn);assert.equal(r.combat.teams[0][r.combat.activeBySide[0][0]].boxId,'strong');}
// A multi-segment boss outside its last segment cannot be captured by ordinary balls.
{const hero=mon(151,'hero',50,['Seismic Toss']),enemy=mon(143,'boss',100,['Splash']);enemy.rogueBossSegments=4;enemy.hp=Math.floor(enemy.maxHp*.35);const {doc,r}=fixture([hero],'battle');r.balls={pokeball:5};r.encounter={kind:'wild',boss:true};r.combat=createClassicCombat(r,[enemy]);r.initialSwitchSlots=[];const action=chooseClassicProbeAction(doc);assert.equal(action.action,'turn');}

// A legacy entry-victory save is recovered instead of issuing an impossible turn.
{const {doc,r}=fixture([mon(151,'hero',30,['Seismic Toss'])],'battle'),enemy=mon(19,'fallen',1,['Splash']);enemy.hp=1;r.combat=createClassicCombat(r,[enemy]);r.combat=playClassicCombat(r,{type:'move',move:'seismictoss'});r.party=r.combat.teams[0];assert.equal(r.combat.ended,true);r.waveLog=[...r.combat.log];const action=chooseClassicProbeAction(doc);assert.equal(action.action,'recoverBattle');applyClassicAction(doc,action);assert.equal(r.screen,'reward');}
// An available revive seed is favored over ordinary money for long runs.
{const {doc,r}=fixture([mon(7,'seed-hero')]);const seed=CLASSIC_REWARD_REGISTRY.find(x=>x.id==='reviverseed'),nugget=CLASSIC_REWARD_REGISTRY.find(x=>x.id==='nugget');r.rewards=[{...nugget,rewardId:'money'},{...seed,rewardId:'seed'}];const action=chooseClassicProbeAction(doc);assert.equal(action.action,'reward');assert.equal(action.rewardId,'seed');applyClassicAction(doc,action);assert.equal(r.modifiers.find(m=>m.id==='reviverseed').boxId,'seed-hero');}
