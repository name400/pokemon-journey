import test from 'node:test';
import assert from 'node:assert/strict';
import {COLORFUL_SCREW_SITES,colorfulScrewAvailable} from '../lib/cloud-adventure/adventure-colorful-screws.mjs';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {adventureCaptureAttempt} from '../lib/cloud-adventure/adventure-balls.mjs';
import {canariLevel,canariBattleExperience,canariPrizeMoney,canariCrystalShards} from '../lib/cloud-adventure/adventure-canari.mjs';
import {SCREW_ROOFS,isScrewGlideRoof} from '../lib/cloud-adventure/adventure-screw-roofs.mjs';

test('three initial screws are accessible once and preserve unknown save records',()=>{
 const starts=[[11,14],[6,11],[4,7]];
 for(const [i,p] of COLORFUL_SCREW_SITES.slice(0,3).entries()){
  const s={area:3,...p,zaRedCanariPlush:true,zaRoyaleRank:'F',teamIds:['kept'],zaColorfulScrewsFound:['future-screw']},map=fieldMap(s);assert.equal(map[p.y][p.x],'!');assert.ok(fieldPath(map,{x:starts[i][0],y:starts[i][1]},p).length);assert.equal(fieldDialogue({...s,facing:'up'}).action,'collectColorfulScrew');
  const saved=restoreAdventurePosition(storeAdventurePosition(s,42),42);assert.deepEqual(saved.teamIds,['kept']);assert.deepEqual(saved.zaColorfulScrewsFound,['future-screw']);assert.notEqual(fieldMap({...s,zaColorfulScrewsFound:['future-screw',p.id]})[p.y][p.x],'!');assert.notEqual(fieldMap({...s,zaRedCanariPlush:false,zaRoyaleRank:'Z'})[p.y][p.x],'!');assert.equal(fieldMap({...s,zaRedCanariPlush:false,zaRoyaleRank:'F'})[p.y][p.x],'!');
 }
 assert.equal(colorfulScrewAvailable({zaColorfulScrewsFound:COLORFUL_SCREW_SITES.slice(0,3).map(p=>p.id),zaColorfulScrewsSpent:3}),0);assert.equal(colorfulScrewAvailable({zaColorfulScrewsFound:COLORFUL_SCREW_SITES.map(p=>p.id),zaColorfulScrewsSpent:'invalid'}),0);
});

test('blue plush applies the verified 1.1 capture multiplier and preserves old saves',()=>{
 const mon={speciesId:1,level:10,hp:15,maxHp:30,types:['풀']},base={royaleRank:'A',moveCount:0},rng=()=>.015;
 assert.equal(adventureCaptureAttempt(mon,'pokeball',base,rng).caught,false);assert.equal(adventureCaptureAttempt(mon,'pokeball',{...base,bluePlushLevel:1},rng).caught,true);assert.equal(adventureCaptureAttempt(mon,'pokeball',{...base,bluePlushLevel:0},rng).caught,false);
 for(const context of [{overworld:true},{catchWindow:true},{alpha:true},{overworld:true,unaware:true,backstrike:true}]){const a=adventureCaptureAttempt(mon,'pokeball',{...base,...context,bluePlushLevel:1},()=>0);assert.equal(a.caught,true);}
 assert.equal(adventureCaptureAttempt(mon,'masterball',{...base,bluePlushLevel:1},()=>.999).caught,true);
});


test('each staged plush applies its documented level and old red saves retain 5%',()=>{
 assert.equal(canariLevel({zaRedCanariPlush:true},'red'),1);assert.equal(canariLevel({zaBlueCanariLevel:4},'blue'),-1);
 assert.deepEqual([0,1,2,3].map(level=>canariBattleExperience(100,true,false,level)),[100,105,110,115]);
 assert.deepEqual([0,1,2,3].map(level=>canariPrizeMoney(1000,level)),[1000,1150,1299,1500]);
 for(const [level,lo,hi] of [[0,1,3],[1,2,4],[2,3,5],[3,5,7]]){assert.equal(canariCrystalShards('small',level,()=>0),lo);assert.equal(canariCrystalShards('small',level,()=>.99999),hi);}
 for(const [level,lo,hi] of [[0,6,10],[1,8,12],[2,10,14],[3,14,18]]){assert.equal(canariCrystalShards('large',level,()=>0),lo);assert.equal(canariCrystalShards('large',level,()=>.99999),hi);}
 const mon={speciesId:1,level:10,hp:15,maxHp:30,types:['풀']},base={royaleRank:'A',moveCount:0};
 for(const [level,r] of [[1,.015],[2,.018],[3,.023]]){assert.equal(adventureCaptureAttempt(mon,'pokeball',{...base,bluePlushLevel:level},()=>r).caught,true);assert.equal(adventureCaptureAttempt(mon,'pokeball',{...base,bluePlushLevel:level-1},()=>r).caught,false);}
});

test('all additional mapped screws render and remain independently collectible',()=>{
 assert.equal(new Set(COLORFUL_SCREW_SITES.map(p=>p.id)).size,COLORFUL_SCREW_SITES.length);
 for(const p of COLORFUL_SCREW_SITES.slice(3)){const s={area:3,...p,zaRedCanariPlush:true,zaRoyaleRank:'A',zaMission15Stage:2},map=fieldMap(s);assert.equal(map[p.y]?.[p.x],'!',p.id);const starts=[];for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++)if('XWEljho'.includes(map[y][x]))starts.push({x,y});if(isScrewGlideRoof(p.district))starts.push({x:14,y:6});assert.ok(starts.some(start=>fieldPath(map,start,p).length>0),`${p.id}: entry path`);assert.notEqual(fieldMap({...s,zaColorfulScrewsFound:[p.id]})[p.y]?.[p.x],'!',p.id);}
 for(const p of COLORFUL_SCREW_SITES.filter(p=>p.requiresGlide)){const s={area:3,...p,zaRedCanariPlush:true,zaRoyaleRank:'A',zaMission15Stage:1};assert.notEqual(fieldMap(s)[p.y]?.[p.x],'!',p.id);assert.equal(fieldMap({...s,zaMission15Stage:2})[p.y]?.[p.x],'!',p.id);}
});

test('old saves on new street entrances retain their position',()=>{
 for(const p of SCREW_ROOFS){const old={area:3,district:p.district,interior:null,x:p.x,y:p.y,facing:'up',teamIds:['kept'],zaColorfulScrewsFound:['old-future-id']};const restored=restoreAdventurePosition(storeAdventurePosition(old,42),42);assert.deepEqual([restored.district,restored.x,restored.y],[p.district,p.x,p.y]);assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaColorfulScrewsFound,['old-future-id']);}
});

test('additional screws preserve a saved position and old collection records',()=>{
 const additional=COLORFUL_SCREW_SITES.slice(61);
 assert.equal(additional.length,16);
 assert.equal(new Set(COLORFUL_SCREW_SITES.map(p=>`${p.district}:${p.interior}:${p.x}:${p.y}`)).size,COLORFUL_SCREW_SITES.length);
 for(const p of additional){
  const s={area:3,...p,facing:'up',teamIds:['kept'],zaRedCanariPlush:true,zaMission15Stage:2,zaColorfulScrewsFound:['future-screw',COLORFUL_SCREW_SITES[0].id]};
  const restored=restoreAdventurePosition(storeAdventurePosition(s,42),42);
  assert.deepEqual([restored.district,restored.x,restored.y],[p.district,p.x,p.y],p.id);
  assert.deepEqual(restored.zaColorfulScrewsFound,s.zaColorfulScrewsFound);
  assert.equal(fieldDialogue(restored).action,'collectColorfulScrew');
  assert.equal(colorfulScrewAvailable({...restored,zaColorfulScrewsFound:[...s.zaColorfulScrewsFound,p.id,p.id]}),2);
 }
});
