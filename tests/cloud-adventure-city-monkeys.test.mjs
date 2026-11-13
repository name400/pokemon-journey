import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {evolutionOptions} from '../lib/evolution.mjs';
import {fieldMap,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {NORTH_MONKEY_TREES,northMonkeyTree} from '../lib/cloud-adventure/adventure-city-monkeys.mjs';

test('north street tree encounters are reachable without invalidating old positions and evolve with the matching stone',()=>{
 const state={district:'lumiose-north-boulevard',area:3,x:11,y:8,teamIds:['kept'],adventureDexSpecies:[152],zaResearchItemRewards:[10]};const map=fieldMap(state);
 for(const [index,tree] of NORTH_MONKEY_TREES.entries()){
  assert.equal(map[tree.y][tree.x],'^');assert.ok(fieldPath(map,state,{x:tree.x,y:1}).length);assert.equal(northMonkeyTree(state,{...tree,tile:'^'}).species,tree.species);
  const items=['leafstone','firestone','waterstone'];const option=evolutionOptions(makeMon(tree.species,18),{adventureEngine:'cloud'},[],{[items[index]]:1}).find(o=>o.id===tree.species+1);assert.equal(option.ready,true);assert.equal(option.consume.item,items[index]);
 }
 const saved=storeAdventurePosition(state,7);const restored=restoreAdventurePosition(saved,7);assert.deepEqual([restored.x,restored.y],[11,8]);assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.adventureDexSpecies,[152]);assert.deepEqual(restored.zaResearchItemRewards,[10]);
 assert.equal(northMonkeyTree({...state,interior:'hotel'},{x:4,y:0,tile:'^'}),null);
});
