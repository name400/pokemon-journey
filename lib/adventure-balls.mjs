import {BALLS,ballMultiplier} from './capture.mjs';

// Z-A's Autumnal Avenue boutique prices; sale availability is adventure-only.
const prices={greatball:300,quickball:1000,timerball:1000,netball:1000,duskball:1000,healball:300,luxuryball:3000};
export const ADVENTURE_BALLS=BALLS.map(ball=>({...ball,...(prices[ball.id]?{price:prices[ball.id]}:{}),...(ball.id==='quickball'?{description:'양쪽이 기술을 쓰기 전 3배'}:ball.id==='timerball'?{description:'기술 사용 횟수에 따라 최대 4배'}:{}),sale:ball.id==='pokeball'||Object.hasOwn(prices,ball.id)}));
export function adventureBall(id){return ADVENTURE_BALLS.find(ball=>ball.id===id);}

// The existing turn-based engine lacks Z-A's Royale ranks, overworld/backstrike,
// catch window and real-time state. Apply the documented Z-A modifiers and
// three independent checks only to the state the adventure engine can model.
export function adventureCaptureAttempt(mon,id,context={},rng=Math.random){
 const count=context.moveCount;
 if(['quickball','timerball'].includes(id)&&(!Number.isInteger(count)||count<0))throw Error('이전 전투에서는 퀵볼과 타이머볼을 사용할 수 없습니다. 전투를 마친 후 다시 시도하세요.');
 const mult=id==='quickball'?(count===0?3:1):id==='timerball'?Math.min(4,1+Math.floor(Math.max(0,count-1)/10)):ballMultiplier(id,{...context,types:mon.currentTypes||mon.types});
 const status=['얼음','frz','졸음','drowsy'].includes(mon.status)?1.5:['독','맹독','화상','마비','psn','tox','brn','par'].includes(mon.status)?1.2:1;
 if(!adventureBall(id))throw Error('볼 종류를 확인하세요.');
 if(id==='masterball')return {caught:true,shakes:4,multiplier:1,guaranteed:true};
 const baseRate=mon.captureRate||45,rate=baseRate===255?765:baseRate;
 const a=Math.max(0,(3*mon.maxHp-2*mon.hp)/(3*mon.maxHp)*rate*mult*status*(mon.shiny?3:1));
 const threshold=Math.max(0,Math.min(65536,65535-Math.floor(65536-(a+1)**2)));
 // Z-A performs three independent checks: any success catches the Pokémon.
 let caught=false;for(let i=0;i<3;i++)if(Math.floor(rng()*65536)<threshold)caught=true;
 return {caught,shakes:caught?4:3,multiplier:mult};
}
