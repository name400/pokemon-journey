// Mission-only research areas; relative landmarks are approximate, not source maps.
// Main Mission 40 event-specific moves, not a general species learnset.
// https://bulbapedia.bulbagarden.net/wiki/List_of_in-game_event_Pok%C3%A9mon_in_Pok%C3%A9mon_Legends:_Z-A
export const ANOMALIES={steelix:{species:208,zone:'3',moves:['지진','스톤에지','이판사판태클','구멍파기']},gallade:{species:475,zone:'5',moves:['스톤에지','사이코커터','리프블레이드','칼춤']},pangoro:{species:675,zone:'9',moves:['독찌르기','역린','기충전','누르기']}};
// Resolve only the target the player is actually facing, including legacy
// temporary research locations. Never reinterpret an unknown progress ledger.
export function mission40FieldTarget(s,spot){
 if(!s||s.area!==3||s.interior||s.zaMission40Stage!==1||spot?.tile!=='0'||spot.x===s.x&&spot.y===s.y||s.zaMission40Anomalies!=null&&!Array.isArray(s.zaMission40Anomalies))return null;
 const id=s.district==='lumiose-zone3'?'steelix':s.district==='lumiose-zone5'?'gallade':s.district==='lumiose-zone9'&&s.zaZone9Upper===true?'pangoro':s.district==='lumiose-research-zone'?(s.zaMission40Zone==='5'?'gallade':s.zaMission40Zone==='9'?'pangoro':null):null;
 return id&&!anomalyIds(s).includes(id)?{id,...ANOMALIES[id]}:null;
}
export function anomalyIds(s){return [...new Set((Array.isArray(s.zaMission40Anomalies)?s.zaMission40Anomalies:[]).filter(x=>Object.hasOwn(ANOMALIES,x)))];}
// Unknown future entries must survive recording a known target.
export function assertMission40RecordWritable(s){
 if(s.zaMission40Anomalies!=null&&!Array.isArray(s.zaMission40Anomalies))throw Error('조사 기록 형식을 확인하세요.');
}
export function recordMission40Anomaly(s,foe){
 if(s.zaMission40Stage!==1)return;
 const tag=String(foe?.adventureMissionId||''),id=tag.startsWith('mission40-')?tag.slice(10):'';
 if(!Object.hasOwn(ANOMALIES,id))return;
 assertMission40RecordWritable(s);
 const records=s.zaMission40Anomalies??[];
 if(!records.includes(id))s.zaMission40Anomalies=[...records,id];
}
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
