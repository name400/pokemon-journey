import test from 'node:test';
import assert from 'node:assert/strict';
import {ZONE9_CRYSTALS,crystalResearchProgress,crystalResearchCount} from '../lib/cloud-adventure/adventure-mega-crystals.mjs';
import {zone9Map} from '../lib/cloud-adventure/adventure-zone9.mjs';
import {fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('zone 9 rooftop crystals are reachable and legacy saves keep their coordinates',()=>{
 const s={area:3,district:'lumiose-zone9',interior:null,zaZone9Upper:true,zaRooftopCrystalCleared:true,zaRoyaleRank:'F',x:5,y:6,facing:'up',teamIds:['saved']},map=zone9Map(s);
 for(const c of ZONE9_CRYSTALS){assert.equal(map[c.y][c.x],'*');assert.ok(fieldPath(map,s,c).length,`unreachable ${c.x},${c.y}`);assert.equal(fieldDialogue({...s,x:c.x,y:c.y}).action,'smashZone9Crystal');}
 const old=restoreAdventurePosition(storeAdventurePosition(s,7),7);assert.deepEqual([old.x,old.y,old.teamIds],[5,6,['saved']]);
});

test('crystal research credits recorded legacy crystals and cumulative milestones',()=>{
 assert.deepEqual(crystalResearchProgress({}),{count:0,points:0,next:20});
 const s={zaRooftopCrystalCleared:true,zaResearchCrystalBreaks:19};assert.deepEqual(crystalResearchProgress(s),{count:20,points:100,next:50});
 s.zaResearchCrystalBreaks=999;assert.deepEqual(crystalResearchProgress(s),{count:1000,points:1000,next:null});
 assert.equal(crystalResearchCount({zaResearchCrystalBreaks:-1}),0);
});
