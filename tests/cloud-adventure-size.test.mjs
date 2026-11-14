import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {evolveAdventurePokemon} from '../lib/cloud-adventure/adventure-evolution.mjs';
import {adventurePokemonSize,assignAdventureCapturedSize} from '../lib/cloud-adventure/adventure-size.mjs';
import {side63Eligible} from '../lib/cloud-adventure/adventure-side63.mjs';

test('size brackets and alpha are distinct; old and future data are not invented',()=>{
 const m=makeMon(673,40);
 for(const [scale,size] of [[0,'XS'],[15,'XS'],[16,'S'],[47,'S'],[48,'M'],[207,'M'],[208,'L'],[239,'L'],[240,'XL'],[255,'XL']])assert.equal(adventurePokemonSize({...m,adventureScaleV1:{version:1,scale}}),size);
 for(const v of [undefined,null,{version:2,scale:250},{version:1,scale:256},{version:1,scale:240,other:true}])assert.equal(adventurePokemonSize({...m,adventureScaleV1:v}),null);
 assert.equal(adventurePokemonSize({...m,adventureAlpha:true}),'XL');assert.equal(side63Eligible({...m,adventureAlpha:true}),true);assert.equal(side63Eligible({...m,adventureScaleV1:{version:1,scale:240}}),true);assert.equal(side63Eligible({...m,adventureScaleV1:{version:1,scale:239}}),false);
});

test('newly captured selected families roll once and keep their size through evolution',()=>{
 const nums=[.999,.999],baby=assignAdventureCapturedSize(makeMon(672,32),()=>nums.shift());assert.equal(baby.adventureScaleV1.scale,255);assert.equal(nums.length,0);
 const evolved=evolveAdventurePokemon({...baby,boxId:'own'},673);assert.equal(side63Eligible(evolved),true);assert.deepEqual(evolved.adventureScaleV1,baby.adventureScaleV1);
 for(const m of [{...baby,adventureScaleV1:{version:2,scale:240}},makeMon(25,10),{...makeMon(672,10),adventureAlpha:true}])assert.strictEqual(assignAdventureCapturedSize(m,()=>{throw Error('unexpected size roll');}),m);
 assert.throws(()=>assignAdventureCapturedSize(makeMon(712,20),()=>1));
});
