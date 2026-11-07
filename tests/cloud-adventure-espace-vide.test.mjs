import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {espaceVideMap} from '../lib/cloud-adventure/adventure-espace-vide.mjs';
test('Espace Vide connects lower Zone 10, Estival and Bleu Sector 6 safely',()=>{
 const start={area:3,district:'lumiose-zone10',interior:null,x:21,y:6,facing:'right',zaRoyaleRank:'F',zaZone10Upper:false};
 const lane=stepField(start,'right');assert.equal(lane.district,'lumiose-espace-vide');assert.equal(lane.zaEspaceLower,true);assert.equal(espaceVideMap(lane)[8][5],'l');
 const saved=restoreAdventurePosition(storeAdventurePosition({...start,...lane,teamIds:['kept']},4),4);assert.equal(saved.district,'lumiose-espace-vide');assert.equal(saved.zaEspaceLower,true);assert.deepEqual(saved.teamIds,['kept']);
 assert.equal(stepField({...start,...lane},'left').district,'lumiose-zone10');const west=stepField({...start,x:1,y:6},'left');assert.equal(west.district,'lumiose-south-boulevard');assert.equal(stepField({...start,...west},'up').district,'lumiose-zone10');assert.equal(stepField({...start,...lane,zaRoyaleRank:'G'},'left').blocked,true);
 const upper={...start,...lane,zaEspaceLower:false,x:6,y:8};assert.ok(fieldPath(espaceVideMap(upper),upper,{x:11,y:1}).length);assert.ok(fieldPath(espaceVideMap(upper),upper,{x:11,y:15}).length);
 const old=storeAdventurePosition({...upper,x:1,y:8,teamIds:['legacy']},7);delete old.zaEspaceLower;const legacy=restoreAdventurePosition(old,7);assert.deepEqual([legacy.district,legacy.x,legacy.y],['lumiose-espace-vide',1,8]);assert.deepEqual(legacy.teamIds,['legacy']);
 const north=stepField({...upper,x:11,y:1},'up');assert.equal(north.district,'lumiose-estival-approach');assert.equal(stepField({...upper,...north},'down').district,'lumiose-espace-vide');
 const south=stepField({...upper,x:11,y:15},'down');assert.equal(south.district,'lumiose-bleu6-approach');assert.equal(stepField({...upper,...south},'up').district,'lumiose-espace-vide');
 const center=stepField({...upper,...north,x:11,y:1},'up');assert.equal(center.district,'lumiose-centrico-route');assert.equal(stepField({...upper,...center},'down').district,'lumiose-estival-approach');const plaza=stepField({...upper,...south,x:11,y:15},'down');assert.equal(plaza.district,'lumiose-bleu-plaza-route');assert.equal(stepField({...upper,...plaza},'left').district,'lumiose-bleu6-approach');const oldEnd=restoreAdventurePosition(storeAdventurePosition({...upper,...south,x:11,y:15,teamIds:['kept']},9),9);assert.deepEqual([oldEnd.district,oldEnd.x,oldEnd.y],['lumiose-bleu6-approach',11,15]);assert.deepEqual(oldEnd.teamIds,['kept']);
});

test('Espace Vide surface and underground connect independently to Bleu Sector 4',()=>{
 const base={area:3,district:'lumiose-espace-vide',interior:null,x:21,y:8,facing:'right',teamIds:['kept'],zaMission20Stage:7};
 const upper={...base,zaEspaceLower:false};const road=stepField(upper,'right');assert.equal(road.district,'lumiose-bleu-sector4');
 const returnUpper=stepField({...upper,...road},'left');assert.deepEqual([returnUpper.district,returnUpper.zaEspaceLower],['lumiose-espace-vide',false]);
 const lower={...base,zaEspaceLower:true};const tunnel=stepField(lower,'right');assert.equal(tunnel.district,'lumiose-bleu4-tunnel');
 const returnLower=stepField({...lower,...tunnel},'left');assert.deepEqual([returnLower.district,returnLower.zaEspaceLower],['lumiose-espace-vide',true]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...lower,...tunnel,x:16,y:8},78),78);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission20Stage],['lumiose-bleu4-tunnel',16,8,['kept'],7]);
 const rust=stepField({...upper,...road,x:21,y:8},'right');assert.equal(rust.district,'lumiose-rust');assert.equal(stepField({...upper,...rust},'right').district,'lumiose-bleu-sector4');
});
