import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,rotoGlideLanding,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {adventureBattleOptions} from '../lib/cloud-adventure/adventure-battle-weather.mjs';

test('southern roof gliding unlock and collected screw survive reentry',()=>{
 const north={area:3,district:'lumiose-magenta7-north-roof',interior:null,x:17,y:10,zaMagenta7NorthOpen:true,zaRedCanariPlush:true,teamIds:['kept']};
 assert.equal(rotoGlideLanding(north),null);
 const ready={...north,zaMission15Stage:2},landing=rotoGlideLanding(ready);assert.deepEqual([landing.district,landing.x,landing.y],['lumiose-magenta7-south-roof',11,3]);
 const south=restoreAdventurePosition(storeAdventurePosition({...ready,...landing,zaColorfulScrewsFound:['future-id']},188),188);assert.equal(fieldMap(south)[4][5],'!');assert.deepEqual(south.teamIds,['kept']);assert.equal(rotoGlideLanding(south).district,north.district);
 assert.notEqual(fieldMap({...south,zaColorfulScrewsFound:['future-id','magenta7-south-roof']})[4][5],'!');
});

test('southern roof can be reached and exited without opening the northern courtyard',()=>{
 const west={area:3,district:'lumiose-screw-magenta8',interior:null,x:19,y:8,zaMission15Stage:2,zaMagenta7NorthOpen:false};
 const landing=rotoGlideLanding(west),south={...west,...landing};assert.deepEqual([landing.district,landing.x,landing.y],['lumiose-magenta7-south-roof',3,8]);assert.equal(rotoGlideLanding({...south,x:11,y:3}),null);assert.equal(rotoGlideLanding(south).district,west.district);
});

test('northern roof requires the opened courtyard and restores its separate floor',()=>{
 const s={area:3,district:'lumiose-magenta-sector7',interior:null,x:6,y:3,teamIds:['kept'],zaMagenta7Items:['north-pearl']};
 assert.equal(stepField(s,'up').blocked,true);
 const roof=stepField({...s,zaMagenta7NorthOpen:true},'up');assert.deepEqual([roof.district,roof.x,roof.y],['lumiose-magenta7-north-roof',11,15]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...roof,zaMagenta7NorthOpen:true,zaMagenta7RoofItems:['west-great']},182),182);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMagenta7Items],['lumiose-magenta7-north-roof',11,15,['kept'],['north-pearl']]);assert.equal(fieldMap(saved)[8][4],'.');assert.equal(fieldMap(saved)[5][5],'j');
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-sector7',6,3]);
});

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
