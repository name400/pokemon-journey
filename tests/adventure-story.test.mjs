import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureStory} from '../lib/adventure-story.mjs';

test('MZ story and practice remain visible from existing progress without resetting it',()=>{
 const base={citySurvey:10,badges:['brock'],pcCityArena:{rank:3,points:1,wins:10}};
 assert.equal(adventureStory(base).some(chapter=>chapter.id==='mz-team'),false);
 const saved={...base,citySurvey:11,pcMZLida:1},before=JSON.stringify(saved),chapters=adventureStory(saved);
 assert.equal(chapters.find(chapter=>chapter.id==='mz-team').title,'MZ단과 함께');
 assert.match(chapters.find(chapter=>chapter.id==='mz-team').text,/가이/);
 assert.match(adventureStory({...saved,pcMZRival:'tani'}).find(chapter=>chapter.id==='mz-team').text,/타니/);
 assert.match(chapters.find(chapter=>chapter.id==='mz-lida').goal,/결과/);
 assert.equal(JSON.stringify(saved),before);
 assert.match(adventureStory({...saved,pcMZLida:2}).find(chapter=>chapter.id==='mz-lida').goal,/완료/);
 assert.match(adventureStory(saved).find(chapter=>chapter.id==='mz-naveen').goal,/의뢰/);
 assert.match(adventureStory({...saved,pcMZNaveen:1}).find(chapter=>chapter.id==='mz-naveen').goal,/곤율랭/);
 assert.match(adventureStory({...saved,pcMZNaveen:2}).find(chapter=>chapter.id==='mz-naveen').goal,/이야기/);
 assert.match(adventureStory({...saved,pcMZNaveen:3}).find(chapter=>chapter.id==='mz-naveen').goal,/완료/);
});
