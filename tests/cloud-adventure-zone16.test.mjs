import test from 'node:test';
import assert from 'node:assert/strict';
import {zone16Map,zone16Encounter,zone16Visible} from '../lib/cloud-adventure/adventure-zone16.mjs';
import {bleuPlazaRouteMap} from '../lib/cloud-adventure/adventure-bleu-plaza-route.mjs';
import {stepField,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone sixteen gate, central monument and saved position',()=>{
 const base={area:3,district:'lumiose-zone5',interior:null,x:17,y:15,facing:'down',zaRoyaleRank:'D'};const street=stepField(base,'down');assert.equal(street.district,'lumiose-bleu-plaza-route');assert.ok(fieldPath(bleuPlazaRouteMap(),street,{x:21,y:8}).length);const savedStreet=restoreAdventurePosition(storeAdventurePosition({...base,...street},5),5);assert.equal(savedStreet.district,'lumiose-bleu-plaza-route');assert.equal(stepField({...base,...street},'up').district,'lumiose-zone5');const gate={...base,...street,x:11,y:15,facing:'down'};assert.equal(stepField(gate,'down').blocked,true);
 const entered=stepField({...gate,zaRoyaleRank:'C'},'down');assert.equal(entered.district,'lumiose-zone16');const s={...base,...entered,zaRoyaleRank:'C'},map=zone16Map(s);assert.ok(fieldPath(map,s,{x:11,y:7}).length);assert.equal(map[8][11],'f');assert.equal(zone16Map({zaZone16Spent:{froakie:true}})[8][11],'#');assert.equal(map[4][18],'~');assert.equal(zone16Visible(s,'b').species,870);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:7},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone16',11,7]);assert.equal(stepField(s,'up').district,'lumiose-bleu-plaza-route');const office=stepField({...base,...street,x:21,y:8,facing:'right'},'right');assert.equal(office.district,'lumiose-rust');assert.equal(stepField({...base,...office},'left').district,'lumiose-bleu-plaza-route');assert.equal(zone16Encounter(s,()=>0).speciesId,180);
});
test('all three Zone 16 entrances return to the plaza and respect rank',()=>{
 const base={area:3,district:'lumiose-bleu-plaza-route',interior:null,y:15,zaRoyaleRank:'D',teamIds:['kept']};
 for(const [x,zx,zy,back] of [[16,21,8,'right'],[20,1,12,'left']]){
  const plaza={...base,x};assert.equal(stepField(plaza,'down').blocked,true);
  const zone=stepField({...plaza,zaRoyaleRank:'C'},'down');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone16',zx,zy]);
  const result=stepField({...plaza,...zone},back);assert.deepEqual([result.district,result.x,result.y],['lumiose-bleu-plaza-route',x,15]);
  const saved=restoreAdventurePosition(storeAdventurePosition({...plaza,...zone},9),9);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone16',zx,zy,['kept']]);
 }
});

test('Froakie is on the central monument and a spent encounter restores safely',()=>{
 const s={area:3,district:'lumiose-zone16',interior:null,x:11,y:9,facing:'up',teamIds:['kept'],zaRoyaleRank:'C'};
 assert.equal(zone16Visible(s,'f').species,656);assert.equal(fieldDialogue(s).action,'zone16Wild-froakie');
 const standing=stepField(s,'up');assert.deepEqual([standing.x,standing.y],[11,8]);
 const stored=storeAdventurePosition({...s,...standing,zaZone16Spent:{froakie:true}},56);
 const saved=restoreAdventurePosition(stored,56);assert.equal(saved.district,'lumiose-zone16');
 assert.ok(walkable(zone16Map(saved)[saved.y][saved.x]));assert.deepEqual(saved.teamIds,['kept']);
 assert.equal(saved.zaZone16Spent.froakie,true);assert.equal(restoreAdventurePosition(stored,57).district,null);
});
