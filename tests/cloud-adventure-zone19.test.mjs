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
