// Read only explicit saved progress. Missing legacy fields never imply an unclaimed reward.
export function pendingAdventureQuests(s={}){
 const items=[],add=(id,title,goal)=>items.push({id,title,goal});
 if(s.zaEmmaMet===true&&!s.zaEmmaBattleComplete&&!s.zaEmmaMegaSeen){
  if(!s.zaBunnelbyQuest&&s.zaMission05Stage===7)add('1','파르빗 의뢰','Trevelle에게 의뢰를 받으세요.');
  else if(s.zaBunnelbyQuest===1)add('1','파르빗 의뢰','루주 골목에서 큰 파르빗을 살피세요.');
  else if(s.zaBunnelbyQuest===2)add('1','파르빗 의뢰','Trevelle에게 결과를 보고하세요.');
  if(!s.zaTradeQuest&&s.zaMission05Stage===7)add('2','포켓몬 교환 의뢰','파사주 뒤 팔레 또는 야생 구역 3에서 Tracie에게 의뢰를 받으세요.');
  else if(s.zaTradeQuest===1)add('2','포켓몬 교환 의뢰','파사주 뒤 팔레 또는 야생 구역 3의 Tracie 앞에서 피카츄를 선택해 교환하세요.');
  if(!s.zaSableyeQuest&&s.zaMission05Stage===7)add('3','묘지 의뢰','묘지 앞의 Moire에게 의뢰를 받으세요.');
  else if(s.zaSableyeQuest===1)add('3','묘지 의뢰','야생 구역 4 묘지 안쪽에서 반지를 찾으세요.');
  else if(s.zaSableyeQuest===2)add('3','묘지 의뢰','묘지 앞의 Moire에게 반지를 돌려주세요.');
 }
 if(s.zaTradeQuest===2&&(s.zaTradePotionPending===true||(Number.isSafeInteger(s.zaTradeBallPending)&&s.zaTradeBallPending>0&&s.zaTradeBallPending<=5)))add('2-reward','포켓몬 교환 보상','Tracie에게 남은 볼이나 상처약을 받으세요.');
 if(s.zaSableyeQuest===3&&s.zaSableyeRevivePending===true)add('3-reward','묘지 의뢰 보상','묘지 앞의 Moire에게 기력의조각을 받으세요.');
 if(s.zaSide14Started===true&&s.zaSide14Complete!==true)add('14','나루림의 카페 방문','남쪽 큰길의 Café Soleil에서 나루림을 만나세요.');
 if(s.zaSide21Started===true&&s.zaSide21Complete!==true){const count=new Set(Array.isArray(s.zaSide21Found)?s.zaSide21Found:[]).size;add('21','미술관의 분떠도리',count===12?'미술관 1층의 Bundo와 Wanda에게 보고하세요.':`미술관에서 분떠도리를 찾으세요 (${Math.min(count,12)}/12).`);}
 if(s.zaSide27Started===true&&s.zaSide27Complete!==true)add('27','화석 복원 의뢰','남쪽 큰길의 돌 가게에서 화석을 구해 연구소 2층 Reg에게 가져가세요.');
 if(s.zaSide72Stage===1&&s.zaSide72Complete!==true)add('72','갈라르 메더 수색','야생 구역 11 남서쪽 강변의 수상한 몬스터볼을 확인하세요.');
 if([1,2].includes(s.zaSide74Stage)&&s.zaSide74Complete!==true)add('74','딜리버드 구출',s.zaSide74Stage===2?'베르 9번지에서 딜리버드와 트레이너에게 보상을 받으세요.':'베르 9번지에서 딜리버드를 쫓는 더스트나를 막으세요.');
 if([1,2].includes(s.zaSide88Stage)&&s.zaSide88Complete!==true)add('88','Tesse의 첫 손님',s.zaSide88Stage===2?'마젠타 포켓몬센터의 Tesse에게 보상을 받으세요.':'마젠타 포켓몬센터의 Tesse와 배틀하세요.');
 if(s.zaSide119Started===true&&s.zaSide119Complete!==true){const wins=Number.isInteger(s.zaSide119Wins)&&s.zaSide119Wins>=0&&s.zaSide119Wins<=4?s.zaSide119Wins:0;add('119','Jacinthe 토너먼트',`호텔 리치시엠에서 Jacinthe와 배틀하세요 (${wins}/4).`);}
 if(Number.isSafeInteger(s.zaSide119LuxuryPending)&&s.zaSide119LuxuryPending>0&&s.zaSide119Complete===true)add('119-reward','Jacinthe 토너먼트 보상','호텔 리치시엠에서 남은 럭셔리볼을 받으세요.');
 for(const [flag,id,title,goal,won] of [
  ['zaSide04RewardPending','4-reward','Sommi 의뢰 보상','루주 1번지 홀로베이터에서 보상을 받으세요.'],
  ['zaSide020RewardPending','20-reward','Ticien 의뢰 보상','야생 구역 6의 Ticien에게 남은 보상을 받으세요.','zaSide020Won'],
  ['zaSide42RewardPending','42-reward','Faye 의뢰 보상','야생 구역 6의 Faye에게 요정의깃털을 받으세요.','zaSide42Won'],
  ['zaSide61RewardPending','61-reward','홀로베이터 수리 보상','블루 3번지 홀로베이터에서 보상을 받으세요.','zaMission61Won'],
  ['zaSide92RewardPending','92-reward','메탕 의뢰 보상','남쪽 큰길 홀로베이터에서 남은 보상을 받으세요.','zaSide92Won'],
 ])if(s[flag]&&(!won||s[won]===true))add(id,title,goal);
 return items;
}

export function trackedAdventureObjective(s={}){if(typeof s.zaTrackedQuestId!=='string'||!s.zaTrackedQuestId)return s.objective;return pendingAdventureQuests(s).find(q=>q.id===s.zaTrackedQuestId)?.goal||s.objective;}

// These are existing interaction tiles in our compressed 2D maps, not original
// game coordinates. Never direct players to another floor or a stale target.
export function trackedAdventureLocalTarget(s={}){
 if(s.interior||!pendingAdventureQuests(s).some(q=>q.id===s.zaTrackedQuestId))return null;
 let target=null;
 if(s.zaTrackedQuestId==='14'&&s.district==='lumiose-south-boulevard'&&!s.zaVert7RoofUpper)target={x:17,y:5,tile:'^'};
 else if(s.zaTrackedQuestId==='72'&&s.district==='lumiose-zone11'&&!s.zaZone11Upper)target={x:3,y:10,tile:'u'};
 else if(s.zaTrackedQuestId==='74'&&s.district==='lumiose-vert-sector9')target={x:5,y:6,tile:'q'};
 else if(s.zaTrackedQuestId==='88'&&s.district==='lumiose-magenta-sector8-route')target={x:13,y:14,tile:'n'};
 return target&&s.map?.[target.y]?.[target.x]===target.tile?{x:target.x,y:target.y}:null;
}
