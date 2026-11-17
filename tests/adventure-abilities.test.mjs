import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from '@pkmn/sim';
import {makeMon} from '../lib/game.mjs';
import {createCombat} from '../lib/party-battle.mjs';
import {adventurePlayCpu,adventureCombatView} from '../lib/adventure-tera-policy.mjs';
import {createZAAbilityCombat,adventureNativeTeamSet,zaZygardeFieldHp} from '../lib/cloud-adventure/adventure-abilities.mjs';
import {installAdventureAbilityRules} from '../lib/cloud-adventure/adventure-ability-rules.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn,mission10MultiView} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,restoreMission37TripleSnapshot,playMission37TriplePrototype,mission37TripleView} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
import {adventureBattleBase,adventureBattleBaseFor,restoreAdventurePokemon} from '../lib/cloud-adventure/adventure-battle.mjs';
const mon=(id,boxId,ability,moves=['튀어오르기'])=>({...makeMon(id,50),boxId,ability,moves,pp:{}});
test('ZA Mimikyu caps the first hit without replacing weak damage with recoil',()=>{
 // Water Gun has no burn chance, so residual status damage cannot contaminate
 // the first-hit and legacy recoil comparison.
 const attacker={...makeMon(4,5),boxId:'p',ability:'blaze',moves:['물대포'],pp:{}},foe={...makeMon(778,100),boxId:'f',ability:'disguise',moves:['튀어오르기'],pp:{}},original=structuredClone(foe);
 const start=createZAAbilityCombat([attacker],[foe]);
 const next=adventurePlayCpu(JSON.parse(JSON.stringify(start)),{type:'move',move:'물대포'}),damage=foe.hp-next.teams[1][0].hp;
 assert.ok(damage>0&&damage<Math.floor(foe.maxHp/8),`weak damage ${damage}, max HP ${foe.maxHp}`);
 assert.equal(next.teams[1][0].battleAppearance,'mimikyubusted');assert.equal(next.teams[1][0].ability,'disguise');assert.deepEqual(foe,original);
 const legacy=structuredClone(start);delete legacy.adventureDisguiseV1;
 const old=adventurePlayCpu(legacy,{type:'move',move:'물대포'});assert.equal(foe.hp-old.teams[1][0].hp,Math.floor(foe.maxHp/8));
});
test('ZA Mimikyu limits strong hits once and preserves immunity and classic battles',()=>{
 const attacker={...makeMon(150,100),boxId:'p',ability:'pressure',moves:['섀도볼','몸통박치기'],pp:{}},foe=mon(778,'f','disguise');
 let start=createZAAbilityCombat([attacker],[foe]);
 const immune=adventurePlayCpu(structuredClone(start),{type:'move',move:'몸통박치기'});
 assert.equal(immune.teams[1][0].hp,foe.hp);assert.notEqual(immune.teams[1][0].battleAppearance,'mimikyubusted');
 let next=adventurePlayCpu(start,{type:'move',move:'섀도볼'});
 assert.equal(foe.hp-next.teams[1][0].hp,Math.floor(foe.maxHp/8));assert.equal(next.teams[1][0].battleAppearance,'mimikyubusted');
 next=adventurePlayCpu(JSON.parse(JSON.stringify(next)),{type:'move',move:'섀도볼'});assert.ok(next.teams[1][0].hp<foe.hp-Math.floor(foe.maxHp/8));
 const classic=adventurePlayCpu(createCombat([attacker],[foe]),{type:'move',move:'섀도볼'});assert.equal(foe.hp-classic.teams[1][0].hp,Math.floor(foe.maxHp/8));
});
test('ZA Mimikyu first-hit cap is followed by uncapped hits in a multi-hit move',()=>{
 const player={...makeMon(91,80),boxId:'p',ability:'skilllink',moves:['고드름침'],pp:{}},foe={...makeMon(778,80),boxId:'f',ability:'disguise',moves:['튀어오르기'],pp:{}};
 const battle=createZAAbilityCombat([player],[foe]),next=adventurePlayCpu(JSON.parse(JSON.stringify(battle)),{type:'move',move:'고드름침'}),log=Battle.fromJSON(next.snapshot).log;
 const hp=[];for(const line of log){const match=/^\|-damage\|p2a: [^|]+\|(\d+)\//.exec(line);if(match&&Number(match[1])!==hp.at(-1))hp.push(Number(match[1]));}
 assert.ok(hp.length>=2,JSON.stringify(log));assert.ok(foe.hp-hp[0]>0&&foe.hp-hp[0]<=Math.floor(foe.maxHp/8));assert.ok(hp[1]<hp[0]);assert.equal(next.teams[1][0].battleAppearance,'mimikyubusted');
});
test('ZA Mimikyu weak-hit behavior survives multi and triple snapshots',()=>{
 const player={...makeMon(4,5),boxId:'p',ability:'blaze',moves:['불꽃세례'],pp:{}},ally=mon(25,'ally','static'),foe={...makeMon(778,100),boxId:'f',ability:'disguise',moves:['튀어오르기'],pp:{}},other=mon(143,'other','immunity');
 let multi=createMission10DoubleSnapshot([player],[ally],[foe,other]);multi=playMission10MultiTurn(JSON.parse(JSON.stringify(multi)),{type:'move',move:'ember',target:1});
 const f=multi.teams[1].find(x=>x.boxId==='f'),damage=foe.hp-f.hp;assert.ok(damage>0&&damage<Math.floor(foe.maxHp/8),`multi damage ${damage}`);assert.equal(f.ability,'disguise');
 let triple=createMission37TripleSnapshot([player],[ally],[mon(1,'ally2','overgrow')],[foe,other]);triple=playMission37TriplePrototype(JSON.parse(JSON.stringify(triple)),{type:'move',move:'ember',target:1});
 const t=triple.teams[1].find(x=>x.boxId==='f'),tripleDamage=foe.hp-t.hp;assert.ok(tripleDamage>0&&tripleDamage<Math.floor(foe.maxHp/8),`triple damage ${tripleDamage}`);assert.equal(t.ability,'disguise');
});
test('new ZA singles suppress Levitate without changing original ability or existing combats',()=>{
 const player=mon(150,'p','pressure',['지진']),foe=mon(604,'e','levitate'),before=structuredClone([player,foe]);
 const legacy=createCombat([player],[foe]),battle=createZAAbilityCombat([player],[foe]);
 assert.equal(Battle.fromJSON(battle.snapshot).p2.active[0].ability,'noability');assert.equal(Battle.fromJSON(legacy.snapshot).p2.active[0].ability,'levitate');
 const next=adventurePlayCpu(JSON.parse(JSON.stringify(battle)),{type:'move',move:'지진'});assert.ok(next.teams[1][0].hp<foe.hp);assert.equal(next.teams[1][0].ability,'levitate');assert.deepEqual([player,foe],before);
 const old=adventurePlayCpu(JSON.parse(JSON.stringify(legacy)),{type:'move',move:'지진'});assert.equal(old.teams[1][0].hp,foe.hp);
});
test('ordinary status and entry abilities are suppressed but confirmed form effects remain',()=>{
 const attacker=mon(150,'p','pressure',['몸통박치기']),target=mon(25,'e','static'),s=createZAAbilityCombat([attacker],[target]);
 assert.equal(Battle.fromJSON(s.snapshot).p2.active[0].ability,'noability');
 assert.equal(adventureNativeTeamSet(mon(681,'a','stancechange'),0).ability,'stancechange');
 assert.equal(adventureNativeTeamSet(mon(778,'m','disguise'),0).ability,'disguise');
 assert.equal(adventureNativeTeamSet(mon(877,'h','hungerswitch'),0).ability,'hungerswitch');
 assert.equal(adventureNativeTeamSet(mon(25,'u','unreviewed'),0).ability,'unreviewed');
 const blade=createZAAbilityCombat([mon(681,'blade','stancechange',['야습'])],[mon(25,'target','static')]);assert.equal(adventurePlayCpu(blade,{type:'move',move:'야습'}).teams[0][0].battleAppearance,'aegislashblade');
 const i=createZAAbilityCombat([mon(25,'p','static')],[mon(128,'e','intimidate')]);assert.equal(Battle.fromJSON(i.snapshot).p1.active[0].boosts.atk,0);
});
test('multi and triples suppress reviewed effects and preserve team ownership on reload',()=>{
 const p=mon(150,'p','pressure',['방어']),ally=mon(25,'a','static',['방어']),foe=mon(604,'f','levitate',['방어']),other=mon(128,'g','intimidate',['방어']);
 const double=createMission10DoubleSnapshot([p],[ally],[foe,other]);const native=Battle.fromJSON(double.snapshot);assert.equal(native.p2.active[0].ability,'noability');assert.equal(native.p1.active[0].boosts.atk,0);
 const resumed=playMission10MultiTurn(JSON.parse(JSON.stringify(double)),{type:'move',move:'protect'});assert.equal(resumed.teams[1][0].ability,'levitate');assert.deepEqual(resumed.owners,{player:['p'],ally:['a']});
 const triple=createMission37TripleSnapshot([p],[ally],[mon(1,'b','overgrow')],[foe,other]);const native3=restoreMission37TripleSnapshot(JSON.parse(JSON.stringify(triple)));assert.equal(native3.p2.active[0].ability,'noability');assert.equal(triple.teams[1][0].ability,'levitate');
});
test('Mega acquired ordinary ability stays suppressed across battle restore',()=>{
 const player={...mon(282,'p','synchronize',['몸통박치기']),item:'gardevoirite'},foe=mon(94,'f','cursedbody');
 const start=createZAAbilityCombat([player],[foe]);const evolved=adventurePlayCpu(start,{type:'move',move:'몸통박치기',special:'mega'});
 assert.equal(evolved.teams[0][0].mega,true);assert.equal(evolved.teams[0][0].currentAbility,'pixilate');assert.equal(evolved.teams[1][0].hp,foe.hp);assert.equal(evolved.teams[0][0].ability,'synchronize');
 const restored=JSON.parse(JSON.stringify(evolved)),next=adventurePlayCpu(restored,{type:'move',move:'몸통박치기'});assert.equal(next.teams[1][0].hp,foe.hp);assert.equal(next.teams[0][0].ability,'synchronize');
});
test('unreviewed restricted abilities and unknown values are preserved',()=>{
 for(const [id,ability] of [[718,'powerconstruct'],[25,'unreviewed'],[681,'stancechange'],[778,'disguise'],[877,'hungerswitch']])assert.equal(adventureNativeTeamSet(mon(id,'x',ability),0).ability,ability);
 assert.equal(adventureNativeTeamSet(mon(25,'x','immunity'),0).ability,'noability');
});
test('ordinary status immunity is disabled in new ZA battles but preserved in the shared engine',()=>{
 const player=mon(94,'p','cursedbody',['맹독']),foe=mon(143,'f','immunity');
 const za=adventurePlayCpu(createZAAbilityCombat([player],[foe]),{type:'move',move:'맹독'});
 const shared=adventurePlayCpu(createCombat([player],[foe]),{type:'move',move:'맹독'});
 assert.equal(za.teams[1][0].status,'맹독');assert.equal(za.teams[1][0].ability,'immunity');assert.equal(shared.teams[1][0].status,null);
});
test('ZA Zygarde retains its stored ability while its known forms transform in new battles',()=>{
 for(const id of [718,10181]){
  const player=mon(id,'p','aurabreak'),foe=mon(129,'f','swiftswim');player.hp=Math.floor(player.maxHp*.4);
  const source=structuredClone(player),battle=createZAAbilityCombat([player],[foe]);battle.adventureBattleBase=adventureBattleBase([[player],[foe]]);
  const next=adventurePlayCpu(JSON.parse(JSON.stringify(battle)),{type:'move',move:'튀어오르기'}),active=next.teams[0][0];
  assert.equal(active.battleAppearance,'zygardecomplete');assert.equal(active.ability,'aurabreak');assert.equal(active.hp,player.hp+active.maxHp-player.maxHp);
  const restored=restoreAdventurePokemon(active,adventureBattleBaseFor(next,0,active));assert.equal(restored.id,id);assert.equal(restored.ability,'aurabreak');assert.ok(restored.hp<=restored.maxHp);assert.deepEqual(player,source);
  assert.equal(zaZygardeFieldHp(active,restored),Math.min(active.hp,restored.maxHp));assert.equal(zaZygardeFieldHp({...active,battleAppearance:'other'},restored),null);
  const old=adventurePlayCpu(createCombat([player],[foe]),{type:'move',move:'튀어오르기'});assert.notEqual(old.teams[0][0].battleAppearance,'zygardecomplete');
 }
 assert.equal(adventureNativeTeamSet(mon(718,'unknown','unreviewed'),0).ability,'unreviewed');
 const player=mon(718,'p','aurabreak'),ally=mon(25,'a','static'),foe=mon(129,'f','swiftswim'),other=mon(128,'g','intimidate');
 const multi=createMission10DoubleSnapshot([player],[ally],[foe,other]);assert.equal(Battle.fromJSON(multi.snapshot).p1.active[0].ability,'powerconstruct');assert.equal(multi.teams[0][0].ability,'aurabreak');
 const triple=createMission37TripleSnapshot([player],[ally],[mon(1,'b','overgrow')],[foe,other]);assert.equal(restoreMission37TripleSnapshot(triple).p1.active[0].ability,'powerconstruct');assert.equal(triple.teams[0][0].ability,'aurabreak');
});
test('ZA Morpeko changes mode on Aura Wheel rather than each turn, and survives reload',()=>{
 const player=mon(877,'p','hungerswitch',['방어','오라휠']),foe=mon(143,'f','immunity');foe.level=100;
 let battle=createZAAbilityCombat([player],[foe]);battle=adventurePlayCpu(battle,{type:'move',move:'방어'});assert.equal(battle.teams[0][0].battleAppearance,'morpeko');
 battle=adventurePlayCpu(JSON.parse(JSON.stringify(battle)),{type:'move',move:'오라휠'});assert.equal(battle.teams[0][0].battleAppearance,'morpekohangry');assert.equal(battle.teams[0][0].ability,'hungerswitch');assert.equal(adventureCombatView(battle).requests[0].moves.find(m=>m.id==='aurawheel').typeKey,'dark');
 battle=adventurePlayCpu(JSON.parse(JSON.stringify(battle)),{type:'move',move:'방어'});assert.equal(battle.teams[0][0].battleAppearance,'morpekohangry');
 battle=adventurePlayCpu(JSON.parse(JSON.stringify(battle)),{type:'move',move:'오라휠'});assert.equal(battle.teams[0][0].battleAppearance,'morpeko');assert.equal(battle.events.find(e=>e.kind==='move'&&e.moveId==='aurawheel').type,'dark');
 const legacy=createZAAbilityCombat([player],[foe]);delete legacy.adventureMorpekoV1;assert.equal(adventurePlayCpu(legacy,{type:'move',move:'방어'}).teams[0][0].battleAppearance,'morpekohangry');
});
test('ZA Morpeko mode changes on Aura Wheel in companion and triple battles',()=>{
 const player=mon(877,'p','hungerswitch',['방어','오라휠']),ally=mon(129,'a','swiftswim'),foe=mon(143,'f','immunity'),other=mon(143,'g','immunity');
 let multi=createMission10DoubleSnapshot([player],[ally],[foe,other]);multi=playMission10MultiTurn(multi,{type:'move',move:'protect'});assert.equal(multi.teams[0][0].battleAppearance,'morpeko');
 multi=playMission10MultiTurn(JSON.parse(JSON.stringify(multi)),{type:'move',move:'aurawheel',target:1});assert.equal(multi.teams[0][0].battleAppearance,'morpekohangry');assert.equal(mission10MultiView(multi).requests[0].actors[0].moves.find(m=>m.id==='aurawheel').typeKey,'dark');
 multi=playMission10MultiTurn(JSON.parse(JSON.stringify(multi)),{type:'move',move:'aurawheel',target:1});assert.equal(multi.events.find(e=>e.kind==='move'&&e.moveId==='aurawheel'&&e.actorBoxId==='p').type,'dark');
 const triple=createMission37TripleSnapshot([player],[ally],[mon(129,'b','swiftswim')],[foe,other]);
 let result=playMission37TriplePrototype(JSON.parse(JSON.stringify(triple)),{type:'move',move:'aurawheel',target:1});assert.equal(result.teams[0][0].battleAppearance,'morpekohangry');assert.equal(mission37TripleView(result).requests[0].actors[0].moves.find(m=>m.id==='aurawheel').typeKey,'dark');
 result=playMission37TriplePrototype(JSON.parse(JSON.stringify(result)),{type:'move',move:'aurawheel',target:1});assert.equal(result.events.find(e=>e.kind==='move'&&e.moveId==='aurawheel'&&e.actorBoxId==='p').type,'dark');
});

test('ZA Meditite and Medicham use species Attack bases in new snapshots, not a doubled ability',()=>{
 for(const [id,base] of [[307,56],[308,84]]){
  const own={...mon(id,'p','purepower',['몸통박치기']),nature:'adamant',evs:{hp:0,atk:172,def:0,spa:0,spd:0,spe:0}},foe=mon(143,'f','immunity'),source=structuredClone(own),battle=createZAAbilityCombat([own],[foe]),native=Battle.fromJSON(battle.snapshot),p=native.p1.active[0];
  assert.equal(p.ability,'noability');assert.equal(p.storedStats.atk,native.statModify({...p.species.baseStats,atk:base},p.set,'atk'));assert.equal(battle.adventureZAFormAttackV1,true);
  const next=adventurePlayCpu(JSON.parse(JSON.stringify(battle)),{type:'move',move:'몸통박치기'}),resumed=Battle.fromJSON(next.snapshot);assert.equal(resumed.p1.active[0].storedStats.atk,p.storedStats.atk);assert.equal(next.teams[0][0].ability,'purepower');assert.deepEqual(own,source);
  const legacy=createCombat([own],[foe]);const old=Battle.fromJSON(legacy.snapshot);assert.equal(old.p1.active[0].storedStats.atk,old.statModify(old.p1.active[0].species.baseStats,old.p1.active[0].set,'atk'));assert.equal(old.p1.active[0].ability,'purepower');
 }
});
test('ZA Medicham Mega updates only a versioned battle and keeps stats after restore',()=>{
 const own={...mon(308,'p','purepower',['몸통박치기']),item:'medichamite'},foe=mon(143,'f','immunity');foe.level=100;
 const battle=createZAAbilityCombat([own],[foe]),next=adventurePlayCpu(JSON.parse(JSON.stringify(battle)),{type:'move',move:'몸통박치기',special:'mega'}),native=Battle.fromJSON(next.snapshot),p=native.p1.active[0];
 assert.equal(p.species.id,'medichammega');assert.equal(p.storedStats.atk,native.statModify({...p.species.baseStats,atk:140},p.set,'atk'));assert.equal(next.teams[0][0].ability,'purepower');
 const resumed=adventurePlayCpu(JSON.parse(JSON.stringify(next)),{type:'move',move:'몸통박치기'});assert.equal(Battle.fromJSON(resumed.snapshot).p1.active[0].storedStats.atk,p.storedStats.atk);
 const legacy=createZAAbilityCombat([own],[foe]);delete legacy.adventureZAFormAttackV1;const old=adventurePlayCpu(legacy,{type:'move',move:'몸통박치기',special:'mega'}),oldNative=Battle.fromJSON(old.snapshot),oldP=oldNative.p1.active[0];assert.equal(oldP.storedStats.atk,oldNative.statModify(oldP.species.baseStats,oldP.set,'atk'));
});
test('ZA Attack bases follow player and opposing Medicham in companion and triple saves',()=>{
 const p=mon(308,'p','purepower',['방어']),ally=mon(307,'ally','purepower'),foe=mon(308,'f','purepower'),other=mon(143,'other','immunity'),expected=(b,x,base)=>b.statModify({...x.species.baseStats,atk:base},x.set,'atk');
 const multi=createMission10DoubleSnapshot([p],[ally],[foe,other]),native=Battle.fromJSON(multi.snapshot);for(const [side,base] of [[0,84],[1,84],[2,56]])assert.equal(native.sides[side].active[0].storedStats.atk,expected(native,native.sides[side].active[0],base));
 const m=playMission10MultiTurn(JSON.parse(JSON.stringify(multi)),{type:'move',move:'protect'}),restored=Battle.fromJSON(m.snapshot);assert.equal(restored.p1.active[0].storedStats.atk,expected(restored,restored.p1.active[0],84));assert.equal(m.teams[0][0].ability,'purepower');
 const triple=createMission37TripleSnapshot([p],[ally],[mon(1,'third','overgrow')],[foe,other]),n=restoreMission37TripleSnapshot(JSON.parse(JSON.stringify(triple)));assert.equal(n.p1.active[0].storedStats.atk,expected(n,n.p1.active[0],84));assert.equal(n.p2.active[0].storedStats.atk,expected(n,n.p2.active[0],84));
 const t=playMission37TriplePrototype(JSON.parse(JSON.stringify(triple)),{type:'move',move:'protect'}),rt=restoreMission37TripleSnapshot(t);assert.equal(rt.p1.active[0].storedStats.atk,expected(rt,rt.p1.active[0],84));
});
test('ZA versioned attack does not reset changed battle stats during reconnect or affect legacy snapshots',()=>{
 const player=mon(308,'p','purepower',['방어']),foe=mon(143,'f','immunity'),battle=createZAAbilityCombat([player],[foe]),native=Battle.fromJSON(battle.snapshot),p=native.p1.active[0];p.storedStats.atk=37;battle.snapshot=native.toJSON();
 const next=adventurePlayCpu(JSON.parse(JSON.stringify(battle)),{type:'move',move:'방어'});assert.equal(Battle.fromJSON(next.snapshot).p1.active[0].storedStats.atk,37);
 const legacy=createCombat([player],[foe]);legacy.adventureNoAbilitiesV2=true;const before=Battle.fromJSON(legacy.snapshot).p1.active[0].storedStats.atk,after=adventurePlayCpu(JSON.parse(JSON.stringify(legacy)),{type:'move',move:'방어'});assert.equal(Battle.fromJSON(after.snapshot).p1.active[0].storedStats.atk,before);assert.equal(after.adventureZAFormAttackV1,undefined);
});
test('ZA Mega Mawile and Mega Starmie use their native ZA Attack bases without Huge Power',()=>{
 for(const [species,item,form,base] of [[303,'mawilite','mawilemega',147],[121,'starminite','starmiemega',140]]){
  const own={...mon(species,'p','intimidate',['몸통박치기']),item},foe=mon(143,'f','immunity');foe.level=100;
  const start=createZAAbilityCombat([own],[foe]),next=adventurePlayCpu(JSON.parse(JSON.stringify(start)),{type:'move',move:'몸통박치기',special:'mega'}),battle=Battle.fromJSON(next.snapshot),p=battle.p1.active[0];
  assert.equal(p.species.id,form);assert.equal(p.storedStats.atk,battle.statModify({...p.species.baseStats,atk:base},p.set,'atk'));assert.equal(next.teams[0][0].ability,'intimidate');assert.equal(installAdventureAbilityRules(battle,true,false,false,true).p1.active[0].ignoringAbility(),true);
  const resumed=adventurePlayCpu(JSON.parse(JSON.stringify(next)),{type:'move',move:'몸통박치기'});assert.equal(Battle.fromJSON(resumed.snapshot).p1.active[0].storedStats.atk,p.storedStats.atk);
 }
});
