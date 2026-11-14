import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {evolveAdventurePokemon} from '../lib/cloud-adventure/adventure-evolution.mjs';
import {adventurePokemonSize,assignAdventureCapturedSize} from '../lib/cloud-adventure/adventure-size.mjs';
import {side63Eligible} from '../lib/cloud-adventure/adventure-side63.mjs';

test('size brackets and alpha are distinct; old and future data are not invented',()=>{
 const m=makeMon(673,40);
 for(const [scale,size] of [[0,'XS'],[15,'XS'],[16,'S'],[47,'S'],[48,'M'],[207,'M'],[208,'L'],[239,'L'],[240,'XL'],[255,'XL']])assert.equal(adventurePokemonSize({...m,adventureScaleV1:{version:1,scale}}),size);
 for(const v of [undefined,null,{version:2,scale:250},{version:1,scale:256},{version:1,scale:240,other:true}])assert.equal(adventurePokemonSize({...m,adventureScaleV1:v}),null);
 assert.equal(adventurePokemonSize({...m,adventureAlpha:true}),'XL');assert.equal(side63Eligible({...m,adventureAlpha:true}),true);assert.equal(side63Eligible({...m,adventureScaleV1:{version:1,scale:240}}),true);assert.equal(side63Eligible({...m,adventureScaleV1:{version:1,scale:239}}),false);
});

test('newly captured selected families roll once and keep their size through evolution',()=>{
 const nums=[.999,.999],baby=assignAdventureCapturedSize(makeMon(672,32),()=>nums.shift());assert.equal(baby.adventureScaleV1.scale,255);assert.equal(nums.length,0);
 const evolved=evolveAdventurePokemon({...baby,boxId:'own'},673);assert.equal(side63Eligible(evolved),true);assert.deepEqual(evolved.adventureScaleV1,baby.adventureScaleV1);
 for(const m of [{...baby,adventureScaleV1:{version:2,scale:240}},makeMon(25,10),{...makeMon(672,10),adventureAlpha:true}])assert.strictEqual(assignAdventureCapturedSize(m,()=>{throw Error('unexpected size roll');}),m);
 assert.throws(()=>assignAdventureCapturedSize(makeMon(712,20),()=>1));
});

test('visible size follows a fixed encounter and protects unknown ledgers',async()=>{
 const {assignVisibleAdventureSize,attachVisibleAdventureSize,visibleAdventureSize}=await import('../lib/cloud-adventure/adventure-size.mjs');
 const {assignWildShiny,clearWildShiny}=await import('../lib/cloud-adventure/adventure-wild-shiny.mjs');
 const {refreshZoneShinyRolls,refreshVisibleWildOnSameZoneTravel}=await import('../lib/cloud-adventure/adventure-wild-refresh.mjs');
 const key='zone12:gogoat:673',s={district:'lumiose-zone12',zaWildShinyRolls:{[key]:false}};
 assert.equal(assignVisibleAdventureSize(s,key,()=>.999),true);assert.equal(visibleAdventureSize(s,key).scale,255);assert.equal(assignVisibleAdventureSize(s,key,()=>{throw Error('must not reroll');}),false);
 const m=makeMon(673,40);assignWildShiny(s,m,()=>{throw Error('saved shiny');},key);assert.equal(adventurePokemonSize(m),'XL');assert.equal(attachVisibleAdventureSize(s,{...makeMon(712,30)},key).adventureScaleV1,undefined);
 refreshVisibleWildOnSameZoneTravel(s,12,[{id:'gogoat',species:673}]);assert.equal(visibleAdventureSize(s,key),null);
 assignVisibleAdventureSize(s,key,()=>0);s.zaWildShinyRolls[key]=true;refreshZoneShinyRolls(s,12);assert.equal(visibleAdventureSize(s,key).scale,0);clearWildShiny(s,key);assert.equal(visibleAdventureSize(s,key),null);
 const future={zaWildSizeRollsV1:{version:2,entries:{[key]:{version:1,scale:255}}}};assert.equal(assignVisibleAdventureSize(future,key,()=>0),false);clearWildShiny(future,key);assert.equal(future.zaWildSizeRollsV1.version,2);
});

test('roaming Skiddo keeps size across shiny preservation and clears it on exit',async()=>{
 const {assignVisibleAdventureSize,visibleAdventureSize,adventureFieldSizeFactor}=await import('../lib/cloud-adventure/adventure-size.mjs');
 const {refreshRoamingWildOnExit,refreshRoamingWildSpawns}=await import('../lib/cloud-adventure/adventure-roaming-refresh.mjs');
 const key='field3:skiddo:672',base={area:3,district:'lumiose-rouge-north',zaWildShinyRolls:{[key]:false}};
 assert.equal(assignVisibleAdventureSize(base,key,()=>.999),true);assert.equal(adventureFieldSizeFactor(base,key),1.18);assert.ok(adventureFieldSizeFactor(base,key,true)>adventureFieldSizeFactor(base,key));assert.equal(adventureFieldSizeFactor({...base,zaWildVisibleAlphaLevels:{[key]:25}},key),1.25);assert.equal(adventureFieldSizeFactor(base,'field3:other:999'),1);
 assert.equal(refreshRoamingWildOnExit(base,3),true);assert.equal(visibleAdventureSize(base,key),null);
 base.zaWildShinyRolls[key]=true;assignVisibleAdventureSize(base,key,()=>0);assert.equal(refreshRoamingWildOnExit(base,3),false);assert.equal(visibleAdventureSize(base,key).scale,0);
 const present={...base,district:'lumiose-zone3',x:2,y:2,zaWildSpawnCycles:{3:{period:'day',interval:10}}};assert.equal(refreshRoamingWildSpawns(present,'night',11),true);assert.equal(visibleAdventureSize(present,key).scale,0);
});

test('managed ordinary field slots share size handling without confusing forms or alpha',async()=>{
 const {assignVisibleAdventureSize,attachVisibleAdventureSize,visibleAdventureSize,adventureFieldSizeFactor}=await import('../lib/cloud-adventure/adventure-size.mjs');
 const world={};for(const [key,id] of [['zone6:magikarp:129',129],['field2:magikarp:129',129],['field3:skiddo:672',672],['zone15:pumpkaboo-super:10029',10029]]){
  assert.equal(assignVisibleAdventureSize(world,key,()=>.999),true);const m=makeMon(id,40);attachVisibleAdventureSize(world,m,key);assert.equal(adventurePokemonSize(m),'XL');assert.equal(adventureFieldSizeFactor(world,key),1.18);assert.equal(visibleAdventureSize(world,key).scale,255);const alpha={...makeMon(id,40),adventureAlpha:true};attachVisibleAdventureSize(world,alpha,key);assert.equal(alpha.adventureScaleV1,undefined);
 }
 assert.equal(assignVisibleAdventureSize(world,'zone20:story:718',()=>0),false);assert.equal(assignVisibleAdventureSize(world,'zone6:__proto__:129:extra',()=>0),false);assert.equal(attachVisibleAdventureSize(world,makeMon(25,40),'zone6:magikarp:129').adventureScaleV1,undefined);
});

test('zone 20 surface sizes follow the stored visible identity only',async()=>{
 const {assignVisibleAdventureSize,visibleAdventureSize,adventureFieldSizeFactor}=await import('../lib/cloud-adventure/adventure-size.mjs');
 const {assignWildShiny,clearWildShiny}=await import('../lib/cloud-adventure/adventure-wild-shiny.mjs');
 const world={zaWildShinyRolls:{'zone20:bulbasaur:1':true}};
 for(const [key,species] of [['zone20:bulbasaur:1',1],['zone20:charmander:4',4],['zone20:lucario:448',448]]){
  assert.equal(assignVisibleAdventureSize(world,key,()=>.999),true);const mon=makeMon(species,55);assignWildShiny(world,mon,()=>.999,key);assert.equal(adventurePokemonSize(mon),'XL');assert.equal(adventureFieldSizeFactor(world,key),1.18);assert.equal(adventureFieldSizeFactor(world,key,true),1.25);
 }
 for(const key of ['zone20:alpha:448','zone20:story:718','zone20:bulbasaur:4'])assert.equal(assignVisibleAdventureSize(world,key,()=>0),false);
 clearWildShiny(world,'zone20:bulbasaur:1');assert.equal(visibleAdventureSize(world,'zone20:bulbasaur:1'),null);assert.equal(visibleAdventureSize(world,'zone20:charmander:4').scale,255);
});
