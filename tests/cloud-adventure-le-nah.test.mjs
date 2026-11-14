import test from 'node:test';
import assert from 'node:assert/strict';
import {leNahAvailable,leNahCourse,leNahMap,LE_NAH_COURSE_COUNT} from '../lib/cloud-adventure/adventure-le-nah.mjs';

test('Le Nah unlock and course opponents match the documented one-star mission',()=>{
 assert.equal(leNahAvailable({zaMission10Stage:9,zaRoyaleRank:'F'}),false);
 assert.equal(leNahAvailable({zaMission10Stage:10,zaRoyaleRank:'F'}),true);
 assert.equal(leNahAvailable({zaMission10Complete:true}),true);
 assert.equal(leNahAvailable({zaRoyaleRank:'A'}),true);
 assert.equal(leNahAvailable({zaRoyaleRank:'S'}),true);
 assert.equal(LE_NAH_COURSE_COUNT,3);
 const expected=[['Audrey',[511,672],'occaberry'],['Thomas',[515,318],'rindoberry'],['Thierry',[513,667],'passhoberry']];
 for(let i=0;i<expected.length;i++){
  const course=leNahCourse(i),[name,species,item]=expected[i];
  assert.equal(course.name,name);assert.deepEqual(course.team.map(m=>m.speciesId),species);
  assert.ok(course.team.every(m=>m.level===30&&m.item===item&&m.moves.length===4));
  assert.equal(new Set(course.team.map(m=>m.boxId)).size,2);
 }
 assert.throws(()=>leNahCourse(3));
});

test('existing restaurant entrance and promotion counter are preserved',()=>{
 const map=leNahMap();assert.equal(map.length,17);assert.equal(map[16][11],'X');assert.equal(map[5][11],'R');
});
