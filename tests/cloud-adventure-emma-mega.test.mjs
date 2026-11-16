import test from 'node:test';
import assert from 'node:assert/strict';
import {emmaMegaSceneStep} from '../lib/cloud-adventure/adventure-emma-mega.mjs';

test('Emma scene accepts only known resumable state without consuming unknown saves',()=>{
 const base={district:'lumiose-bureau',zaEmmaBattleComplete:true};
 for(const step of [1,2,3])assert.equal(emmaMegaSceneStep({...base,zaEmmaMegaSceneV1:{version:1,step}}),step);
 for(const marker of [{version:2,step:1},{version:1,step:4},{version:1,step:1,extra:true},null]){const save={...base,zaEmmaMegaSceneV1:marker},before=structuredClone(save);assert.equal(emmaMegaSceneStep(save),null);assert.deepEqual(save,before);}
 assert.equal(emmaMegaSceneStep({...base,zaEmmaMegaSeen:true,zaEmmaMegaSceneV1:{version:1,step:1}}),null);
 assert.equal(emmaMegaSceneStep({...base,combat:{},zaEmmaMegaSceneV1:{version:1,step:1}}),null);
});
