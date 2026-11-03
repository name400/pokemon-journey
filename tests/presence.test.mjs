import assert from 'node:assert/strict';
import {recentPresence,PRESENCE_WINDOW_MS} from '../lib/presence.mjs';
const now=1_800_000_000_000;assert.equal(recentPresence(now,now),'recent');assert.equal(recentPresence(now-PRESENCE_WINDOW_MS,now),'recent');assert.equal(recentPresence(now-PRESENCE_WINDOW_MS-1,now),'unknown');for(const value of [null,undefined,0,-1,now+1,NaN,'123'])assert.equal(recentPresence(value,now),'unknown');
