import test from 'node:test';
import assert from 'node:assert/strict';
import {zone5Visible} from '../lib/cloud-adventure/adventure-zone5.mjs';
import {zone7Visible} from '../lib/cloud-adventure/adventure-zone7.mjs';
import {zone9Visible} from '../lib/cloud-adventure/adventure-zone9.mjs';
import {zone10Visible} from '../lib/cloud-adventure/adventure-zone10.mjs';
import {zone11Visible} from '../lib/cloud-adventure/adventure-zone11.mjs';
import {zone12Visible} from '../lib/cloud-adventure/adventure-zone12.mjs';
import {zone16Visible} from '../lib/cloud-adventure/adventure-zone16.mjs';
import {fieldMap,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('land spawns in seven zones hide under player and retain their identity',()=>{
 const cases=[
  [5,zone5Visible,'a',6,3,{zaZone5Upper:true}],
  [7,zone7Visible,'b',9,8,{}],
  [9,zone9Visible,'a',11,9,{zaZone9Upper:false}],
  [10,zone10Visible,'a',5,5,{zaZone10Upper:false}],
  [11,zone11Visible,'p',17,3,{zaZone11Upper:true}],
  [12,zone12Visible,'a',4,10,{}],
  [16,zone16Visible,'a',5,4,{}],
 ];
 for(const [zone,resolve,tile,x,y,layer] of cases){const s={area:3,district:`lumiose-zone${zone}`,interior:null,x,y,facing:'up',teamIds:['kept'],...layer},before=structuredClone(s);assert.equal(resolve(s,tile),null,`zone ${zone}`);assert.notEqual(fieldMap(s)[y][x],tile,`zone ${zone}`);assert.deepEqual(s,before);const restored=restoreAdventurePosition(storeAdventurePosition(s,10),10);assert.deepEqual([restored.x,restored.y,restored.teamIds],[x,y,['kept']]);assert.ok(resolve({...s,x:x+1},tile),`zone ${zone} reappears`);}
 const water={area:3,district:'lumiose-zone10',interior:null,zaZone10Upper:false,x:11,y:8};assert.equal(zone10Visible(water,'c').species,318);assert.equal(fieldMap(water)[8][11],'c');
});
