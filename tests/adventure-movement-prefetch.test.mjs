import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {movementWorldSql} from '../lib/cloud-adventure/movement-prefetch.mjs';

test('movement prefetch selects only relevant owned Pokémon and retains legacy fallback',()=>{
 const db=new DatabaseSync(':memory:');
 try{
  db.exec('CREATE TABLE worlds(user_id TEXT PRIMARY KEY,state TEXT,revision INTEGER); CREATE TABLE pokemon_box(id TEXT,user_id TEXT,data TEXT,origin TEXT,created_at INTEGER)');
  const insert=db.prepare('INSERT INTO pokemon_box VALUES(?,?,?,?,?)');
  for(const [id,user,order] of [['lead','u',3],['teammate','u',2],['pending','u',1],['extra','u',4],['heracross','u',5],['unused','u',6],['foreign','other',0]])insert.run(id,user,JSON.stringify({name:id}),'test',order);
  const state={adventureEngine:'cloud',activeId:'lead',teamIds:['lead','teammate'],zaTradeHeracrossId:'heracross',adventurePendingMoves:[{boxId:'pending'},null,{boxId:123}]};
  const world=db.prepare('INSERT INTO worlds VALUES(?,?,?)');world.run('u',JSON.stringify(state),7);
  const query=db.prepare(movementWorldSql),row=query.get(JSON.stringify(['extra','foreign']),'u');
  assert.equal(row.revision,7);assert.deepEqual(JSON.parse(row.movement_box).map(p=>p.id),['pending','teammate','lead','extra','heracross']);
  db.prepare('UPDATE worlds SET state=? WHERE user_id=?').run(JSON.stringify({...state,adventureEngine:'local'}),'u');
  assert.equal(query.get('[]','u').movement_box,null);
  db.prepare('UPDATE worlds SET state=? WHERE user_id=?').run(JSON.stringify({...state,teamIds:'legacy-invalid'}),'u');
  assert.equal(query.get('[]','u').movement_box,null);
 }finally{db.close();}
});
