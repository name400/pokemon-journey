import test from 'node:test';
import assert from 'node:assert/strict';
import {zone7Unlocked} from '../lib/cloud-adventure/adventure-zone7.mjs';
import {zone11Unlocked} from '../lib/cloud-adventure/adventure-zone11.mjs';
import {zone14Unlocked} from '../lib/cloud-adventure/adventure-zone14.mjs';
import {zone16Unlocked} from '../lib/cloud-adventure/adventure-zone16.mjs';
import {zone17Unlocked} from '../lib/cloud-adventure/adventure-zone17.mjs';
import {zone18Unlocked} from '../lib/cloud-adventure/adventure-zone18.mjs';
import {zone19Unlocked} from '../lib/cloud-adventure/adventure-zone19.mjs';
import {stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('later story milestones preserve earlier wild-zone gates without unlocking later zones',()=>{
 const gates=[zone7Unlocked,zone11Unlocked,zone14Unlocked,zone16Unlocked,zone17Unlocked,zone18Unlocked,zone19Unlocked];
 const cases=[
  [{zaMission10Stage:1},[1,0,0,0,0,0,0]],
  [{zaMission15Complete:true},[1,1,0,0,0,0,0]],
  [{zaMission14Stage:12},[1,1,0,0,0,0,0]],
  [{zaMission20Started:true},[1,1,1,0,0,0,0]],
  [{zaMission19Stage:16},[1,1,1,0,0,0,0]],
  [{zaMission24Complete:true},[1,1,1,1,1,0,0]],
  [{zaMission31Started:true},[1,1,1,1,1,1,1]],
  [{zaMission38Complete:true},[1,1,1,1,1,1,1]],
 ];
 for(const [flags,expected] of cases){const saved={zaRoyaleRank:'V',...flags},before=structuredClone(saved);assert.deepEqual(gates.map(f=>Number(f(saved))),expected);assert.deepEqual(saved,before);}
 for(const f of gates){assert.equal(f(null),false);assert.equal(f({zaRoyaleRank:'V'}),false);}
});

test('Zone 17 and 18 entries restore later saves without moving an existing party',()=>{
 for(const [base,flags,direction,target] of [
  [{district:'lumiose-vert-street-route',x:20,y:1}, {zaMission24Complete:true},'up','lumiose-zone17'],
  [{district:'lumiose-magenta-sector9',x:21,y:12}, {zaMission31Started:true},'right','lumiose-zone18'],
 ]){
  const early={area:3,interior:null,zaRoyaleRank:'V',teamIds:['legacy'],...base};assert.equal(stepField(early,direction).blocked,true);
  const input={...early,...flags},step=stepField(input,direction);assert.equal(step.district,target);
  const restored=restoreAdventurePosition(storeAdventurePosition({...input,...step},9),9);assert.equal(restored.district,target);assert.deepEqual(restored.teamIds,['legacy']);assert.deepEqual([restored.x,restored.y],[step.x,step.y]);
 }
});
