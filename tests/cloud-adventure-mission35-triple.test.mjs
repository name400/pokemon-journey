import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createMission35TripleSnapshot,mission35TripleView,playMission35TripleTurn} from '../lib/cloud-adventure/adventure-mission35-triple.mjs';
const mon=(id,boxId,moves=['튀어오르기'])=>({...makeMon(id,50),boxId,moves,pp:{}});
test('one player and three opponents survive a turn and reload without visible placeholders',()=>{
 const team=[mon(25,'player'),mon(4,'reserve')],foes=[mon(681,'boss'),mon(679,'sword1'),mon(679,'sword2')],start=createMission35TripleSnapshot(team,foes),view=mission35TripleView(start);
 assert.deepEqual(view.teams[0].map(m=>m.boxId),['player','reserve']);assert.deepEqual(view.activeBySide,[[0,-1,-1],[0,1,2]]);
 const next=playMission35TripleTurn(start,{type:'move',move:'splash'}),resumed=mission35TripleView(JSON.parse(JSON.stringify(next)));assert.equal(resumed.turn,2);assert.deepEqual(resumed.activeBySide,[[0,-1,-1],[0,1,2]]);assert.deepEqual(resumed.teams[0].map(m=>m.boxId),['player','reserve']);assert.ok(resumed.events.filter(e=>e.kind==='move'&&String(e.actorBoxId).startsWith('sword')).length>=1);
});

test('target selection, spread damage, and forced player replacement retain all three foes',async()=>{
 const team=[mon(150,'player',['땅고르기','파동탄']),mon(25,'reserve')],foes=[mon(143,'boss'),mon(143,'sword1'),mon(143,'sword2')],start=createMission35TripleSnapshot(team,foes),view=mission35TripleView(start),move=view.requests[0].actors[0].moves.find(m=>m.id==='aurasphere');assert.deepEqual(move.targets.filter(t=>t.side===1).map(t=>t.slot),[0,1,2]);
 const spread=playMission35TripleTurn(start,{type:'move',move:'bulldoze'}),after=mission35TripleView(spread);assert.equal(after.teams[1].filter(m=>m.hp<m.maxHp).length,2);assert.equal(after.events.filter(e=>e.kind==='damage'&&e.targetSide===1).length,2);
 const {restoreMission37TripleSnapshot}=await import('../lib/cloud-adventure/adventure-mission37-triple.mjs'),battle=restoreMission37TripleSnapshot(start),lead=battle.p1.active[0];lead.hp=0;lead.fainted=true;lead.status='fnt';lead.switchFlag=true;battle.p1.pokemonLeft--;battle.makeRequest('switch');const snapshot=battle.toJSON();snapshot.formatid=start.snapshot.formatid;const forced={...start,snapshot},v=mission35TripleView(forced);assert.equal(v.requests[0].actors[0].kind,'switch');assert.equal(v.requests[0].actors[0].switches.length,1);const next=playMission35TripleTurn(forced,{type:'switch',slot:v.requests[0].actors[0].switches[0].slot});assert.equal(mission35TripleView(next).teams[0][mission35TripleView(next).active[0]].boxId,'reserve');
});

test('all three enemies must fall before victory',()=>{
 const boss=mon(150,'player',['파동탄']),foes=[mon(143,'boss'),mon(143,'sword1'),mon(143,'sword2')];boss.level=100;let c=createMission35TripleSnapshot([boss],foes);
 for(let n=0;n<3;n++){const v=mission35TripleView(c),m=v.requests[0].actors[0].moves.find(x=>x.id==='aurasphere'),target=m.targets.find(t=>t.side===1);assert.ok(target);c=playMission35TripleTurn(c,{type:'move',move:'aurasphere',target:target.target});if(n<2)assert.equal(c.ended,false);}
 assert.equal(c.ended,true);assert.equal(c.winner,0);assert.deepEqual(mission35TripleView(c).teams[0].map(x=>x.boxId),['player']);
});

test('natural knockout forces one real reserve and leaves empty slots unused',()=>{
 const lead={...mon(25,'weak'),hp:1},reserve=mon(4,'reserve'),foes=['a','b','c'].map(id=>mon(150,id,['몸통박치기']));let c=createMission35TripleSnapshot([lead,reserve],foes);c=playMission35TripleTurn(c,{type:'move',move:'splash'});const request=mission35TripleView(c).requests[0].actors[0];assert.equal(request.kind,'switch');assert.deepEqual(request.switches.map(x=>x.index),[1]);c=playMission35TripleTurn(c,{type:'switch',slot:request.switches[0].slot});const v=mission35TripleView(c);assert.equal(v.teams[0][v.active[0]].boxId,'reserve');assert.deepEqual(v.activeBySide[0].slice(1),[-1,-1]);
});

test('Plus selection targets one of three foes and survives reconnect without exposing empty allies',()=>{
 const player={...mon(152,'plus-player',['전광석화']),adventurePlusMastered:['quickattack']},foes=[mon(143,'boss'),mon(143,'sword1'),mon(143,'sword2')],legacy=createMission35TripleSnapshot([player],foes),fight={...legacy,adventurePlusGaugeV1:{charge:1,max:3}};fight.snapshot.prng='1,2,3,4';
 assert.throws(()=>playMission35TripleTurn(legacy,{type:'move',move:'quickattack',target:2,plus:true}));const view=mission35TripleView(fight);assert.equal(view.requests[0].actors[0].moves[0].plusReady,true);assert.deepEqual(view.activeBySide[0],[0,-1,-1]);assert.equal(view.adventurePlusGauge.charge,1);
 const regular=playMission35TripleTurn(fight,{type:'move',move:'quickattack',target:2}),plus=playMission35TripleTurn(fight,{type:'move',move:'quickattack',target:2,plus:true});assert.ok(plus.teams[1][1].hp<regular.teams[1][1].hp);assert.equal(plus.adventurePlusGaugeV1.charge,0);const restored=mission35TripleView(JSON.parse(JSON.stringify(plus)));assert.equal(restored.adventurePlusGauge.charge,0);assert.deepEqual(restored.teams[0].map(m=>m.boxId),['plus-player']);assert.throws(()=>playMission35TripleTurn(plus,{type:'move',move:'quickattack',target:2,plus:true}));
});

test('new mission 35 Mega attacks use Plus damage while old saves stay unchanged',()=>{
 const player={...mon(6,'mega-player',['화염방사']),level:30,item:'charizarditex'},foes=[mon(143,'boss'),mon(143,'sword1'),mon(143,'sword2')],old=createMission35TripleSnapshot([player],foes);old.snapshot.prng='1,2,3,4';const fresh={...structuredClone(old),adventurePlusGaugeV1:{charge:3,max:3}},action={type:'move',move:'flamethrower',target:2,special:'mega'};
 const normal=playMission35TripleTurn(old,action),boosted=playMission35TripleTurn(fresh,action);assert.equal(boosted.adventurePlusGaugeV1.charge,0);assert.ok(boosted.teams[1][1].hp<normal.teams[1][1].hp);assert.equal(normal.adventurePlusGaugeV1,undefined);
});
