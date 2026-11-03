import test from 'node:test';import assert from 'node:assert/strict';import {adventureError,adventureRecoveryMessage,isUncertainRequestError} from '../lib/adventure-errors.mjs';
test('connection failures are understandable while server conflict and validation messages remain intact',()=>{
 assert.match(adventureError(new TypeError('Failed to fetch')),/연결/);
 assert.equal(adventureError(new Error('진행이 변경됐습니다. 다시 불러오세요.')),'진행이 변경됐습니다. 다시 불러오세요.');
 assert.equal(adventureError(null,'불러오기 실패'),'불러오기 실패');
 assert.match(adventureRecoveryMessage(true),/구매 결과를 확인/);assert.match(adventureRecoveryMessage(false),/저장 결과를 확인하지 못했습니다/);
 assert.equal(isUncertainRequestError(new SyntaxError('bad json')),true);assert.equal(isUncertainRequestError(new Error('거절')),false);
});
