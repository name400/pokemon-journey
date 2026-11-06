import test from 'node:test';
import assert from 'node:assert/strict';
import {zone15Map,zone15Encounter,zone15Visible,zone15Item} from '../lib/cloud-adventure/adventure-zone15.mjs';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone fifteen gate, day/night encounters and saved position',()=>{
 const base={area:3,district:'lumiose-north-boulevard',interior:null,x:19,y:1,facing:'up',zaRoyaleRank:'E'};assert.equal(stepField(base,'up').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'D'},'up');assert.equal(entered.district,'lumiose-zone15');const s={...base,...entered,zaRoyaleRank:'D'},map=zone15Map(s);assert.ok(fieldPath(map,s,{x:11,y:9}).length);assert.equal(zone15Visible({...s,zaZone15Period:'day'},'b').species,545);assert.equal(zone15Visible({...s,zaZone15Period:'night'},'b').species,353);assert.equal(zone15Visible({...s,zaZone15Period:'day'},'d').species,15);assert.equal(zone15Visible({...s,zaZone15Period:'night'},'d').species,354);assert.equal(zone15Item(s,'i').kind,'ultraball');assert.equal(zone15Item({...s,zaZone15Items:['cafe-ultra']},'i'),null);const roof={...s,zaZone15Upper:true,zaZone15LiftUnlocked:true,x:10,y:7};assert.equal(stepField(roof,'right').blocked,true);assert.equal(stepField({...roof,zaZone15WebOpen:true},'right').x,11);assert.equal(zone15Visible(roof,'a').species,246);const savedRoof=restoreAdventurePosition(storeAdventurePosition(roof,43),43);assert.equal(savedRoof.zaZone15Upper,true);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:9},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone15',11,9]);assert.equal(stepField(s,'left').district,'lumiose-north-boulevard');assert.equal(zone15Encounter('day',()=>.3).speciesId,545);assert.equal(zone15Encounter('night',()=>.4).speciesId,353);
});
test('Zone 15 connects Jaune Sector 7 and its city street with rank gate',()=>{
 const zone={area:3,district:'lumiose-zone15',interior:null,x:11,y:15,zaRoyaleRank:'D',teamIds:['kept']};
 const sector=stepField(zone,'down');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-jaune-sector7',11,1]);
 assert.equal(stepField({...zone,...sector,zaRoyaleRank:'C'},'up').district,'lumiose-zone15');
 assert.equal(stepField({...zone,...sector,zaRoyaleRank:'E'},'up').blocked,true);
 const street=stepField({...zone,...sector,x:1,y:8},'left');assert.equal(street.district,'lumiose-jaune-street');
 assert.equal(stepField({...zone,...street},'up').district,'lumiose-jaune-sector7');
 const saved=restoreAdventurePosition(storeAdventurePosition({...zone,...sector},26),26);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-sector7',11,1,['kept']]);
});
