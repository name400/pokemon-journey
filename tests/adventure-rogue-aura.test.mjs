import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu,combatView} from '../lib/party-battle.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn,mission10MultiView} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,playMission37TriplePrototype,mission37TripleView} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
const mon=(id,boxId,moves,level=50)=>({...makeMon(id,level),boxId,moves,pp:{}});
const targets=['boss'],flags=c=>({...c,adventurePlusGaugeV1:{charge:1,max:3},adventureRogueAuraV1:{targets},disableCpuTera:true});

test('Rogue aura reduces ordinary damage to 30%, preserving Plus and legacy combat',()=>{
 const p={...mon(25,'player',['전기쇼크']),adventurePlusMastered:['thundershock']},f=mon(10071,'boss',['튀어오르기'],60),base={...createCombat([p],[f]),adventurePlusGaugeV1:{charge:1,max:3},disableCpuTera:true};base.snapshot.prng='1,2,3,4';const aura={...base,adventureRogueAuraV1:{targets}};
 const normal=playCpu(base,{type:'move',move:'전기쇼크'}),reduced=playCpu(aura,{type:'move',move:'전기쇼크'}),plus=playCpu(aura,{type:'move',move:'전기쇼크',plus:true}),plusWithout=playCpu(base,{type:'move',move:'전기쇼크',plus:true}),damage=c=>f.hp-c.teams[1][0].hp;
 assert.ok(Math.abs(damage(reduced)/damage(normal)-.3)<.07);assert.equal(damage(plus),damage(plusWithout));assert.equal(plus.adventurePlusGaugeV1.charge,0);assert.equal(combatView(aura).adventureRogueAuraV1,true);assert.equal(combatView(base).adventureRogueAuraV1,undefined);
 const restored=JSON.parse(JSON.stringify(reduced));assert.deepEqual(restored.adventureRogueAuraV1,{targets});assert.equal(combatView(restored).adventureRogueAuraV1,true);assert.equal(playCpu(restored,{type:'move',move:'전기쇼크'}).adventurePlusGaugeV1.charge,3);
});

test('only explicitly tagged targets take reduced damage in multi and triple',()=>{
 const p={...mon(25,'player',['전기쇼크']),adventurePlusMastered:['thundershock']},ally=mon(25,'ally',['튀어오르기']),ally2=mon(25,'ally2',['튀어오르기']),foes=[mon(10071,'boss',['튀어오르기'],70),mon(143,'ordinary',['튀어오르기'],70),mon(143,'third',['튀어오르기'],70)];
 for(const [raw,view,play,bossSide,bossIndex] of [[createMission10DoubleSnapshot([p],[ally],foes.slice(0,2)),mission10MultiView,playMission10MultiTurn,1,0],[createMission37TripleSnapshot([p],[ally],[ally2],foes),mission37TripleView,playMission37TriplePrototype,1,0]]){
  raw.snapshot.prng='1,2,3,4';const base={...raw,adventurePlusGaugeV1:{charge:1,max:3}},aura=flags(raw),cmd={type:'move',move:'thundershock',target:1},ordinary=play(base,cmd),reduced=play(aura,cmd),plus=play(aura,{...cmd,plus:true}),normalDamage=foes[0].hp-ordinary.teams[bossSide][bossIndex].hp,reducedDamage=foes[0].hp-reduced.teams[bossSide][bossIndex].hp;
  assert.ok(normalDamage>0&&Math.abs(reducedDamage/normalDamage-.3)<.1);assert.ok(foes[0].hp-plus.teams[bossSide][bossIndex].hp>normalDamage);assert.equal(view(reduced).adventureRogueAuraV1,true);assert.deepEqual(reduced.owners,raw.owners);assert.equal(reduced.adventurePlusGaugeV1.charge,2);const other={type:'move',move:'thundershock',target:2},untagged=play(aura,other),unmodified=play(base,other),side=raw.format==='mission10-multi-v1'?3:1,index=side===3?0:1;assert.equal(untagged.teams[side][index].hp,unmodified.teams[side][index].hp);
 }
});

test('ordinary Mega Evolution is not a Rogue aura and player Mega bypasses the aura',()=>{
 const player={...mon(6,'player',['화염방사']),item:'charizarditex'},foe=mon(10071,'boss',['튀어오르기'],70),base={...createCombat([player],[foe]),adventurePlusGaugeV1:{charge:3,max:3},disableCpuTera:true};base.snapshot.prng='1,2,3,4';const aura={...base,adventureRogueAuraV1:{targets}},cmd={type:'move',move:'화염방사',special:'mega'},without=playCpu(base,cmd),withAura=playCpu(aura,cmd);assert.equal(withAura.teams[1][0].hp,without.teams[1][0].hp);assert.equal(withAura.teams[0][0].mega,true);
});

test('companion attacks follow the aura but remain owned and an untagged opposing Mega is unaffected',()=>{
 const player=mon(25,'player',['튀어오르기']),ally=mon(25,'ally',['전기쇼크']),foes=[mon(10071,'boss',['튀어오르기'],70),mon(10038,'ordinary-mega',['튀어오르기'],70)];const base=createMission10DoubleSnapshot([player],[ally],foes);base.snapshot.prng='1,2,3,4';const regular=playMission10MultiTurn(base,{type:'move',move:'splash'}),reduced=playMission10MultiTurn(flags(base),{type:'move',move:'splash'}),a=foes[0].hp-regular.teams[1][0].hp,b=foes[0].hp-reduced.teams[1][0].hp;assert.ok(a>0&&Math.abs(b/a-.3)<.1);assert.deepEqual(reduced.owners,base.owners);assert.equal(reduced.teams[3][0].hp,foes[1].hp);
});

test('a trained starter and story companion can clear a representative Rogue Slowbro',async()=>{
 const {mission10RivalTeam}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createCompanionBossSnapshot}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const player=mon(152,'player',['잎날가르기'],45),boss=mon(10071,'boss',['물의파동','환상빔'],34),ally=mission10RivalTeam('grass').map((m,i)=>({...m,boxId:`ally-${i}`,item:''}));let battle=flags(createCompanionBossSnapshot([player],ally,boss));battle.snapshot.prng='1,2,3,4';
 for(let turn=0;turn<20&&!battle.ended;turn++){const view=mission10MultiView(battle);assert.equal(view.requests[0].actors[0].kind,'move');battle=playMission10MultiTurn(battle,{type:'move',move:'razorleaf',...(view.adventurePlusGauge.charge?{plus:true}:{})});}
 assert.equal(battle.winner,0);assert.equal(battle.teams[1][0].hp,0);assert.deepEqual(battle.owners.player,['player']);
});
