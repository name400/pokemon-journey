// Mission-only research areas; relative landmarks are approximate, not source maps.
export const ANOMALIES={steelix:{species:208,zone:'3'},gallade:{species:475,zone:'5'},pangoro:{species:675,zone:'9'}};
export function anomalyIds(s){return [...new Set((Array.isArray(s.zaMission40Anomalies)?s.zaMission40Anomalies:[]).filter(x=>Object.hasOwn(ANOMALIES,x)))];}
// Keep the two postgame missions independent; these labels describe the
// implemented locations, whose exact map coordinates remain drafts.
export function mission40Progress(s){
 const seen=anomalyIds(s),targets=[
  {id:'steelix',name:'강철톤',place:'야생 구역 3'},
  {id:'gallade',name:'엘레이드',place:'야생 구역 5'},
  {id:'pangoro',name:'부란다',place:'야생 구역 9 서쪽 옥상'},
 ];
 return targets.map(target=>({...target,done:seen.includes(target.id)}));
}
export function mission40Objective(s){
 if(!s.zaMission40Started||s.zaMission40Complete)return null;
 if(!s.zaMission40Stage)return '포켓몬 연구소에서 Mable에게 제르네아스에 관해 물어보세요.';
 if(s.zaMission40Stage===1){const targets=mission40Progress(s),remaining=targets.filter(t=>!t.done);return remaining.length?`이상한 우두머리 조사 (${targets.length-remaining.length}/3) · 남은 곳: ${remaining.map(t=>`${t.place} ${t.name}`).join(' · ')}.`:'세 우두머리를 조사했습니다. 포켓몬 연구소의 Mable에게 보고하세요.';}
 if(s.zaMission40Stage===2)return s.zaMission40XerneasRevealed===false?'야생 구역 11 북쪽 강변의 흔적을 조사하세요.':'야생 구역 11 북쪽 강변에서 제르네아스를 찾아 포획하세요.';
 return null;
}
export function researchMap(s){const z=s.zaMission40Zone,g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));if(z==='5'){for(let y=3;y<=9;y++)for(let x=2;x<=8;x++)g[y][x]='g';g[5][5]='0';}else if(z==='9'){for(let y=3;y<=7;y++)for(let x=14;x<=20;x++)g[y][x]=',';g[5][17]='0';}else if(z==='11'){for(let y=3;y<=5;y++)for(let x=3;x<=19;x++)g[y][x]='~';g[6][11]='0';}g[15][11]='X';return g.map(r=>r.join(''));}
