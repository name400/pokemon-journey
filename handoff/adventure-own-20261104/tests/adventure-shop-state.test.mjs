import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeAdventureShopState,filterAdventureCatalog} from '../lib/adventure-shop-state.mjs';

test('partial purchases retain inventory and catalog while explicit updates replace them',()=>{
 const old={coins:500,inventory:{firestone:2},catalog:[{id:'firestone',name:'불꽃의돌',category:'evolution'}]};
 const next=mergeAdventureShopState(old,{coins:400,potions:1});assert.equal(next.coins,400);assert.deepEqual(next.inventory,{firestone:2});assert.equal(next.catalog,old.catalog);
 assert.deepEqual(mergeAdventureShopState(next,{inventory:{}}).inventory,{});
});
test('catalog search combines category and trimmed name without false extra results',()=>{
 const items=[{name:'불꽃의돌',category:'evolution'},{name:'불꽃열매',category:'berry'},{name:'물의돌',category:'evolution'}];
 assert.deepEqual(filterAdventureCatalog(items,'evolution',' 불꽃 '),[items[0]]);
 assert.deepEqual(filterAdventureCatalog(items,'berry','없는 물건'),[]);
});
