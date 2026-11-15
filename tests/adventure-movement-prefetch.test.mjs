import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {spawnSync} from 'node:child_process';
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
  insert.run('slowpoke','u',JSON.stringify({name:'slowpoke'}),'test',7);insert.run('galar','u',JSON.stringify({name:'galar'}),'test',8);
  db.prepare('UPDATE worlds SET state=? WHERE user_id=?').run(JSON.stringify({...state,teamIds:['slowpoke'],activeId:'slowpoke',zaTradedSlowpokeId:'slowpoke',zaSide39ReceivedId:'galar'}),'u');
  const recovered=JSON.parse(query.get('[]','u').movement_box).map(p=>p.id);assert.ok(recovered.includes('slowpoke'));assert.ok(recovered.includes('galar'));
  db.prepare('UPDATE worlds SET state=? WHERE user_id=?').run(JSON.stringify({...state,adventureEngine:'local'}),'u');
  assert.equal(query.get('[]','u').movement_box,null);
  db.prepare('UPDATE worlds SET state=? WHERE user_id=?').run(JSON.stringify({...state,teamIds:'legacy-invalid'}),'u');
  assert.equal(query.get('[]','u').movement_box,null);
 }finally{db.close();}
});

test('movement prefetch works under a three-term SQLite compound SELECT limit',()=>{
 const script=`import json, sqlite3, sys
sql=json.load(sys.stdin)
db=sqlite3.connect(':memory:')
db.setlimit(sqlite3.SQLITE_LIMIT_COMPOUND_SELECT,3)
try:
 db.execute('SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4')
 raise AssertionError('compound SELECT limit not enforced')
except sqlite3.OperationalError as e:
 assert 'too many terms in compound SELECT' in str(e)
db.executescript('CREATE TABLE worlds(user_id TEXT PRIMARY KEY,state TEXT,revision INTEGER); CREATE TABLE pokemon_box(id TEXT,user_id TEXT,data TEXT,origin TEXT,created_at INTEGER);')
state={'adventureEngine':'cloud','teamIds':['lead'],'activeId':'lead','zaSide108ReceivedId':'gift','adventurePendingMoves':[{'boxId':'pending'},None]}
db.execute('INSERT INTO worlds VALUES(?,?,?)',('u',json.dumps(state),4))
for i,name in enumerate(['lead','gift','pending','extra']): db.execute('INSERT INTO pokemon_box VALUES(?,?,?,?,?)',(name,'u','{}','test',i))
db.execute('INSERT INTO pokemon_box VALUES(?,?,?,?,?)',('foreign','other','{}','test',4))
row=db.execute(sql,(json.dumps(['extra','foreign']),'u')).fetchone()
assert row[1]==4
assert [x['id'] for x in json.loads(row[2])]==['lead','gift','pending','extra']
`;
 const run=spawnSync('python3',['-c',script],{input:JSON.stringify(movementWorldSql),encoding:'utf8'});
 assert.equal(run.status,0,run.stderr||run.error?.message);
});
