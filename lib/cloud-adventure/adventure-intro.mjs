// Mission 1 is compressed to an alley grid; precise original geometry is unknown.
export const INTRO_STARTERS=[{species:152,x:2,y:1},{species:498,x:4,y:1},{species:158,x:6,y:1}];
export function introMove(s,direction){
 const offsets={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},delta=offsets[direction];
 if(!delta||!['chase','choose'].includes(s.zaIntroStage))throw Error('이동 방향을 확인하세요.');
 const x=s.zaIntroX+delta[0],y=s.zaIntroY+delta[1];
 if(x<1||x>7||y<1||y>3||s.zaIntroStage==='choose'&&INTRO_STARTERS.some(p=>p.x===x&&p.y===y))throw Error('그쪽으로 이동할 수 없습니다.');
 s.zaIntroX=x;s.zaIntroY=y;s.zaIntroChoice=null;
 if(s.zaIntroStage==='chase'&&x===7&&y===2){s.zaIntroStage='choose';s.zaIntroX=4;s.zaIntroY=3;s.log=['판짱을 따라 골목 끝에 도착했다. 동료가 내민 세 포켓몬을 살펴보자.'];}
 else s.log=[s.zaIntroStage==='chase'?'가방을 가져간 판짱을 따라가자.':'포켓몬에게 다가가 말을 걸자.'];
}
export function introTalk(s,species){const p=INTRO_STARTERS.find(p=>p.species===species);if(s.zaIntroStage!=='choose'||!p||Math.abs(s.zaIntroX-p.x)+Math.abs(s.zaIntroY-p.y)!==1)throw Error('가까이 다가가 포켓몬을 확인하세요.');s.zaIntroChoice=species;}
export function introEscapeMove(s,direction){
 const offsets={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},delta=offsets[direction];
 if(!delta||!['escape','barrierRoute','tunnel'].includes(s.zaIntroStage))throw Error('현재 탈출 경로를 확인하세요.');
 const x=s.zaIntroX+delta[0],y=s.zaIntroY+delta[1];
 if(x<1||x>7||y<1||y>3)throw Error('그쪽으로 이동할 수 없습니다.');
 s.zaIntroX=x;s.zaIntroY=y;
 if(s.zaIntroStage==='escape'&&x===4&&y===2){s.zaIntroStage='brigitte';s.log=['출구를 향하던 중 Brigitte가 배틀을 신청했다.'];}
 else if(s.zaIntroStage==='barrierRoute'&&x===6&&y===2){s.zaIntroStage='barrier';s.log=['배틀 존의 붉은 장벽 앞에 도착했다.'];}
 else if(s.zaIntroStage==='tunnel'&&x===7&&y===2){s.zaIntroStage='hotel';s.log=['터널을 지나 호텔 Z 앞에 도착했다.'];}
 else s.log=[s.zaIntroStage==='escape'?'동료를 따라 배틀 존 출구로 가자.':s.zaIntroStage==='barrierRoute'?'동료를 따라 붉은 장벽으로 가자.':'장벽 너머 터널을 지나 호텔로 가자.'];
}
