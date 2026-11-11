import {royaleVPoints} from './adventure-royale.mjs';
import {rankFPoints} from './adventure-rank-e.mjs';
import {rankEPoints} from './adventure-rank-d.mjs';
import {rankDPoints} from './adventure-rank-c.mjs';
import {rankCPoints} from './adventure-rank-b.mjs';
import {rankBPoints} from './adventure-rank-a.mjs';
import {infinitePoints} from './adventure-infinite-royale.mjs';

// Reuse the battle engine's saved counters; show them only when that phase is active.
export function laterRoyaleProgress(w){
 let points,goal;
 if(w.zaRoyaleRank==='V'&&w.zaMission10Stage===4)[points,goal]=[royaleVPoints(w),6000];
 else if(w.zaRoyaleRank==='F'&&w.zaMission14Stage===1)[points,goal]=[rankFPoints(w),32000];
 else if(w.zaRoyaleRank==='E'&&w.zaMission19Stage===1)[points,goal]=[rankEPoints(w),35000];
 else if(w.zaRoyaleRank==='D'&&w.zaMission20Complete&&!w.zaMission24Complete)[points,goal]=[rankDPoints(w),38000];
 else if(w.zaRoyaleRank==='C'&&w.zaMission30Started&&!w.zaMission30Complete)[points,goal]=[rankCPoints(w),41000];
 else if(w.zaRoyaleRank==='B'&&w.zaMission35Started&&w.zaMission35Stage===7)[points,goal]=[rankBPoints(w),45000];
 else if(w.zaRoyaleRank==='A'&&w.zaMission39Started)[points,goal]=[infinitePoints(w),50000];
 else return null;
 return {points,goal};
}
