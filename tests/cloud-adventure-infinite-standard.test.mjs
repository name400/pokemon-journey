import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {fieldMap,fieldDialogue,cloudNpcTile} from '../lib/cloud-adventure/adventure-world.mjs';
import {INFINITE_TRAINERS,INFINITE_EXTRA_POSITIONS,infiniteWins} from '../lib/cloud-adventure/adventure-infinite-royale.mjs';

test('additional standard opponents have valid teams and distinct accessible positions',()=>{
 const base={area:3,district:'lumiose-royale',interior:null,zaRoyaleRank:'A',zaMission39Started:true};const map=fieldMap(base);
 assert.equal(INFINITE_EXTRA_POSITIONS.length,7);
 for(const [i,[tile,x,y]] of INFINITE_EXTRA_POSITIONS.entries()){
  const t=INFINITE_TRAINERS[i+3];assert.equal(map[y][x],tile);assert.equal(cloudNpcTile(tile,base),true);assert.equal(t.team.length,t.moves.length);assert.ok(t.moves.flat().every(m=>Dex.moves.get(m).exists),t.id);
  const s={...base,x,y:y+1,facing:'up'};assert.equal(fieldDialogue(s).action,`royaleInfiniteExtra${i+3}`);assert.equal(fieldDialogue({...s,zaInfiniteSessionWins:[t.id]}).action,undefined);
 }
 assert.deepEqual(infiniteWins({...base,zaInfiniteSessionWins:[INFINITE_TRAINERS[3].id,INFINITE_TRAINERS[3].id,'unknown']}),[INFINITE_TRAINERS[3].id]);
 assert.equal(fieldMap({...base,zaMission39Started:false})[5][3],'.');
});
