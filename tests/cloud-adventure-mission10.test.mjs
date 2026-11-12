import test from 'node:test';
import assert from 'node:assert/strict';
import {mission10RivalTeam} from '../lib/cloud-adventure/adventure-mission10.mjs';
import {makeMon,moves} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';

test('mission 10 rival teams follow the selected starter type',()=>{
 for(const [choice,ids] of Object.entries({grass:[159,499,310],fire:[153,159,310],water:[499,153,310]})){
  const team=mission10RivalTeam(choice);assert.deepEqual(team.map(m=>m.speciesId),ids);assert.deepEqual(team.map(m=>m.level),[25,25,26]);assert.equal(team[2].item,'manectite');assert.ok(team.every(m=>m.moves.length===4&&m.moves.every(move=>Object.hasOwn(moves,move))));
 }
 assert.throws(()=>mission10RivalTeam('__proto__'));assert.throws(()=>mission10RivalTeam(''));
});

test('rival Manectric can mega evolve in the turn-based engine',()=>{
 const player={...makeMon(150,100),boxId:'player',moves:['방어'],pp:{}};
 const battle=playCpu(createCombat([player],[mission10RivalTeam('grass')[2]]),{type:'move',move:'방어'});
 assert.equal(battle.teams[1][0].battleAppearance,'manectricmega');
});

test('mission 10 partner and guards have separate, valid temporary teams',async()=>{
 const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');
 for(const [choice,ids] of Object.entries({grass:[159,499,310],fire:[153,159,310],water:[499,153,310]})){
  const {ally,foes}=mission10GuardTeams(choice);
  assert.deepEqual(ally.map(m=>m.speciesId),ids);assert.deepEqual(ally.map(m=>m.level),[29,29,30]);
  assert.deepEqual(foes.map(m=>m.speciesId),[702,702]);assert.deepEqual(foes.map(m=>m.level),[30,30]);
  assert.equal(new Set([...ally,...foes].map(m=>m.boxId)).size,5);
  assert.ok([...ally,...foes].every(m=>m.moves.length===4&&m.moves.every(move=>Object.hasOwn(moves,move))));
 }
 assert.throws(()=>mission10GuardTeams('__proto__'));assert.throws(()=>mission10GuardTeams(''));
});

test('isolated mission 10 double snapshot preserves both sides, ownership and existing HP',async()=>{
 const {Battle}=await import('@pkmn/sim');const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const player=Array.from({length:6},(_,i)=>({...makeMon(25,30),boxId:`owned-${i}`}));player[0].hp=Math.floor(player[0].maxHp/2);player[1].hp=0;
 const before=structuredClone(player),{ally,foes}=mission10GuardTeams('grass'),fight=createMission10DoubleSnapshot(player,ally,foes);
 assert.deepEqual(player,before);assert.equal(fight.format,'mission10-multi-v1');assert.equal(fight.teams[0].length,6);assert.equal(fight.teams[2].length,3);assert.deepEqual(fight.owners.player,player.map(m=>m.boxId));assert.deepEqual(fight.owners.ally,ally.map(m=>m.boxId));
 const restored=Battle.fromJSON(JSON.parse(JSON.stringify(fight.snapshot)));assert.equal(restored.gameType,'multi');assert.deepEqual(restored.sides.map(side=>side.active[0]?.set.trainerToken),['owned-0','mission10-guard-0','mission10-ally-0','mission10-guard-1']);assert.ok(restored.format.customRules.includes('!Sleep Clause Mod'));assert.ok(restored.p1.active[0].hp<restored.p1.active[0].maxhp);assert.equal(restored.p1.pokemon.find(p=>p.set.trainerToken==='owned-1').hp,0);
 assert.throws(()=>createMission10DoubleSnapshot([],ally,foes));assert.throws(()=>createMission10DoubleSnapshot([player[0]],ally,[foes[0],foes[0]]));
});

test('isolated multi turn targets the selected guard and keeps the partner roster separate',async()=>{
 const {Battle}=await import('@pkmn/sim');const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const p={...makeMon(150,100),boxId:'owned',moves:['사이코키네시스'],pp:{}},backup={...makeMon(25,30),boxId:'owned-backup'},t=mission10GuardTeams('grass'),start=createMission10DoubleSnapshot([p,backup],t.ally,t.foes);
 assert.throws(()=>playMission10MultiTurn(start,{type:'move',move:'psychic',target:3}));assert.throws(()=>playMission10MultiTurn(start,{type:'switch',slot:3}));
 const next=playMission10MultiTurn(start,{type:'move',move:'psychic',target:2}),b=Battle.fromJSON(JSON.parse(JSON.stringify(next.snapshot)));assert.equal(next.teams[0][0].moveUsage.psychic,1);assert.ok(b.turn>1||b.ended);assert.equal(b.p4.pokemon[0].hp,0);assert.deepEqual(b.p1.pokemon.map(x=>x.set.trainerToken),['owned','owned-backup']);assert.deepEqual(b.p3.pokemon.map(x=>x.set.trainerToken),t.ally.map(x=>x.boxId));
});


test('isolated multi battle supports a player switch and resumes to victory',async()=>{
 const {Battle}=await import('@pkmn/sim');const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const lead={...makeMon(150,100),boxId:'own-lead',moves:['사이코키네시스'],pp:{}},reserve={...makeMon(150,100),boxId:'own-reserve',moves:['사이코키네시스'],pp:{}},t=mission10GuardTeams('fire');let fight=createMission10DoubleSnapshot([lead,reserve],t.ally,t.foes);
 fight=playMission10MultiTurn(fight,{type:'switch',slot:2});let b=Battle.fromJSON(fight.snapshot);assert.equal(b.p1.active[0].set.trainerToken,'own-reserve');assert.deepEqual(fight.owners.ally,t.ally.map(p=>p.boxId));
 for(let i=0;i<8&&!b.ended;i++){const target=b.p2.active[0]?.hp>0?1:2;fight=playMission10MultiTurn(fight,{type:'move',move:'psychic',target});b=Battle.fromJSON(fight.snapshot);}
 assert.equal(b.ended,true);assert.equal(b.p2.pokemon[0].hp,0);assert.equal(b.p4.pokemon[0].hp,0);assert.ok(fight.teams[0].every(p=>p.boxId.startsWith('own-')));assert.ok(fight.teams[2].every(p=>p.boxId.startsWith('mission10-ally-')));
});

test('isolated multi battle requires a player-owned replacement after fainting',async()=>{
 const {Battle}=await import('@pkmn/sim');const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const lead={...makeMon(25,30),boxId:'lead',hp:1,moves:['튀어오르기'],pp:{}},reserve={...makeMon(25,30),boxId:'reserve'},t=mission10GuardTeams('grass');let fight=createMission10DoubleSnapshot([lead,reserve],t.ally,t.foes);
 fight=playMission10MultiTurn(fight,{type:'move',move:'splash'});let b=Battle.fromJSON(fight.snapshot);assert.equal(b.p1.active[0].hp,0);assert.equal(b.p1.activeRequest.forceSwitch[0],true);assert.equal(fight.teams[0].find(p=>p.boxId==='lead').hp,0);
 assert.throws(()=>playMission10MultiTurn(fight,{type:'switch',slot:3}));fight=playMission10MultiTurn(fight,{type:'switch',slot:2});b=Battle.fromJSON(fight.snapshot);assert.equal(b.p1.active[0].set.trainerToken,'reserve');assert.ok(b.p3.pokemon.every(p=>p.set.trainerToken.startsWith('mission10-ally-')));
});

test('multi battle view exposes both guard targets and only player-controlled switches',async()=>{
 const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot,mission10MultiView}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const player=[{...makeMon(150,100),boxId:'lead',moves:['사이코키네시스'],pp:{}},{...makeMon(25,30),boxId:'reserve'}],t=mission10GuardTeams('water'),view=mission10MultiView(createMission10DoubleSnapshot(player,t.ally,t.foes));
 assert.deepEqual(view.activeBySide,[[0,2],[0,1]]);assert.equal(view.requests[0].actors.length,1);assert.deepEqual(view.requests[0].actors[0].switches.map(s=>s.slot),[2]);assert.deepEqual(view.requests[0].actors[0].moves[0].targets.map(t=>t.target),[1,-2,2]);
});

test('multi battle supports Mega Evolution and rejects unavailable special forms',async()=>{
 const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot,mission10MultiView,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const player={...makeMon(359,50),boxId:'absol',item:'absolite',moves:['깜짝베기'],pp:{}},t=mission10GuardTeams('fire'),fight=createMission10DoubleSnapshot([player],t.ally,t.foes),view=mission10MultiView(fight);
 assert.ok(view.requests[0].specials.some(s=>s.key==='mega'));assert.throws(()=>playMission10MultiTurn(fight,{type:'move',move:'nightslash',target:1,special:'dynamax'}));
 const next=playMission10MultiTurn(fight,{type:'move',move:'nightslash',target:1,special:'mega'});assert.equal(next.teams[0][0].battleAppearance,'absolmega');
});

test('companion can finish after the player has no usable Pokémon without leaving a wait-only battle',async()=>{
 const {Battle}=await import('@pkmn/sim');const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 for(const choice of ['grass','fire','water'])for(let n=0;n<4;n++){
  const player={...makeMon(25,1),boxId:'weak-player',hp:1,moves:['튀어오르기'],pp:{}},t=mission10GuardTeams(choice);const next=playMission10MultiTurn(createMission10DoubleSnapshot([player],t.ally,t.foes),{type:'move',move:'splash'}),b=Battle.fromJSON(next.snapshot);assert.equal(b.ended,true,'companion-only battle must resolve rather than wait for the defeated player');
 }
});

test('multi battle reports defeat when both player and partner teams are exhausted',async()=>{
 const {Battle}=await import('@pkmn/sim');const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const player={...makeMon(25,1),boxId:'weak',hp:1,moves:['튀어오르기'],pp:{}},t=mission10GuardTeams('grass');for(const p of t.ally)p.hp=1;t.foes=t.foes.map((p,i)=>({...makeMon(150,100),boxId:p.boxId,moves:['파동탄'],pp:{}}));const combat=playMission10MultiTurn(createMission10DoubleSnapshot([player],t.ally,t.foes),{type:'move',move:'splash'}),b=Battle.fromJSON(combat.snapshot);assert.equal(b.ended,true);assert.equal(combat.winner,1);assert.equal(combat.teams[0][0].hp,0);
});

test('companion automatically replaces a fainted partner using its own roster',async()=>{
 const {Battle}=await import('@pkmn/sim');const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const player={...makeMon(150,100),boxId:'player',moves:['사이코키네시스'],pp:{}},t=mission10GuardTeams('grass'),fight=createMission10DoubleSnapshot([player],t.ally,t.foes),next=playMission10MultiTurn(fight,{type:'move',move:'psychic',target:-2}),b=Battle.fromJSON(next.snapshot);
 assert.equal(b.p3.active[0].set.trainerToken,'mission10-ally-1');assert.equal(next.teams[2].find(m=>m.boxId==='mission10-ally-0').hp,0);assert.deepEqual(next.teams[0].map(m=>m.boxId),['player']);
});

test('multi battle replaces a defeated enemy from its own reserve',async()=>{
 const {Battle}=await import('@pkmn/sim');const {createMission10DoubleSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const player={...makeMon(150,100),boxId:'player',moves:['사이코키네시스'],pp:{}},ally={...makeMon(150,100),boxId:'ally',moves:['방어'],pp:{}},foes=Array.from({length:3},(_,i)=>({...makeMon(25,1),boxId:`foe-${i}`,moves:['튀어오르기'],pp:{}}));
 assert.throws(()=>createMission10DoubleSnapshot([player],[ally],foes));
 let fight=createMission10DoubleSnapshot([player],[ally],foes,{allowReserve:true});assert.deepEqual(fight.teams[1].map(m=>m.boxId),['foe-0','foe-2']);
 fight=playMission10MultiTurn(fight,{type:'move',move:'psychic',target:1});let battle=Battle.fromJSON(fight.snapshot);assert.equal(battle.p2.pokemon.find(p=>p.set.trainerToken==='foe-0').hp,0);assert.equal(battle.p2.active[0].set.trainerToken,'foe-2');assert.equal(fight.ended,false);
 for(let n=0;n<5&&!fight.ended;n++){const target=battle.p2.active[0]?.hp>0?1:2;fight=playMission10MultiTurn(fight,{type:'move',move:'psychic',target});battle=Battle.fromJSON(fight.snapshot);}
 assert.equal(fight.ended,true);assert.equal(fight.winner,0);assert.ok([...fight.teams[1],...fight.teams[3]].every(m=>m.hp===0));assert.deepEqual(fight.owners.player,['player']);
});

test('one-boss companion battle has no phantom target or switch-in ability',async()=>{
 const {Battle}=await import('@pkmn/sim');const {createCompanionBossSnapshot,mission10MultiView,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const player={...makeMon(282,80),boxId:'trace-player',ability:'trace',moves:['10만볼트'],pp:{}},ally={...makeMon(25,30),boxId:'partner',moves:['10만볼트'],pp:{}},boss={...makeMon(80,60),boxId:'boss',moves:['물의파동'],pp:{}};
 const initial=structuredClone([player,ally,boss]);let fight=createCompanionBossSnapshot([player],[ally],boss),sim=Battle.fromJSON(JSON.parse(JSON.stringify(fight.snapshot)));
 assert.deepEqual([player,ally,boss],initial);assert.equal(sim.p1.active[0].ability,sim.p2.active[0].ability);assert.notEqual(sim.p1.active[0].ability,'swiftswim');assert.equal(sim.p4.pokemon[0].hp,0);assert.equal(sim.p4.pokemonLeft,0);assert.deepEqual(fight.teams.map(team=>team.length),[1,1,1,0]);
 const view=mission10MultiView(fight);assert.deepEqual(view.activeBySide,[[0,1],[0,-1]]);assert.deepEqual(view.requests[0].moves[0].targets.filter(t=>t.side===1).map(t=>t.target),[1]);assert.throws(()=>playMission10MultiTurn(fight,{type:'move',move:'thunderbolt',target:2}));
 fight=playMission10MultiTurn(fight,{type:'move',move:'thunderbolt',target:1});assert.equal(fight.ended,true);assert.equal(fight.winner,0);assert.deepEqual(fight.teams.map(team=>team.length),[1,1,1,0]);assert.ok(fight.log.every(line=>!line.includes('잉어킹')&&!line.includes('Magikarp')));
});

test('one-boss companion battle preserves player switches and handles defeat',async()=>{
 const {Battle}=await import('@pkmn/sim');const {createCompanionBossSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const player=[{...makeMon(25,1),boxId:'lead',moves:['튀어오르기'],pp:{}},{...makeMon(25,1),boxId:'reserve',moves:['튀어오르기'],pp:{}}],ally={...makeMon(25,1),boxId:'ally',moves:['튀어오르기'],pp:{}},boss={...makeMon(150,100),boxId:'boss',moves:['사이코키네시스'],pp:{}};
 let fight=createCompanionBossSnapshot(player,[ally],boss);fight=playMission10MultiTurn(fight,{type:'switch',slot:2});let b=Battle.fromJSON(fight.snapshot);assert.equal(b.p1.active[0].set.trainerToken,'reserve');
 for(let i=0;i<10&&!fight.ended;i++){b=Battle.fromJSON(fight.snapshot);const request=b.p1.activeRequest;fight=playMission10MultiTurn(fight,request?.forceSwitch?.[0]?{type:'switch',slot:b.p1.pokemon.findIndex(p=>!p.isActive&&p.hp>0)+1}:{type:'move',move:'splash'});}
 assert.equal(fight.ended,true);assert.equal(fight.winner,1);assert.deepEqual(fight.owners.player,['lead','reserve']);assert.deepEqual(fight.owners.ally,['ally']);assert.equal(fight.teams[3].length,0);
});

test('starter-based companion rosters match the mission and original starter',async()=>{
 const {rogueCompanionTeam}=await import('../lib/cloud-adventure/adventure-companion-rogue.mjs');
 for(const [choice,ids] of Object.entries({grass:[160,500,310],fire:[154,160,310],water:[500,154,310]})){
  const team=rogueCompanionTeam('beedrill',choice);assert.deepEqual(team.map(mon=>mon.speciesId),ids);assert.deepEqual(team.map(mon=>mon.level),[36,36,37]);assert.ok(team.every(mon=>mon.moves.every(move=>Object.hasOwn(moves,move))));
 }
 for(const [choice,ids] of Object.entries({grass:[160,500,310],fire:[154,160,310],water:[500,154,310]})){
  const team=rogueCompanionTeam('mawile',choice);assert.deepEqual(team.map(mon=>mon.speciesId),ids);assert.deepEqual(team.map(mon=>mon.level),[43,43,44]);assert.ok(team.every(mon=>mon.moves.every(move=>Object.hasOwn(moves,move))));
 }
 for(const [choice,ids] of Object.entries({grass:[160,500,310],fire:[154,160,310],water:[500,154,310]})){
  const team=rogueCompanionTeam('venusaur',choice);assert.deepEqual(team.map(mon=>mon.speciesId),ids);assert.deepEqual(team.map(mon=>mon.level),[50,50,50]);assert.ok(team.every(mon=>mon.moves.every(move=>Object.hasOwn(moves,move))));
 }
 for(const [choice,ids] of Object.entries({grass:[160,500,678,310],fire:[154,160,678,310],water:[500,154,678,310]})){
  const team=rogueCompanionTeam('dragonite',choice);assert.deepEqual(team.map(mon=>mon.speciesId),ids);assert.deepEqual(team.map(mon=>mon.level),[55,55,55,56]);assert.ok(team.every(mon=>mon.moves.every(move=>Object.hasOwn(moves,move))));
 }
 for(const key of ['barbaracle','ampharos','froslass','altaria','tyranitar','starmie'])assert.ok(rogueCompanionTeam(key).every(mon=>mon.moves.every(move=>Object.hasOwn(moves,move))));
 assert.throws(()=>rogueCompanionTeam('beedrill','__proto__'));assert.throws(()=>rogueCompanionTeam('__proto__'));
});

test('companion avoids a spread move that would hit the player when a safe attack exists',async()=>{
 const {createCompanionBossSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const player={...makeMon(129,60),boxId:'player',moves:['튀어오르기'],pp:{}},ally={...makeMon(120,60),boxId:'ally',moves:['파도타기','물의파동'],pp:{}},boss={...makeMon(129,100),boxId:'boss',moves:['튀어오르기'],pp:{}};
 const before=createCompanionBossSnapshot([player],[ally],boss),next=playMission10MultiTurn(before,{type:'move',move:'splash'});
 assert.equal(next.teams[0][0].hp,before.teams[0][0].hp);assert.ok(next.log.some(line=>line.includes('물의파동')));assert.ok(next.log.every(line=>!line.includes('파도타기')));
});

test('mission 36 rival team follows starter and can Mega Evolve its ace',async()=>{
 const {mission36RivalTeam}=await import('../lib/cloud-adventure/adventure-mission10.mjs');
 const own={...makeMon(150,100),boxId:'player',moves:['방어'],pp:{}};
 for(const [choice,first,ace,item,appearance] of [['grass',160,500,'emboarite','emboarmega'],['fire',154,160,'feraligite','feraligatrmega'],['water',500,154,'meganiumite','meganiummega']]){
  const team=mission36RivalTeam(choice);assert.deepEqual(team.map(p=>p.speciesId),[678,706,713,first,310,ace]);assert.deepEqual(team.map(p=>p.level),[62,62,62,63,63,64]);assert.deepEqual(team.map(p=>p.item),['','','','','',item]);assert.ok(team.every(p=>p.moves.length===4&&p.moves.every(m=>Object.hasOwn(moves,m))));
  const result=playCpu(JSON.parse(JSON.stringify(createCombat([own],[team[5]]))),{type:'move',move:'방어'});assert.equal(result.teams[1][0].battleAppearance,appearance);assert.equal(result.teams[1][0].mega,true);
 }
 assert.throws(()=>mission36RivalTeam('__proto__'));
});

test('multi alpha battle stats are applied to both opposing sides only',async()=>{
 const {Battle}=await import('@pkmn/sim');const {makeAdventureAlpha,applyAdventureAlphaBattleStats}=await import('../lib/cloud-adventure/adventure-alpha.mjs');const {createMission10DoubleSnapshot,mission10MultiView}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const player={...makeMon(25,30),boxId:'player'},ally={...makeMon(68,63),boxId:'ally'},foes=[0,1].map(i=>({...makeAdventureAlpha(makeMon(675,65)),boxId:`pangoro-${i}`}));
 const combat=createMission10DoubleSnapshot([player],[ally],foes);const before=Battle.fromJSON(combat.snapshot),base=before.sides.map(side=>({...side.active[0].storedStats}));applyAdventureAlphaBattleStats(combat);const after=Battle.fromJSON(combat.snapshot);
 for(const side of [1,3])for(const stat of ['atk','def','spa','spd'])assert.equal(after.sides[side].active[0].storedStats[stat],base[side][stat]*2);
 for(const side of [0,2])assert.deepEqual(after.sides[side].active[0].storedStats,base[side]);assert.equal(mission10MultiView(combat).activeBySide[1].filter(i=>i>=0).length,2);
});

test('cloud single alpha combat retains its existing battle-only stat boost',async()=>{
 const {Battle}=await import('@pkmn/sim');const {createCombat}=await import('../lib/party-battle.mjs');const {makeAdventureAlpha,applyAdventureAlphaBattleStats}=await import('../lib/cloud-adventure/adventure-alpha.mjs');
 const player={...makeMon(25,30),boxId:'player'},foe={...makeAdventureAlpha(makeMon(675,65)),boxId:'foe'};const combat=createCombat([player],[foe]),before=Battle.fromJSON(combat.snapshot),base={...before.p2.active[0].storedStats};applyAdventureAlphaBattleStats(combat);const after=Battle.fromJSON(combat.snapshot);for(const stat of ['atk','def','spa','spd'])assert.equal(after.p2.active[0].storedStats[stat],base[stat]*2);assert.equal(after.p2.active[0].storedStats.spe,base.spe);
});
