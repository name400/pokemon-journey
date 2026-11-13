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

test('vest adds blouse and ribbon while preserving hair, direction and old silhouettes',async()=>{
 const {equippedVernalTop,VERNAL_TOPS}=await import('../lib/cloud-adventure/adventure-clothing.mjs');
 assert.equal(equippedVernalTop({}),null);
 for(const top of VERNAL_TOPS){
  const s={zaClothingOwned:[top.id],zaClothingTop:top.id};assert.equal(equippedVernalTop(s).id,top.id);
  for(const style of ['classic','short','bob','long'])for(const face of ['up','down','left','right']){
   const old=adventureAvatarRows(face,style),vest=adventureAvatarRows(face,style,'vest');
   assert.equal(vest.length,14);assert.ok(vest.every(row=>row.length===12&&/^[.HRWSKBYDVLC]+$/.test(row)));
   assert.deepEqual(vest.slice(0,6),old.slice(0,6));assert.deepEqual(vest.slice(10),old.slice(10));
   for(let y=6;y<=9;y++)for(let x=0;x<12;x++)if(!['B','Y'].includes(old[y][x]))assert.equal(vest[y][x],old[y][x]);
   assert.ok(vest.slice(6,10).join('').includes('V'));assert.ok(vest.slice(6,10).join('').includes('L'));
   if(face==='down')assert.ok(vest.slice(6,10).join('').includes('C'));
   if(face==='right')assert.deepEqual(vest,adventureAvatarRows('left',style,'vest').map(row=>[...row].reverse().join('')));
  }
 }
 assert.deepEqual(adventureAvatarRows('down','classic','unknown'),adventureAvatarRows('down','classic'));
 assert.equal(equippedVernalTop({zaClothingTop:'bravely-vest-green'}),null);
});
