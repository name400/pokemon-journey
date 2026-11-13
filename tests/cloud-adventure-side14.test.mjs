import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {evolutionOptions} from '../lib/evolution.mjs';
import {fieldMap,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {BLEU5_MARKET_POKEMON,bleu5MarketPokemon,side14Available,side14Spot} from '../lib/cloud-adventure/adventure-side14.mjs';

test('market encounters and cafe quest retain legacy coordinates and require their matching held trade items',()=>{
 const market={district:'lumiose-bleu-sector5',area:3,x:10,y:8,teamIds:['kept'],adventureDexSpecies:[152]};const map=fieldMap(market);
 for(const p of BLEU5_MARKET_POKEMON){assert.equal(map[p.y][p.x],'^');assert.ok(fieldPath(map,market,{x:p.x,y:2}).length);assert.equal(bleu5MarketPokemon(market,{...p,tile:'^'}).species,p.species);}
 const old=storeAdventurePosition(market,8),restored=restoreAdventurePosition(old,8);assert.deepEqual([restored.x,restored.y],[10,8]);assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.adventureDexSpecies,[152]);
 const street={district:'lumiose-south-boulevard',zaMission07Started:true,area:3,x:11,y:8};const m=fieldMap(street);for(const [x,name] of [[12,'meuse'],[17,'soleil']]){assert.equal(m[5][x],'^');assert.ok(fieldPath(m,street,{x,y:6}).length);assert.equal(side14Spot(street,{tile:'^',x,y:5}),name);}assert.equal(side14Available({zaRoyaleRank:'Y'}),false);assert.equal(side14Available(street),true);
 for(const [species,item] of [[682,'sachet'],[684,'whippeddream']]){const mon={...makeMon(species,20),item,tradeCount:1},option=evolutionOptions(mon,{adventureEngine:'cloud'},[],{}).find(o=>o.id===species+1);assert.equal(option.ready,true);assert.equal(option.held,item);assert.equal(evolutionOptions({...mon,tradeCount:0},{adventureEngine:'cloud'},[],{}).find(o=>o.id===species+1).ready,false);}
});
