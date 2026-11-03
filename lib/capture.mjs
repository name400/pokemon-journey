const itemRoot='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/';
export const BALLS=[
 {id:'pokeball',name:'몬스터볼',sprite:'poke-ball',price:100,description:'기본 포획 성능. 1배'},
 {id:'greatball',name:'슈퍼볼',sprite:'great-ball',price:300,description:'몬스터볼의 1.5배 포획 성능'},
 {id:'ultraball',name:'하이퍼볼',sprite:'ultra-ball',price:600,description:'몬스터볼의 2배 포획 성능'},
 {id:'quickball',name:'퀵볼',sprite:'quick-ball',price:900,description:'배틀 첫 턴에 5배, 이후 1배'},
 {id:'timerball',name:'타이머볼',sprite:'timer-ball',price:800,description:'배틀이 길어질수록 강해져 최대 4배'},
 {id:'netball',name:'네트볼',sprite:'net-ball',price:700,description:'현재 물·벌레 타입에게 3.5배'},
 {id:'duskball',name:'다크볼',sprite:'dusk-ball',price:700,description:'밤 또는 동굴에서 3배'},
 {id:'healball',name:'힐볼',sprite:'heal-ball',price:250,description:'기본 성능. 포획한 포켓몬의 HP·PP·상태 회복'},
 {id:'luxuryball',name:'럭셔리볼',sprite:'luxury-ball',price:1000,description:'기본 성능. 이후 친밀도 상승량 +1'},
 {id:'masterball',name:'마스터볼',sprite:'master-ball',price:25000,description:'야생 포켓몬을 반드시 포획. 트레이너에게 사용 불가'}
].map(b=>({...b,image:itemRoot+b.sprite+'.png'}));
export function ballById(id='pokeball'){return BALLS.find(b=>b.id===id);}
export function ballMultiplier(id,context={}){const turn=Math.max(1,context.turn||1);switch(id){case 'greatball':return 1.5;case 'ultraball':return 2;case 'quickball':return turn===1?5:1;case 'timerball':return Math.min(4,1+(turn-1)*1229/4096);case 'netball':return context.types?.some(t=>['물','벌레','Water','Bug'].includes(t))?3.5:1;case 'duskball':return context.night||context.cave?3:1;default:return 1;}}
export function captureAttempt(mon,id,context={},rng=Math.random){if(!ballById(id))throw Error('볼 종류를 확인하세요.');if(id==='masterball')return {caught:true,shakes:4,multiplier:1,guaranteed:true};const status=['잠듦','얼음','slp','frz'].includes(mon.status)?2.5:mon.status?1.5:1;const multiplier=ballMultiplier(id,{...context,types:mon.currentTypes||mon.types});const a=(3*mon.maxHp-2*mon.hp)*(mon.captureRate||45)*multiplier/(3*mon.maxHp)*status;const threshold=a>=255?65536:1048560/Math.sqrt(Math.sqrt(16711680/Math.max(.01,a)));let shakes=0;while(shakes<4&&Math.floor(rng()*65536)<threshold)shakes++;return {caught:shakes===4,shakes,multiplier};}
export function afterCapture(mon,id){return {...mon,originBall:id,...(id==='healball'?{hp:mon.maxHp,status:null,pp:{}}:{})};}
export function friendshipGain(mon,amount){return Math.min(255,(mon.friendship??70)+Math.max(0,amount)+(amount>0&&mon.originBall==='luxuryball'?1:0));}
