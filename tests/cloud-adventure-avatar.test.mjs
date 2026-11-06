import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureAvatarRows} from '../lib/cloud-adventure/adventure-avatar.mjs';

test('field avatars distinguish facing and mirror their side view',()=>{
 const front=adventureAvatarRows('down'),back=adventureAvatarRows('up'),left=adventureAvatarRows('left'),right=adventureAvatarRows('right');
 for(const rows of [front,back,left,right]){assert.equal(rows.length,14);assert.ok(rows.every(row=>row.length===12&&/^[.RWSKBYD]+$/.test(row)));}
 assert.notDeepEqual(front,back);assert.notDeepEqual(front,left);assert.deepEqual(right,left.map(row=>[...row].reverse().join('')));assert.deepEqual(adventureAvatarRows('unknown'),front);
});
