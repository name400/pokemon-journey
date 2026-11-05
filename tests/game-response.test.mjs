import test from 'node:test';
import assert from 'node:assert/strict';
import {readGameResponse,GameResponseError,gameErrorMessage} from '../lib/game-response.mjs';
test('HTML Worker failures show a useful error without exposing HTML or repeating requests',async()=>{let calls=0;const response=new Response('<!DOCTYPE html><title>Worker exceeded memory limit</title>',{status:500,headers:{'Content-Type':'text/html'}}),original=response.text.bind(response);response.text=()=>{calls++;return original();};await assert.rejects(readGameResponse(response),/서버 오류/);assert.equal(calls,1);});
test('game JSON and server validation failures retain their contract',async()=>{assert.deepEqual(await readGameResponse(Response.json({revision:2,run:null})),{revision:2,run:null});await assert.rejects(readGameResponse(Response.json({error:'다른 화면에서 저장이 변경됐습니다.'},{status:409})),/저장이 변경/);for(const data of [null,[],3])await assert.rejects(readGameResponse(Response.json(data)),/서버 응답/);});
test('known error metadata survives parsing while the original message stays intact',async()=>{
 const message='다른 화면에서 저장이 변경됐습니다.',requestId='a1b2c3d4-1234-4567-8910-a1b2c3d4e5f6';
 await assert.rejects(readGameResponse(Response.json({error:message,code:'REVISION_CONFLICT',requestId},{status:409})),error=>{
  assert.ok(error instanceof GameResponseError);assert.equal(error.message,message);assert.equal(error.status,409);assert.equal(error.code,'REVISION_CONFLICT');assert.equal(error.requestId,requestId);assert.equal(gameErrorMessage(error),`${message} (오류 번호: ${requestId})`);return true;
 });
});
test('unrecognized metadata cannot inject arbitrary identifiers or codes into displayed diagnostics',async()=>{
 for(const requestId of ['private@example.com','secret-token','a1b2c3d4-1234-4567-8910-a1b2c3d4e5f6\nsecret',123,null])await assert.rejects(readGameResponse(Response.json({error:'실패',code:'private-account',requestId},{status:500})),error=>{assert.equal(error.code,undefined);assert.equal(error.requestId,undefined);assert.equal(gameErrorMessage(error),'실패');return true;});
 assert.equal(gameErrorMessage(Error('기존 오류')),'기존 오류');assert.equal(gameErrorMessage(null,'기본 안내'),'기본 안내');
});
