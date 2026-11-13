import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {rareBallContext,rareBallModifier} from '../lib/cloud-adventure/adventure-rare-balls.mjs';

const modifier=(target,lead)=>rareBallModifier('loveball',target,rareBallContext(target,lead));
test('Love Ball resolves old saved species and never treats unknown species as a match',()=>{
 const pikachu={...makeMon(25,20),gender:'F'},male={...makeMon(25,20),gender:'M'},raichu={...makeMon(26,20),gender:'M'};
 const legacy=p=>{const result={...p};delete result.speciesId;return result;};
 assert.equal(modifier(pikachu,male),8);
 assert.equal(modifier(legacy(pikachu),legacy(male)),8);
 assert.equal(modifier(legacy(pikachu),legacy(raichu)),1);
 assert.equal(modifier(pikachu,legacy(male)),8);
 assert.equal(modifier(legacy(pikachu),male),8);
 const unknown={id:999999,gender:'F',hp:1,level:20},other={id:999998,gender:'M',hp:1,level:20};
 assert.equal(modifier(unknown,other),1);
 assert.equal(modifier(unknown,{...other,id:999999}),1);
 assert.equal(modifier(pikachu,{...male,hp:0}),1);
 assert.equal(modifier(pikachu,{...male,gender:'N'}),1);
 const before=legacy(male);const copy=structuredClone(before);modifier(legacy(pikachu),before);assert.deepEqual(before,copy);
});

test('Love Ball compares species across known form IDs rather than treating forms as separate species',()=>{
 const galar={...makeMon(10180,30),gender:'M'},unova={...makeMon(618,30),gender:'F'};
 delete galar.speciesId;delete unova.speciesId;
 assert.equal(modifier(unova,galar),8);
});
