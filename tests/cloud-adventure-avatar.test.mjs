import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureAvatarRows} from '../lib/cloud-adventure/adventure-avatar.mjs';

test('field avatars distinguish facing and mirror their side view',()=>{
 const front=adventureAvatarRows('down'),back=adventureAvatarRows('up'),left=adventureAvatarRows('left'),right=adventureAvatarRows('right');
 for(const rows of [front,back,left,right]){assert.equal(rows.length,14);assert.ok(rows.every(row=>row.length===12&&/^[.RWSKBYD]+$/.test(row)));}
 assert.notDeepEqual(front,back);assert.notDeepEqual(front,left);assert.deepEqual(right,left.map(row=>[...row].reverse().join('')));assert.deepEqual(adventureAvatarRows('unknown'),front);
});

test('salon hair has four stable directions and keeps the old hat as fallback',async()=>{
 const {salonAppearance,validSalonStyle,SALON_STYLES,SALON_COLORS}=await import('../lib/cloud-adventure/adventure-salon.mjs');
 assert.deepEqual(salonAppearance({}),{style:'classic',color:'brown'});assert.equal(validSalonStyle('__proto__','brown'),false);assert.equal(validSalonStyle('bob','toString'),false);
 for(const style of Object.keys(SALON_STYLES))for(const color of Object.keys(SALON_COLORS)){
  assert.deepEqual(salonAppearance({zaSalonAppearance:{style,color}}),{style,color});
  for(const face of ['up','down','left','right']){const rows=adventureAvatarRows(face,style);assert.equal(rows.length,14);assert.ok(rows.every(row=>row.length===12&&/^[.HRWSKBYD]+$/.test(row)));}
  if(style!=='classic')assert.deepEqual(adventureAvatarRows('right',style),adventureAvatarRows('left',style).map(row=>[...row].reverse().join('')));
 }
 assert.deepEqual(adventureAvatarRows('down','invalid'),adventureAvatarRows('down'));
});
