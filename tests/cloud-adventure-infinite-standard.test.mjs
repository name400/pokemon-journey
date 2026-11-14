import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {fieldMap,fieldDialogue,cloudNpcTile} from '../lib/cloud-adventure/adventure-world.mjs';
import {INFINITE_TRAINERS,INFINITE_EXTRA_POSITIONS,infiniteWins} from '../lib/cloud-adventure/adventure-infinite-royale.mjs';

test('additional standard opponents have valid teams and distinct accessible positions',()=>{
 const base={area:3,district:'lumiose-royale',interior:null,zaRoyaleRank:'A',zaMission39Started:true};const map=fieldMap(base);
 assert.equal(INFINITE_EXTRA_POSITIONS.length,8);
 for(const [i,[tile,x,y]] of INFINITE_EXTRA_POSITIONS.entries()){
  const t=INFINITE_TRAINERS[i+3];assert.equal(map[y][x],tile);assert.equal(cloudNpcTile(tile,base),true);assert.equal(t.team.length,t.moves.length);assert.ok(t.moves.flat().every(m=>Dex.moves.get(m).exists),t.id);
  const s={...base,x,y:y+1,facing:'up'};assert.equal(fieldDialogue(s).action,`royaleInfiniteExtra${i+3}`);assert.equal(fieldDialogue({...s,zaInfiniteSessionWins:[t.id]}).action,i===7?'royaleInfiniteHeal':undefined);
 }
 assert.deepEqual(infiniteWins({...base,zaInfiniteSessionWins:[INFINITE_TRAINERS[3].id,INFINITE_TRAINERS[3].id,'unknown']}),[INFINITE_TRAINERS[3].id]);
 assert.equal(fieldMap({...base,zaMission39Started:false})[5][3],'.');
});

test('facing a Royal trainer takes priority over a card underfoot',()=>{
 const base={area:3,district:'lumiose-royale',interior:null,zaRoyaleRank:'A',zaMission39Started:true,x:9,y:12,facing:'up'};
 const map=fieldMap(base);assert.equal(map[12][9],'!');assert.equal(map[11][9],'j');assert.equal(fieldDialogue(base,map).action,'royaleInfiniteExtra7');
 assert.equal(fieldDialogue({...base,facing:'down'},map).action,'takeRoyaleBonus');
 const after={...base,zaInfiniteSessionWins:[INFINITE_TRAINERS[7].id]};assert.equal(fieldDialogue(after).action,undefined);assert.equal(fieldDialogue({...after,facing:'down'}).action,'takeRoyaleBonus');
});

test('reward streak selects the documented trainer group and levels at the provisional boundaries',async()=>{
 const {newInfiniteFieldTier,infiniteFieldTier,infiniteFieldTrainer,infiniteWins,INFINITE_ALTERNATE_TRAINERS}=await import('../lib/cloud-adventure/adventure-infinite-royale.mjs');
 for(const [streak,tier] of [[0,0],[5,0],[6,1],[9,1],[10,2],[19,2],[20,3],[100,3]])assert.equal(newInfiniteFieldTier({zaInfiniteRewardStreak:streak}),tier);
 assert.equal(newInfiniteFieldTier({zaInfiniteRewardWins:14,zaInfiniteSecondWon:true}),2);assert.equal(newInfiniteFieldTier({zaInfiniteRewardStreak:0,zaInfiniteRewardWins:14}),0);
 for(const [tier,first,level] of [[0,'infinite-standard-axel',56],[1,'infinite-standard-marcel',60],[2,'infinite-standard-axel',61],[3,'infinite-standard-marcel',65]]){
  const s={zaInfiniteFieldTier:tier,zaInfiniteRewardStreak:0},firstTrainer=infiniteFieldTrainer(s,3);assert.equal(infiniteFieldTier(s),tier);assert.equal(firstTrainer.id,first);assert.equal(firstTrainer.team[0][1],level);
  for(let index=3;index<=10;index++){const t=infiniteFieldTrainer(s,index);assert.equal(t.moves.length,t.team.length);assert.ok(t.moves.flat().every(m=>Dex.moves.get(m).exists),t.id);}
 }
 assert.deepEqual(infiniteFieldTrainer({zaInfiniteFieldTier:2},5).moves[1],['bodyslam','outrage','focusenergy','closecombat']);assert.deepEqual(infiniteFieldTrainer({zaInfiniteFieldTier:3},8).moves[1],['dig','stoneedge','doubleedge','headsmash']);assert.deepEqual(infiniteFieldTrainer({zaInfiniteFieldTier:0},5).moves[1],['crunch','bodyslam','outrage','focusenergy']);
 const old={zaInfiniteRewardStreak:6,zaInfiniteSessionWins:[INFINITE_ALTERNATE_TRAINERS[0].id]};assert.deepEqual(infiniteWins(old),[INFINITE_ALTERNATE_TRAINERS[0].id]);assert.equal(infiniteFieldTrainer({...old,zaInfiniteFieldTier:1,zaInfiniteRewardStreak:0},3).id,'infinite-standard-marcel');assert.equal(infiniteFieldTrainer(old,2),null);
});
