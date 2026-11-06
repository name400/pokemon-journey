import test from 'node:test';
import assert from 'node:assert/strict';
import {zone13Map,zone13Encounter,zone13Visible,zone13Item} from '../lib/cloud-adventure/adventure-zone13.mjs';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone thirteen woodland gate and saved position',()=>{
 const base={area:3,district:'lumiose-north-boulevard',interior:null,x:5,y:1,facing:'up',zaRoyaleRank:'F'};assert.equal(stepField(base,'up').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'E'},'up');assert.equal(entered.district,'lumiose-zone13');const s={...base,...entered,zaRoyaleRank:'E'},map=zone13Map(s);assert.ok(fieldPath(map,s,{x:11,y:10}).length);assert.equal(zone13Visible(s,'a').species,214);assert.equal(zone13Visible(s,'b').species,127);assert.equal(zone13Visible({...s,zaZone13Period:'day'},'e').alpha,true);assert.equal(zone13Visible({...s,zaZone13Period:'day'},'d'),null);assert.equal(zone13Visible({...s,zaZone13Period:'night'},'d').species,709);assert.equal(zone13Item(s,'i').kind,'luxuryball');assert.equal(zone13Item({...s,zaZone13Items:['north-luxury']},'i'),null);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:10},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone13',11,10]);assert.equal(stepField(s,'left').district,'lumiose-north-boulevard');assert.equal(zone13Encounter('day',()=>0).speciesId,666);assert.equal(zone13Encounter('night',()=>0).speciesId,708);
});
test('Zone 13 east gate preserves rank restriction and connects both ends',()=>{
 const road={area:3,district:'lumiose-north-boulevard',interior:null,x:6,y:1,zaRoyaleRank:'F',teamIds:['kept']};
 assert.equal(stepField(road,'up').blocked,true);
 const open={...road,zaRoyaleRank:'E'},east=stepField(open,'up');
 assert.deepEqual([east.district,east.x,east.y],['lumiose-zone13',21,8]);
 assert.equal(stepField({...open,...east},'right').district,'lumiose-north-boulevard');
 assert.ok(fieldPath(zone13Map(open),east,{x:1,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...open,...east},23),23);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone13',21,8,['kept']]);
});
