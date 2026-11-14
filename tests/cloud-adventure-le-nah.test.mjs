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

test('Substitute TM requires ownership and only accepts reviewed base species',async()=>{
 const {makeMon}=await import('../lib/game.mjs');
 const {canLearnStoryTm}=await import('../lib/cloud-adventure/adventure-story-tm.mjs');
 const bulbasaur=makeMon(1,30),unsupported=makeMon(129,30);
 assert.equal(canLearnStoryTm({},bulbasaur,'za-tm085'),false);
 assert.equal(canLearnStoryTm({'za-tm085':1},bulbasaur,'za-tm085'),true);
 assert.equal(canLearnStoryTm({'za-tm085':1},unsupported,'za-tm085'),false);
 for(const id of [133,700,172,280,475,650,653,656,447,448,10100])assert.equal(canLearnStoryTm({'za-tm085':1},makeMon(id,30),'za-tm085'),true,`species ${id}`);
 const alola=makeMon(10100,30);assert.equal(canLearnStoryTm({'za-tm085':1},{...alola,speciesId:25},'za-tm085'),false);
 assert.equal(canLearnStoryTm({'za-tm085':1},{...bulbasaur,id:10001},'za-tm085'),false);
 assert.equal(canLearnStoryTm({'za-tm085':1},{...bulbasaur,moves:['대타출동']},'za-tm085'),false);
});

test('TM085 supports reviewed important base species without inferring form identity',async()=>{
 const {makeMon}=await import('../lib/game.mjs');const {canLearnStoryTm}=await import('../lib/cloud-adventure/adventure-story-tm.mjs');
 const bag={'za-tm085':1},added=[150,199,208,212,214,227,228,229,233,246,247,248,302,303,304,305,306,307,308,309,310,318,319,322,323,333,334];
 for(const id of added)assert.equal(canLearnStoryTm(bag,{...makeMon(id,30),moves:[]},'za-tm085'),true,`base ${id}`);
 for(const mon of [{id:129,speciesId:129,moves:[]},{id:10043,speciesId:150,moves:[]},{id:99999,speciesId:247,moves:[]},{id:247,speciesId:248,moves:[]}])assert.equal(canLearnStoryTm(bag,mon,'za-tm085'),false);
 assert.equal(canLearnStoryTm({}, {...makeMon(247,30),moves:[]},'za-tm085'),false);assert.equal(canLearnStoryTm(bag,{...makeMon(247,30),moves:['대타출동']},'za-tm085'),false);
});
