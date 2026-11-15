import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {canLearnStoryTm,storyTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Bleu 7 TM giver preserves position, courtyard and reviewed compatibility',()=>{
 const s={area:3,district:'lumiose-bleu-sector7',interior:null,x:16,y:15,facing:'up',teamIds:['kept']};
 const saved=restoreAdventurePosition(storeAdventurePosition(s,203),203),map=fieldMap(saved);
 assert.deepEqual([saved.x,saved.y,saved.teamIds],[16,15,['kept']]);assert.equal(map[15][16],'q');assert.ok(fieldPath(map,saved,{x:16,y:12}).length);assert.equal(fieldDialogue(saved).action,'bleu7Tm101');assert.notEqual(fieldDialogue({...saved,zaBleu7Tm101Claimed:true}).action,'bleu7Tm101');
 assert.equal(storyTm('za-tm101').move,'일렉트릭네트');
 const bag={'za-tm101':1};assert.equal(canLearnStoryTm(bag,makeMon(25,20),'za-tm101'),true);assert.equal(canLearnStoryTm(bag,makeMon(13,20),'za-tm101'),true);assert.equal(canLearnStoryTm(bag,makeMon(152,20),'za-tm101'),false);assert.equal(canLearnStoryTm({},makeMon(25,20),'za-tm101'),false);
 const alolan=makeMon(10100,20);assert.equal(alolan.speciesId,26);assert.equal(canLearnStoryTm(bag,alolan,'za-tm101'),true);
 const known={...makeMon(25,20),moves:['일렉트릭네트']};assert.equal(canLearnStoryTm(bag,known,'za-tm101'),false);
});

 test('TM101 supports reviewed additional species and forms without inferring regional variants',()=>{
 const bag={'za-tm101':1};
 for(const id of [587,604,618,694,695,849,877])assert.equal(canLearnStoryTm(bag,makeMon(id,20),'za-tm101'),true,`species ${id}`);
 for(const id of [10147,10184,10187,30075,30078])assert.equal(canLearnStoryTm(bag,makeMon(id,20),'za-tm101'),true,`form ${id}`);
 assert.equal(canLearnStoryTm(bag,makeMon(10180,20),'za-tm101'),false);
 assert.equal(canLearnStoryTm(bag,{...makeMon(10184,20),speciesId:25},'za-tm101'),false);
 assert.equal(canLearnStoryTm({},makeMon(694,20),'za-tm101'),false);
 });
