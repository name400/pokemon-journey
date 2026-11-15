import test from 'node:test';
import assert from 'node:assert/strict';
import {stepField} from '../lib/cloud-adventure/adventure-world.mjs';

test('Mission 22 stair transition preserves other approaches and existing stair positions',()=>{
 const s={area:3,district:'lumiose-bleu-cafe2',interior:null,x:16,y:5};
 assert.deepEqual(stepField(s,'right'),{x:17,y:5,area:3,tile:'s',transitioned:false});
 assert.deepEqual(stepField({...s,x:17},'down'),{x:17,y:6,area:3,tile:',',transitioned:false});
 assert.deepEqual(stepField({...s,x:17,y:6},'up'),{x:11,y:14,area:3,district:'lumiose-mission22-tunnel',zaMission22Entry:'cafe2',transitioned:true,tile:'s'});
});
