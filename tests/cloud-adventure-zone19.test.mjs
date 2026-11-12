import test from 'node:test';
import assert from 'node:assert/strict';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone19Map,zone19Visible,zone19Encounter} from '../lib/cloud-adventure/adventure-zone19.mjs';
import {jauneGardenRouteMap} from '../lib/cloud-adventure/adventure-jaune-garden-route.mjs';
test('zone nineteen gate, pavilion and saved position',()=>{
 const base={area:3,district:'lumiose-zone8',interior:null,x:19,y:1,facing:'up',zaRoyaleRank:'C'};const street=stepField(base,'up');assert.equal(street.district,'lumiose-jaune-garden-route');assert.ok(fieldPath(jauneGardenRouteMap(),street,{x:18,y:1}).length);const streetSaved=restoreAdventurePosition(storeAdventurePosition({...base,...street},3),3);assert.equal(streetSaved.district,'lumiose-jaune-garden-route');assert.equal(stepField({...base,...street},'down').district,'lumiose-zone8');const gate={...base,...street,x:18,y:1,facing:'up'};assert.equal(stepField(gate,'up').blocked,true);
 const entered=stepField({...gate,zaRoyaleRank:'B'},'up');assert.equal(entered.district,'lumiose-zone19');const s={...base,...entered,zaRoyaleRank:'B'};
 assert.ok(fieldPath(zone19Map(s),s,{x:11,y:9}).length);assert.equal(zone19Visible(s,'a').species,676);assert.equal(zone19Encounter(s,()=>0).speciesId,676);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:9},2),2);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone19',11,9]);assert.equal(stepField(s,'down').district,'lumiose-jaune-garden-route');
});

test('Zone 19 west and east entrances connect both ways and preserve old routes',()=>{
 for(const [district,x,landingX,reverse] of [['lumiose-jaune-street',19,1,'left'],['lumiose-jaune-garden-route',19,21,'right']]){
  const road={area:3,district,interior:null,x,y:1,facing:'up',zaRoyaleRank:'C',teamIds:['kept']};assert.equal(stepField(road,'up').blocked,true);
  const arrival=stepField({...road,zaRoyaleRank:'B'},'up');assert.deepEqual([arrival.district,arrival.x,arrival.y],['lumiose-zone19',landingX,8]);
  const saved=restoreAdventurePosition(storeAdventurePosition({...road,...arrival,zaRoyaleRank:'B'},32),32);assert.deepEqual(saved.teamIds,['kept']);assert.ok(fieldPath(zone19Map(saved),saved,{x:11,y:9}).length);
  const back=stepField(saved,reverse);assert.deepEqual([back.district,back.x,back.y],[district,x,1]);
 }
});

test('Zone 19 east entrance connects directly to Jaune Sector 8',()=>{
 const road={area:3,district:'lumiose-jaune-sector8',interior:null,x:1,y:8,zaRoyaleRank:'C',teamIds:['kept'],zaZone19Items:['tree-luxury']};
 assert.equal(stepField(road,'left').blocked,true);
 const entry=stepField({...road,zaRoyaleRank:'B'},'left');assert.deepEqual([entry.district,entry.x,entry.y],['lumiose-zone19',21,9]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...road,...entry,zaRoyaleRank:'B'},11),11);assert.deepEqual(saved.teamIds,['kept']);assert.deepEqual(saved.zaZone19Items,['tree-luxury']);
 assert.ok(fieldPath(zone19Map(saved),saved,{x:11,y:9}).length);const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y],['lumiose-jaune-sector8',1,8]);
});

test('Zone 19 research species follow the day and night encounter pools',async()=>{
 const {ZONE19_ENCOUNTERS,zone19EncounterPool}=await import('../lib/cloud-adventure/adventure-zone19.mjs');
 const {LATER_ZONE_SPECIES}=await import('../lib/cloud-adventure/adventure-zone-research.mjs');
 assert.deepEqual(new Set(ZONE19_ENCOUNTERS.map(row=>row[0])),new Set(LATER_ZONE_SPECIES[19]));
 for(const period of ['day','night']){
  const pool=zone19EncounterPool(period),ids=pool.map(row=>row[0]);assert.equal(ids.includes(780),period==='day');assert.equal(ids.includes(173),period==='night');assert.equal(ids.includes(35),period==='night');
  for(const [i,[species,min,max]] of pool.entries()){
   const encounter=(levelRoll)=>{const rolls=[(i+.5)/pool.length,levelRoll];return zone19Encounter({zaZone19Period:period},()=>rolls.shift());};
   assert.deepEqual(encounter(0),{speciesId:species,level:min});assert.deepEqual(encounter(.999),{speciesId:species,level:max});
  }
 }
 const day={zaZone19Period:'day'},night={zaZone19Period:'night'};assert.equal(zone19Visible(day,'e'),null);assert.equal(zone19Visible(night,'e').species,173);assert.equal(zone19Visible(night,'f').species,35);assert.equal(zone19Visible({...night,zaZone19Spent:{'cleffa-night':true}},'e'),null);
 assert.equal(zone19Map(day)[9][9],'g');assert.equal(zone19Map(night)[9][9],'e');assert.equal(zone19Map(night)[9][13],'f');
 const old=restoreAdventurePosition(storeAdventurePosition({area:3,district:'lumiose-zone19',interior:null,x:9,y:9,facing:'down',zaRoyaleRank:'B',...night},31),31);assert.equal(old.x,9);assert.equal(old.y,9);const step=stepField(old,'down');assert.notEqual(step.blocked,true);assert.deepEqual([step.x,step.y],[9,10]);
});
