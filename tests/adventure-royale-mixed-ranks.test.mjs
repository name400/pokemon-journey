import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue} from '../lib/cloud-adventure/adventure-world.mjs';
import {royaleMixedTrainer,ROYALE_MIXED_POSITIONS} from '../lib/cloud-adventure/adventure-royale.mjs';
test('adjacent-rank opponents are reachable and never overwrite a saved position',()=>{
 for(const [rank,expected] of [['X',[['Y',400],['W',500]]],['W',[['X',450],['V',550]]]])for(const [tile,x,y,index] of ROYALE_MIXED_POSITIONS){
  const other=royaleMixedTrainer(rank,index);assert.deepEqual([other.opponentRank,other.points],expected[index]);const s={area:3,district:'lumiose-royale',interior:null,zaRoyaleRank:rank,zaNaveenComplete:true,zaLidaStage:2,x:11,y:14,facing:'up'},map=fieldMap(s);assert.equal(map[y][x],tile);assert.ok(fieldPath(map,s,{x,y:y-1}).length);const at={...s,x,y:y-1,facing:'down'};assert.equal(fieldDialogue(at,fieldMap(at)).action,`royaleMixed-${index}`);assert.equal(fieldMap({...s,x,y})[y][x],'.');
 }
 assert.equal(royaleMixedTrainer('Y',0),null);assert.equal(royaleMixedTrainer('V',1),null);
});
