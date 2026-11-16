import test from 'node:test';import assert from 'node:assert/strict';
import {adventureBattleOptions} from '../lib/cloud-adventure/adventure-battle-weather.mjs';
test('outdoor rain applies without changing explicit weather or indoor and unknown arenas',()=>{
 const s={area:3,district:'lumiose-bleu-sector5',weather:'rain'},o={heals:0};assert.deepEqual(adventureBattleOptions(s,o),{heals:0,weather:'raindance'});assert.deepEqual(o,{heals:0});
 for(const change of [{interior:'cafeGallant'},{district:'lumiose-sewer'},{district:'lumiose-site'},{district:'future-arena'},{area:2},{weather:''},{district:'lumiose-zone20',zaMission42Underground:true}])assert.deepEqual(adventureBattleOptions({...s,...change},o),o);
 assert.deepEqual(adventureBattleOptions({...s,district:'lumiose-zone8'},o),{heals:0,weather:'raindance'});assert.deepEqual(adventureBattleOptions(s,{weather:'sunnyday'}),{weather:'sunnyday'});assert.deepEqual(adventureBattleOptions(s,{weather:undefined}),{weather:undefined});
});

test('inherited rain boosts Water damage and weakens Fire damage',async()=>{
 const {makeMon}=await import('../lib/game.mjs'),{createCombat,playCpu}=await import('../lib/party-battle.mjs'),{Battle}=await import('@pkmn/sim');
 const a={...makeMon(150,30),boxId:'hero',moves:['물대포','화염방사']},b={...makeMon(242,100),boxId:'foe',moves:['튀어오르기']},dry=createCombat([a],[b]),sim=Battle.fromJSON(dry.snapshot);sim.field.setWeather('raindance',sim.p1.active[0],sim.dex.moves.get('raindance'));sim.field.weatherState.duration=0;const rain={...dry,snapshot:sim.toJSON()};
 const damage=(combat,move)=>combat.teams[1][0].hp-playCpu(combat,{type:'move',move}).teams[1][0].hp;
 assert.ok(damage(rain,'물대포')>damage(dry,'물대포'));assert.ok(damage(rain,'화염방사')<damage(dry,'화염방사'));
});

test('new multi and triple battles retain inherited rain across turns and restoration',async()=>{
 const {makeMon}=await import('../lib/game.mjs');
 const {createMission10DoubleSnapshot,mission10MultiView,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const {createMission35TripleSnapshot,mission35TripleView,playMission35TripleTurn}=await import('../lib/cloud-adventure/adventure-mission35-triple.mjs');
 const mon=(id,boxId)=>({...makeMon(id,50),boxId,moves:['튀어오르기'],pp:{}}),player=mon(129,'p'),ally=mon(129,'a'),foes=[0,1,2].map(i=>mon(129,`e${i}`));
 for(const [combat,view,play] of [[createMission10DoubleSnapshot([player],[ally],foes.slice(0,2),{weather:'raindance'}),mission10MultiView,playMission10MultiTurn],[createMission35TripleSnapshot([player],foes,{weather:'raindance'}),mission35TripleView,playMission35TripleTurn]]){
  assert.equal(view(combat).weather,'raindance');const reloaded=JSON.parse(JSON.stringify(combat));assert.equal(view(reloaded).weather,'raindance');const after=play(reloaded,{type:'move',move:'splash'});assert.equal(view(after).weather,'raindance');
 }
 assert.equal(mission35TripleView(createMission35TripleSnapshot([player],foes)).weather,'');
});


test('confirmed outdoor streets, courts and rooftops inherit city rain',()=>{
 const streets=['lumiose-bleu-sector7','lumiose-bleu6-approach','lumiose-jaune-sector8','lumiose-screw-jaune6','lumiose-screw-magenta8','lumiose-rouge-north','lumiose-rouge-sector1','lumiose-rouge-sector7','lumiose-vert-sector3','lumiose-vert-sector6','lumiose-rust','lumiose-south-boulevard'];
 for(const district of streets){const s={area:3,district,weather:'rain'};assert.equal(adventureBattleOptions(s).weather,'raindance',district);assert.deepEqual(adventureBattleOptions({...s,interior:'other'}),{});assert.deepEqual(adventureBattleOptions({...s,weather:''}),{});assert.deepEqual(adventureBattleOptions(s,{weather:'sunnyday'}),{weather:'sunnyday'});}
});

test('confirmed rogue mega outdoor sites inherit weather without affecting indoor arenas',()=>{
 for(const district of ['lumiose-vernal','lumiose-aymlis-park','lumiose-mission12-jaune3','lumiose-north-boulevard','lumiose-magenta-sector9']){
  const s={area:3,district,weather:'rain'};assert.equal(adventureBattleOptions(s).weather,'raindance',district);assert.deepEqual(adventureBattleOptions({...s,interior:'building'}),{});assert.deepEqual(adventureBattleOptions({...s,weather:''}),{});assert.deepEqual(adventureBattleOptions(s,{weather:'sunnyday'}),{weather:'sunnyday'});
 }
});

test('late rogue mega rooftops and alley inherit rain only outdoors',()=>{
 for(const district of ['lumiose-rooftop','lumiose-mission27-roof','lumiose-magenta-sector4','lumiose-magenta-sector4-roof','lumiose-mission32-courtyard','lumiose-mission33-alley','lumiose-mission34-roof']){
  const s={area:3,district,weather:'rain'};assert.equal(adventureBattleOptions(s).weather,'raindance',district);assert.deepEqual(adventureBattleOptions({...s,interior:'building'}),{});assert.deepEqual(adventureBattleOptions({...s,weather:''}),{});assert.deepEqual(adventureBattleOptions(s,{weather:'sunnyday'}),{weather:'sunnyday'});
 }
});

// Mission 25 starts both Team MZ court fights from Vert 4. The legacy
// Vernal route is also outdoor; building interiors never inherit rain.
test('mission 25 court and legacy outdoor battles inherit weather safely',async()=>{
 const {makeMon}=await import('../lib/game.mjs'),{createCombat,combatView,playCpu}=await import('../lib/party-battle.mjs');
 for(const district of ['lumiose-vert-sector4','lumiose-vernal']){
  const s={area:3,district,weather:'rain'},options=adventureBattleOptions(s,{heals:0,strategy:'balanced'});
  assert.equal(options.weather,'raindance');
  assert.equal(adventureBattleOptions({...s,interior:'building'}).weather,undefined);
  const hero={...makeMon(129,30),boxId:'hero',moves:['튀어오르기']},foe={...makeMon(129,30),boxId:'foe',moves:['튀어오르기']};
  const battle=createCombat([hero],[foe],options);assert.equal(combatView(battle).weather,'raindance');
  assert.equal(combatView(playCpu(JSON.parse(JSON.stringify(battle)),{type:'move',move:'튀어오르기'})).weather,'raindance');
 }
});
