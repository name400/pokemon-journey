import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {adventureBattleOptions} from '../lib/cloud-adventure/adventure-battle-weather.mjs';

test('Magenta 7 courtyard and four street connections preserve saves and zone gates',()=>{
 const s={area:3,district:'lumiose-magenta-sector7',interior:null,x:11,y:8,zaRoyaleRank:'Z',teamIds:['kept'],money:731};
 const map=fieldMap(s);assert.equal(map[12][16],';');assert.ok(fieldPath(map,s,{x:16,y:12}).length);
 for(const [x,y,dir,district,bx,by,reverse] of [[1,8,'left','lumiose-magenta-sector8-route',21,6,'right'],[21,8,'right','lumiose-magenta-sector4',1,8,'left'],[11,1,'up','lumiose-quasartico',13,15,'down'],[11,15,'down','lumiose-magenta-street',21,6,'right']]){
  assert.ok(fieldPath(map,s,{x,y}).length);
  const next=stepField({...s,x,y},dir);assert.deepEqual([next.district,next.x,next.y],[district,bx,by]);
  const back=stepField({...s,...next},reverse);assert.deepEqual([back.district,back.x,back.y],[s.district,x,y]);
 }
 const old=restoreAdventurePosition(storeAdventurePosition({...s,x:16,y:12},177),177);
 assert.deepEqual([old.district,old.x,old.y,old.teamIds,old.money],['lumiose-magenta-sector7',16,12,['kept'],731]);
 assert.equal(stepField({...s,district:'lumiose-magenta-sector4',x:11,y:15},'down').blocked,true);
 assert.equal(stepField({...s,district:'lumiose-magenta-sector8-route',x:21,y:8},'right').blocked,true);
 assert.equal(adventureBattleOptions({...s,weather:'rain'}).weather,'raindance');
});

 test('Sector 7 and 9 ground connection does not open Zone 18 and survives saves',()=>{
 const s={area:3,district:'lumiose-magenta-sector7',interior:null,x:7,y:1,zaRoyaleRank:'Z',teamIds:['kept'],money:731};
 assert.ok(fieldPath(fieldMap(s),s,{x:11,y:8}).length);
 const nine=stepField(s,'up');assert.deepEqual([nine.district,nine.x,nine.y,nine.zaMagenta9Upper],['lumiose-magenta-sector9',17,15,false]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...nine},178),178);
 assert.deepEqual([saved.teamIds,saved.money],[['kept'],731]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:11,y:8}).length);
 assert.equal(stepField({...saved,x:11,y:1},'up').blocked,true);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-sector7',7,1]);
 });
