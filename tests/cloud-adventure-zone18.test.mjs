import test from 'node:test';
import assert from 'node:assert/strict';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone18Map,zone18Visible,zone18Encounter} from '../lib/cloud-adventure/adventure-zone18.mjs';
test('zone eighteen gate, road and saved position',()=>{
 const base={area:3,district:'lumiose-north-boulevard',interior:null,x:2,y:1,facing:'up',zaRoyaleRank:'C'};
 assert.equal(stepField(base,'up').blocked,true);const entered=stepField({...base,zaRoyaleRank:'B'},'up');assert.equal(entered.district,'lumiose-zone18');
 const s={...base,...entered,zaRoyaleRank:'B'};assert.ok(fieldPath(zone18Map(s),s,{x:7,y:8}).length);assert.equal(zone18Visible(s,'a').species,371);assert.equal(zone18Encounter(s,()=>0).speciesId,371);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:7,y:8},2),2);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone18',7,8]);assert.equal(stepField(s,'left').district,'lumiose-north-boulevard');
});
test('Zone 18 south gate connects Magenta Sector 9 and Quasartico',()=>{
 const zone={area:3,district:'lumiose-zone18',interior:null,x:11,y:15,zaRoyaleRank:'B',teamIds:['kept']};
 const sector=stepField(zone,'down');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-magenta-sector9',11,1]);
 assert.equal(stepField({...zone,...sector,zaRoyaleRank:'C'},'up').blocked,true);
 assert.equal(stepField({...zone,...sector},'up').district,'lumiose-zone18');
 const office=stepField({...zone,...sector,x:11,y:15},'down');assert.equal(office.district,'lumiose-quasartico');
 assert.equal(stepField({...zone,...office},'up').district,'lumiose-magenta-sector9');
 const saved=restoreAdventurePosition(storeAdventurePosition({...zone,...sector},34),34);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector9',11,1,['kept']]);
});
