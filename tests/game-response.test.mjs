import test from 'node:test';
import assert from 'node:assert/strict';
import {readGameResponse} from '../lib/game-response.mjs';
test('HTML Worker failures show a useful error without exposing HTML or repeating requests',async()=>{let calls=0;const response=new Response('<!DOCTYPE html><title>Worker exceeded memory limit</title>',{status:500,headers:{'Content-Type':'text/html'}}),original=response.text.bind(response);response.text=()=>{calls++;return original();};await assert.rejects(readGameResponse(response),/서버 오류/);assert.equal(calls,1);});
test('game JSON and server validation failures retain their contract',async()=>{assert.deepEqual(await readGameResponse(Response.json({revision:2,run:null})),{revision:2,run:null});await assert.rejects(readGameResponse(Response.json({error:'다른 화면에서 저장이 변경됐습니다.'},{status:409})),/저장이 변경/);for(const data of [null,[],3])await assert.rejects(readGameResponse(Response.json(data)),/서버 응답/);});
