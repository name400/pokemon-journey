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
