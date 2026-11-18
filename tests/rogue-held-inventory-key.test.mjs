import test from 'node:test';
import assert from 'node:assert/strict';
import {classicModifierInventory} from '../lib/rogue-classic-rewards.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';

test('distinct held rows have unique view keys without changing stored records',()=>{
 const run={party:[makeReferenceMon(1,20,{boxId:'one'})],modifiers:[{id:'soothebell',boxId:'one',count:1,transferable:false},{id:'soothebell',boxId:'one',count:1},{id:'soothebell',boxId:'one',count:1,marker:'untouched'}]},before=structuredClone(run),items=classicModifierInventory(run).filter(x=>x.name==='평온의방울');
 assert.equal(items.length,3);assert.equal(new Set(items.map(i=>i.key)).size,3);for(const item of items)assert.ok(item.key.startsWith('modifier:soothebell:one:'));assert.deepEqual(run,before);
});
