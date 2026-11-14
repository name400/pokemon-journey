import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createMission37TripleSnapshot,mission37TripleView,playMission37TriplePrototype,mission37PlayerTeam} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
const mon=(id,boxId,move,level=50)=>({...makeMon(id,level),boxId,moves:[move],pp:{}});

test('triple Plus targets an enemy, preserves companion ownership and reconnects',()=>{
 const player=mon(152,'player','몸통박치기'),ally1=mon(25,'ally1','튀어오르기'),ally2=mon(25,'ally2','튀어오르기'),foes=[mon(143,'foe1','튀어오르기',80),mon(143,'foe2','튀어오르기',80),mon(143,'foe3','튀어오르기',80)];
 const legacy=createMission37TripleSnapshot([player],[ally1],[ally2],foes),fight={...legacy,adventureMegaPlusDamageV1:true,adventurePlusGaugeV1:{charge:1,max:3}};
 assert.throws(()=>playMission37TriplePrototype(legacy,{type:'move',move:'tackle',target:2,plus:true}));
 assert.throws(()=>playMission37TriplePrototype(fight,{type:'move',move:'tackle',target:8,plus:true}));
 fight.snapshot.prng='1,2,3,4';const view=mission37TripleView(fight);assert.equal(view.adventurePlusGauge.charge,1);assert.equal(view.requests[0].actors[0].moves[0].plusReady,true);
 const normal=playMission37TriplePrototype(fight,{type:'move',move:'tackle',target:2}),plus=playMission37TriplePrototype(fight,{type:'move',move:'tackle',target:2,plus:true});
 assert.ok(plus.teams[1][1].hp<normal.teams[1][1].hp);assert.equal(plus.adventurePlusGaugeV1.charge,0);assert.equal(normal.adventurePlusGaugeV1.charge,2);assert.deepEqual(plus.owners,legacy.owners);assert.deepEqual(mission37PlayerTeam(plus).map(m=>m.boxId),['player']);
 const reloaded=JSON.parse(JSON.stringify(plus));assert.equal(mission37TripleView(reloaded).adventurePlusGauge.charge,0);assert.throws(()=>playMission37TriplePrototype(reloaded,{type:'move',move:'tackle',target:1,plus:true}));assert.equal(playMission37TriplePrototype(reloaded,{type:'move',move:'tackle',target:1}).adventurePlusGaugeV1.charge,1);
});

test('Bulbasaur family uses verified mastery boundaries and preserves old saves',async()=>{
 const {adventureMoveMastered}=await import('../lib/cloud-adventure/adventure-plus-mastery.mjs');
 for(const [id,move,level] of [[1,'vinewhip',6],[2,'magicalleaf',33],[3,'powerwhip',35]]){const mon=makeMon(id,level-1),before=JSON.stringify(mon);assert.equal(adventureMoveMastered(mon,move),false);assert.equal(adventureMoveMastered({...mon,level},move),true);assert.equal(JSON.stringify(mon),before);}
 assert.equal(adventureMoveMastered({...makeMon(25,100)},'thunderbolt'),false);
});

test('player Mega uses the gauge without charging the companions for their own Mega Evolution',async()=>{
 const {mission37CompanionGroups}=await import('../lib/cloud-adventure/adventure-mission37-companions.mjs');
 const player={...mon(6,'mega-player','튀어오르기',100),item:'charizarditex'},groups=mission37CompanionGroups(6),foes=[mon(143,'foe1','튀어오르기',100),mon(143,'foe2','튀어오르기',100),mon(143,'foe3','튀어오르기',100)];
 const battle={...createMission37TripleSnapshot([player],groups[0].team,groups[1].team,foes),adventureMegaPlusDamageV1:true,adventurePlusGaugeV1:{charge:1,max:3}};
 assert.deepEqual(mission37TripleView(battle).requests[0].specials,[]);assert.throws(()=>playMission37TriplePrototype(battle,{type:'move',move:'splash',special:'mega'}));
 const ready={...battle,adventurePlusGaugeV1:{charge:3,max:3}},result=playMission37TriplePrototype(ready,{type:'move',move:'splash',special:'mega'});
 assert.equal(result.adventurePlusGaugeV1.charge,0);assert.deepEqual(result.megaUsed,[true,true,true]);assert.equal(mission37PlayerTeam(result)[0].mega,true);
});


test('Kanto fire and water starters gain only reviewed natural Plus mastery',async()=>{
 const {adventureMoveMastered}=await import('../lib/cloud-adventure/adventure-plus-mastery.mjs');
 for(const [id,move,level] of [[4,'ember',7],[5,'flamethrower',33],[6,'airslash',39],[6,'dragonclaw',10],[7,'watergun',6],[8,'icywind',23],[9,'hydropump',39]]){
  const mon=makeMon(id,level-1),before=JSON.stringify(mon);assert.equal(adventureMoveMastered(mon,move),false);assert.equal(adventureMoveMastered({...mon,level},move),true);assert.equal(JSON.stringify(mon),before);
 }
 assert.equal(adventureMoveMastered(makeMon(4,100),'fireblast'),false);assert.equal(adventureMoveMastered(makeMon(8,100),'hydropump'),false);assert.equal(adventureMoveMastered({...makeMon(4,5),adventurePlusMastered:['fireblast']},'fireblast'),true);
});
