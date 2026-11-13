import test from 'node:test';
import assert from 'node:assert/strict';
import {COLORFUL_SCREW_SITES,colorfulScrewAvailable} from '../lib/cloud-adventure/adventure-colorful-screws.mjs';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {adventureCaptureAttempt} from '../lib/cloud-adventure/adventure-balls.mjs';

test('three initial screws are accessible once and preserve unknown save records',()=>{
 const starts=[[11,14],[6,11],[4,7]];
 for(const [i,p] of COLORFUL_SCREW_SITES.entries()){
  const s={area:3,...p,zaRedCanariPlush:true,zaRoyaleRank:'F',teamIds:['kept'],zaColorfulScrewsFound:['future-screw']},map=fieldMap(s);assert.equal(map[p.y][p.x],'!');assert.ok(fieldPath(map,{x:starts[i][0],y:starts[i][1]},p).length);assert.equal(fieldDialogue({...s,facing:'up'}).action,'collectColorfulScrew');
  const saved=restoreAdventurePosition(storeAdventurePosition(s,42),42);assert.deepEqual(saved.teamIds,['kept']);assert.deepEqual(saved.zaColorfulScrewsFound,['future-screw']);assert.notEqual(fieldMap({...s,zaColorfulScrewsFound:['future-screw',p.id]})[p.y][p.x],'!');assert.notEqual(fieldMap({...s,zaRedCanariPlush:false,zaRoyaleRank:'Z'})[p.y][p.x],'!');assert.equal(fieldMap({...s,zaRedCanariPlush:false,zaRoyaleRank:'F'})[p.y][p.x],'!');
 }
 assert.equal(colorfulScrewAvailable({zaColorfulScrewsFound:COLORFUL_SCREW_SITES.map(p=>p.id),zaColorfulScrewsSpent:3}),0);assert.equal(colorfulScrewAvailable({zaColorfulScrewsFound:COLORFUL_SCREW_SITES.map(p=>p.id),zaColorfulScrewsSpent:'invalid'}),0);
});

test('blue plush applies the verified 1.1 capture multiplier and preserves old saves',()=>{
 const mon={speciesId:1,level:10,hp:15,maxHp:30,types:['풀']},base={royaleRank:'A',moveCount:0},rng=()=>.015;
 assert.equal(adventureCaptureAttempt(mon,'pokeball',base,rng).caught,false);assert.equal(adventureCaptureAttempt(mon,'pokeball',{...base,bluePlushLevel:1},rng).caught,true);assert.equal(adventureCaptureAttempt(mon,'pokeball',{...base,bluePlushLevel:0},rng).caught,false);
 for(const context of [{overworld:true},{catchWindow:true},{alpha:true},{overworld:true,unaware:true,backstrike:true}]){const a=adventureCaptureAttempt(mon,'pokeball',{...base,...context,bluePlushLevel:1},()=>0);assert.equal(a.caught,true);}
 assert.equal(adventureCaptureAttempt(mon,'masterball',{...base,bluePlushLevel:1},()=>.999).caught,true);
});
