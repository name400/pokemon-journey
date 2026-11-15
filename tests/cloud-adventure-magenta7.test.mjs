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

test('Courtyard pickup state preserves old saves and clears only collected markers',()=>{
 const s={area:3,district:'lumiose-magenta-sector7',interior:null,x:15,y:12,teamIds:['kept']};
 const old=restoreAdventurePosition(storeAdventurePosition(s,179),179);
 assert.deepEqual([old.x,old.y,old.teamIds],[15,12,['kept']]);
 assert.equal(fieldMap(old)[12][15],'i');assert.equal(fieldMap(old)[12][18],'j');
 const collected=restoreAdventurePosition(storeAdventurePosition({...old,zaMagenta7Items:['courtyard-awakening']},180),180);
 assert.equal(fieldMap(collected)[12][15],';');assert.equal(fieldMap(collected)[12][18],'j');
});

test('Northern courtyard entrance and rewards survive saving without blocking older paths',()=>{
 const s={area:3,district:'lumiose-magenta-sector7',interior:null,x:6,y:6,facing:'up',teamIds:['kept']};
 const closed=fieldMap(s);assert.equal(closed[5][6],'r');assert.equal(stepField(s,'up').blocked,true);
 const opened={...s,zaMagenta7NorthOpen:true};assert.ok(fieldPath(fieldMap(opened),opened,{x:5,y:3}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...opened,x:5,y:3,zaMagenta7Items:['north-great']},181),181);
 assert.deepEqual([saved.x,saved.y,saved.teamIds,saved.zaMagenta7NorthOpen],[5,3,['kept'],true]);
 assert.equal(fieldMap(saved)[3][4],'g');assert.equal(fieldMap(saved)[3][7],'n');assert.ok(fieldPath(fieldMap(saved),saved,{x:6,y:6}).length);
});
