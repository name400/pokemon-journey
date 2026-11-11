import {BALLS,ballMultiplier} from '../capture.mjs';

// Z-A's Autumnal Avenue boutique prices; sale availability is adventure-only.
const prices={greatball:300,quickball:1000,timerball:1000,netball:1000,duskball:1000,healball:300,luxuryball:3000};
export const RARE_ADVENTURE_BALL_IDS=['fastball','levelball','lureball','heavyball','loveball','friendball','moonball'];
const rare=[['fastball','스피드볼','fast-ball','기초 스피드 100 이상에 4배'],['levelball','레벨볼','level-ball','내 포켓몬과 레벨 차이에 따라 최대 8배'],['lureball','루어볼','lure-ball','물 위나 물속의 포켓몬에 3.5배'],['heavyball','헤비볼','heavy-ball','대상의 몸무게에 따라 포획률 변화'],['loveball','러브러브볼','love-ball','같은 종의 반대 성별에 8배'],['friendball','프렌드볼','friend-ball','포획 후 친밀도 150'],['moonball','문볼','moon-ball','달의돌로 진화하는 포켓몬에 4배']].map(([id,name,sprite,description])=>({id,name,sprite,description,image:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${sprite}.png`}));
export const ADVENTURE_BALLS=[...BALLS,...rare].map(ball=>({...ball,...(prices[ball.id]?{price:prices[ball.id]}:{}),...(ball.id==='quickball'?{description:'양쪽이 기술을 쓰기 전 3배'}:ball.id==='timerball'?{description:'기술 사용 횟수에 따라 최대 4배'}:{}),sale:ball.id==='pokeball'||Object.hasOwn(prices,ball.id)}));
export function adventureBall(id){return ADVENTURE_BALLS.find(ball=>ball.id===id);}

// The existing turn-based engine lacks Z-A's Royale ranks, overworld/backstrike,
// catch window and real-time state. Apply the documented Z-A modifiers and
// three independent checks only to the state the adventure engine can model.
export function adventureCaptureAttempt(mon,id,context={},rng=Math.random){
 const count=context.moveCount;
 if(['quickball','timerball'].includes(id)&&(!Number.isInteger(count)||count<0))throw Error('이전 전투에서는 퀵볼과 타이머볼을 사용할 수 없습니다. 전투를 마친 후 다시 시도하세요.');
 const mult=context.rareMultiplier??(id==='quickball'?(count===0?3:1):id==='timerball'?Math.min(4,1+Math.floor(Math.max(0,count-1)/10)):ballMultiplier(id,{...context,types:mon.currentTypes||mon.types}));
 // Turn-based battles represent Z-A's drowsiness analogue as sleep.
 const status=context.catchWindow===true?(context.alpha===true?3:1.2):['얼음','frz','졸음','drowsy','잠듦','slp'].includes(mon.status)?1.5:['독','맹독','화상','마비','psn','tox','brn','par'].includes(mon.status)?1.2:1;
 if(!adventureBall(id))throw Error('볼 종류를 확인하세요.');
 if(id==='masterball')return {caught:true,shakes:4,multiplier:1,guaranteed:true};
 const baseRate=context.rareBaseRate??adventureCaptureRate(mon),rate=baseRate===255?765:baseRate;
 const a=Math.max(0,(3*mon.maxHp-2*mon.hp)/(3*mon.maxHp)*rate*mult*status*(mon.shiny?3:1)*(context.alpha===true?.5:1)*(context.catchWindow!==true&&context.overworld===true&&context.unaware===true?1.5:1)*(context.catchWindow!==true&&context.overworld===true&&context.backstrike===true?2:1)*adventureRankPenalty(context.royaleRank,mon.level));
 const threshold=Math.max(0,Math.min(65536,65535-Math.floor(65536-(a+1)**2)));
 // Z-A performs three independent checks: any success catches the Pokémon.
 let caught=false;for(let i=0;i<3;i++)if(Math.floor(rng()*65536)<threshold)caught=true;
 return {caught,shakes:caught?4:3,multiplier:mult};
}

// Verified Z-A species-specific changes, keyed by National Pokédex number.
// Source: https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_catch_rate
const ZA_RATES=new Map([
 ...[150,374,375,376,719,900].map(id=>[id,20]),
 ...[380,381,382,383,384,485,491,638,639,640,647,648,649,720,721,801,802,807,808,809].map(id=>[id,45]),
 [718,255]
]);
export function adventureCaptureRate(mon){return ZA_RATES.get(mon.speciesId)??mon.captureRate??45;}

// No rank is invented for older adventure saves; the future Royale system must
// explicitly persist a Z-A rank before the corresponding penalty is applied.
export function adventureRankPenalty(rank,level){
 if(typeof rank!=='string'||!/^[A-Z]$/.test(rank)||!Number.isFinite(level)||level<1)return 1;
 const rows={Z:[1,.7,.5,.3,.1,.1,.1,.1,.1],Y:[1,.7,.5,.3,.1,.1,.1,.1,.1],X:[1,1,.7,.5,.3,.1,.1,.1,.1],W:[1,1,1,.7,.5,.3,.1,.1,.1],V:[1,1,1,1,.7,.5,.3,.1,.1],F:[1,1,1,1,.7,.5,.3,.1,.1],E:[1,1,1,1,1,.7,.5,.3,.1],D:[1,1,1,1,1,1,.7,.5,.3],C:[1,1,1,1,1,1,1,.7,.5],B:[1,1,1,1,1,1,1,1,.7],A:[1,1,1,1,1,1,1,1,1]};
 const group=rank>='G'&&rank<='U'?'V':rank,index=[15,20,25,30,40,45,50,65,100].findIndex(max=>level<=max);
 return rows[group]?.[index]??1;
}
