import {side36RewardsValid} from './adventure-side36.mjs';
import {side35ValidRewards} from './adventure-side35.mjs';
import {side11ValidRewards} from './adventure-side11.mjs';
import {side12Seen} from './adventure-side12.mjs';
import {side05ValidRewards} from './adventure-side05.mjs';
import {side06ValidRewards} from './adventure-side06.mjs';
import {SIDE13_WAVES,side13ValidCleared} from './adventure-side13.mjs';
import {side09ValidPending} from './adventure-side09.mjs';
import {side08ValidPending} from './adventure-side08.mjs';
import {side07ValidPending} from './adventure-side07.mjs';
import {side15ValidRewards} from './adventure-side15.mjs';
import {side26ValidRewards} from './adventure-side26.mjs';
import {side19ValidRewards} from './adventure-side19.mjs';
import {SIDE67_SPOTS,side67Found} from './adventure-side67.mjs';
import {MUSEUM_SPEWPA_SPOTS} from './adventure-museum.mjs';
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
 if(s.zaSide14Complete===true&&Number.isSafeInteger(s.zaSide14DreamPending)&&s.zaSide14DreamPending>0&&s.zaSide14DreamPending<=2)add('14','나루림의 카페 방문','남쪽 큰길의 Café Soleil에서 맡긴 휘핑팝을 받으세요.');
 else if(s.zaSide14Started===true&&s.zaSide14Complete!==true)add('14','나루림의 카페 방문','남쪽 큰길의 Café Soleil에서 나루림을 만나세요.');
 if([1,2].includes(s.zaSide16Stage))add('16','꼬몽울 쇼',s.zaSide16Stage===1?'꼬몽울을 파티에 넣고 블루 8번지에서 쇼에 참가하세요.':'블루 8번지의 꼬몽울 쇼 질문에 답하세요.');
 if(s.zaSide16Stage===3&&s.zaSide16SeedPending===true)add('16-reward','꼬몽울 쇼 보상','블루 8번지의 쇼 접수처에서 맡긴 기적의씨를 받으세요.');
 if(s.zaSide19Started===true&&s.zaSide19Complete!==true)add('19','마비와 독 대결',`베르 3번지에서 ${s.zaSide19LyseWon===true?'Venin':s.zaSide19VeninWon===true?'Lyse':'Lyse와 Venin'}와 배틀하세요.`);
 if(s.zaSide19Started===true&&side19ValidRewards(s.zaSide19RewardsV1)&&Object.values(s.zaSide19RewardsV1).some(n=>n>0))add('19-reward','상태이상 대결 보상','베르 3번지의 Lyse 또는 Venin에게 맡긴 보상을 받으세요.');
 if(s.zaSide18Stage===1)add('18','세 원숭이의 차','야나프·바오프·앗차프를 파티에 넣고 베르 3번지의 Servando에게 돌아가세요.');
 if(s.zaSide18Stage===2&&s.zaSide18RewardPending&&typeof s.zaSide18RewardPending==='object'&&!Array.isArray(s.zaSide18RewardPending)&&Object.keys(s.zaSide18RewardPending).every(k=>k==='hpup'||k==='whiteherb')&&Number.isSafeInteger(s.zaSide18RewardPending.hpup)&&s.zaSide18RewardPending.hpup>=0&&s.zaSide18RewardPending.hpup<=3&&Number.isSafeInteger(s.zaSide18RewardPending.whiteherb)&&s.zaSide18RewardPending.whiteherb>=0&&s.zaSide18RewardPending.whiteherb<=1&&(s.zaSide18RewardPending.hpup>0||s.zaSide18RewardPending.whiteherb>0))add('18-reward','카페 의뢰 보상','베르 3번지의 Servando에게 맡긴 보상을 받으세요.');
 for(const [n,name] of [[31,'깜까미'],[32,'요가램']]){if(s[`zaSide${n}Won`]===true&&s[`zaSide${n}RewardPending`]===true)add(String(n),`메가${name} 의뢰`,'베르날 대로의 Arden에게 보상을 받으세요.');else if(s[`zaSide${n}Started`]===true&&s[`zaSide${n}Won`]!==true)add(String(n),`메가${name} 의뢰`,`Arden과 배틀 중 ${name}를 메가진화시키고 승리하세요.`);}
 if(s.zaSide36Started===true&&s.zaSide36Won!==true)add('36','친밀한 포켓몬 배틀','야생 구역 9 남쪽의 Chou와 배틀하세요.');
 if([1,2,3].includes(s.zaSide38Stage))add('38','상태 변화 대결',s.zaSide38Stage===1?'마젠타 거리의 Maxen과 배틀하세요.':s.zaSide38Stage===2?'마젠타 거리의 Deb와 배틀하세요.':'마젠타 거리의 Maxen에게 보상을 받으세요.');
 if(s.zaSide47Stage===1)add('47','트리미앙 미용사','존느 6번지의 대타 인형에 베어가르기를 보여 주세요.');
 if(s.zaSide47Stage===2)add('47-reward','트리미앙 미용 의뢰 보상','존느 6번지의 Mirte에게 보상을 받으세요.');
 if(s.zaSide48Stage===1)add('48','거미줄에 묶인 사람','루주 5번지에서 위력 100 이상 기술로 거미줄을 끊으세요.');
 if(s.zaSide48Stage===2)add('48-reward','구조 의뢰 보상','루주 5번지에서 구조한 사람에게 보상을 받으세요.');
 if(s.zaSide56Stage===1)add('56','홀로베이터 수리','존느 6번지 홀로베이터를 격투 물리 기술로 수리하세요.');
 if(s.zaSide56Stage===2)add('56','홀로베이터 수리','수리한 홀로베이터로 옥상에 올라가세요.');
 if(s.zaSide56Stage===3)add('56-reward','홀로베이터 수리 보상','존느 6번지의 Médiera에게 보상을 받으세요.');
 if(s.zaSide87Stage===1)add('87','최고의 트리미앙 미용','존느 6번지의 대타 인형에 사이코커터를 보여 주세요.');
 if(s.zaSide87Stage===2)add('87-reward','최고 미용 의뢰 보상','존느 6번지의 Mirte에게 보상을 받으세요.');
 if(s.zaSide62Stage===1)add('62','전문 트리미앙 미용','존느 6번지의 대타 인형에 잎날가르기를 보여 주세요.');
 if(s.zaSide62Stage===2)add('62-reward','전문 미용 의뢰 보상','존느 6번지의 Mirte에게 보상을 받으세요.');
 if(s.zaSide51Stage===1)add('51','다섯 플라엣테','블루 8번지의 Vivace와 다섯 플라엣테를 상대하세요.');
 if(s.zaSide51Stage===2)add('51-reward','플라엣테 의뢰 보상','블루 8번지의 Vivace에게 보상을 받으세요.');
 if(s.zaSide53Stage===1)add('53','가장 강한 저리더프','블루 5번지의 Anguil과 배틀하세요.');
 if(s.zaSide53Stage===2)add('53-reward','저리더프 배틀 보상','블루 5번지의 Anguil에게 보상을 받으세요.');
 if(s.zaSide52Stage===1)add('52','얼어붙은 둔타','야생 구역 12에서 위력 90 이상의 불꽃 기술로 둔타를 구하세요.');
 if(s.zaSide52Stage===2)add('52-reward','둔타 구조 보상','야생 구역 12의 Gelli에게 보상을 받으세요.');
 if(s.zaSide49Stage===1)add('49','공격하며 회복','센트리코 광장 근처의 Piresse와 배틀하세요.');
 if(s.zaSide49Stage===2)add('49-reward','흡수 배틀 의뢰 보상','Piresse에게 보상을 받으세요.');
 if(s.zaSide46Stage===1)add('46','피죤투의 공중날기','세존 운하변의 Colis와 배틀하세요.');
 if(s.zaSide46Stage===2)add('46-reward','공중날기 의뢰 보상','세존 운하변의 Colis에게 보상을 받으세요.');
 if(s.zaSide45Stage===1)add('45','홀로베이터 유지 보수','블루 7번지의 Durstin에게 음료를 건네세요.');
 if(s.zaSide45Stage===2)add('45-reward','유지 보수 의뢰 보상','블루 7번지의 Durstin에게 보상을 받으세요.');
 if(s.zaSide44Stage===1)add('44','바닐프티의 향기','바닐프티를 파티에 넣고 베르날 대로의 Odette에게 보여 주세요.');
 if(s.zaSide44Stage===2)add('44-reward','바닐프티 의뢰 보상','베르날 대로의 Odette에게 보상을 받으세요.');
 if(s.zaSide37Stage===1)add('37','선착장의 거북손손','마젠타 거리 운하의 Barnie에게 돌아가 거북손손과 배틀하세요.');
 if(s.zaSide37Stage===2)add('37-reward','선착장 의뢰 보상','마젠타 거리 운하의 Barnie에게 보상을 받으세요.');
 if(s.zaSide36Won===true&&side36RewardsValid(s.zaSide36RewardsV1)&&Object.values(s.zaSide36RewardsV1).some(n=>n>0))add('36-reward','친밀도 배틀 보상','야생 구역 9 남쪽의 Chou에게 보상을 받으세요.');
 if(s.zaSide35Stage===1)add('35','요가 선생님의 가르침','야생 구역 3의 돌 건물 계단을 올라 옥상의 요가 선생님을 만나세요.');
 if(s.zaSide35Stage===2&&side35ValidRewards(s.zaSide35RewardsV1)&&Object.values(s.zaSide35RewardsV1).some(n=>n>0))add('35-reward','요가 선생님 의뢰 보상','구역 3 옥상의 요가 선생님에게 맡긴 보상을 받으세요.');
 if(s.zaSide30Won===true&&s.zaSide30RewardPending===true)add('30','메가폭타를 보여 주세요','베르날 대로의 Arden에게 의뢰 보상을 받으세요.');
 else if(s.zaSide30Started===true&&s.zaSide30Won!==true)add('30','메가폭타를 보여 주세요','베르날 대로의 Arden과 배틀 중 폭타를 메가진화시키고 승리하세요.');
 if(s.zaSide17RewardPending===true)add('17','색이 다른 메리프 조사','베르 9번지 북문 앞의 Duve에게 보상을 받으세요.');
 else if(s.zaSide17Stage===1)add('17','색이 다른 메리프 조사','야생 구역 1의 높은 옥상에서 메리프를 살펴보세요.');
 if(s.zaSide21Started===true&&s.zaSide21Complete!==true){
  const found=new Set(Array.isArray(s.zaSide21Found)?s.zaSide21Found:[]),count=found.size;
  const valid=Object.entries(MUSEUM_SPEWPA_SPOTS).flatMap(([floor,spots])=>spots.map((_,index)=>`${floor}-${index}`));
  const known=(s.zaSide21Found===undefined||Array.isArray(s.zaSide21Found))&&[...found].every(id=>valid.includes(id));
  const remaining=known?Object.entries(MUSEUM_SPEWPA_SPOTS).map(([floor,spots],index)=>({floor:index+1,count:spots.filter((_,i)=>!found.has(`${floor}-${i}`)).length})).filter(x=>x.count>0):[];
  const hint=remaining.length?` 남은 층: ${remaining.map(x=>`${x.floor}층 ${x.count}마리`).join(', ')}.`:'';
  add('21','미술관의 분떠도리',count===12?'미술관 1층의 Bundo와 Wanda에게 보고하세요.':`미술관에서 분떠도리를 찾으세요 (${Math.min(count,12)}/12).${hint}`);
 }
 if([1,2].includes(s.zaSide23Stage))add('23','홀로베이터 아래의 포켓몬',s.zaSide23Stage===2?'베르날 대로의 Terra에게 의뢰 보상을 받으세요.':'베르날 대로의 홀로베이터 아래 흙더미를 조사하세요.');
 if(s.zaSide12Started===true&&s.zaSide12Complete!==true&&side12Seen(s))add('12','플라베베의 꽃',`블루 8번지 미용실 옆에서 꽃 색을 보여 주세요 (${side12Seen(s).length}/5).`);
 if(s.zaSide12Complete===true&&s.zaSide12CandyPending===true&&side12Seen(s)?.length===5)add('12-reward','플라베베 의뢰 보상','블루 8번지 미용실 옆 Vivace에게 맡긴 이상한사탕을 받으세요.');
 if(s.zaSide05Started===true&&s.zaSide05Complete!==true)add('05','아보를 보여 줘','아보를 파티에 넣고 마젠타 1번지의 Ismene에게 보여 주세요.');
 if(s.zaSide05Complete===true&&side05ValidRewards(s.zaSide05RewardsV1)&&Object.values(s.zaSide05RewardsV1).some(n=>n>0))add('05-reward','아보 의뢰 보상','마젠타 1번지의 Ismene에게 맡긴 보상을 받으세요.');
 if(s.zaSide11Started===true&&s.zaSide11Won!==true)add('11','딱충이 마스터','루주 1번지의 Montée와 배틀하세요.');
 if(s.zaSide11Won===true&&side11ValidRewards(s.zaSide11RewardsV1)&&Object.values(s.zaSide11RewardsV1).some(n=>n>0))add('11-reward','딱충이 의뢰 보상','루주 1번지의 Montée에게 보상을 받으세요.');
 if(s.zaSide06Started===true&&s.zaSide06Won!==true)add('06','장거리 기술 배틀','블루 4번지의 Distan과 배틀하세요.');
 if(s.zaSide06Won===true&&side06ValidRewards(s.zaSide06RewardsV1)&&Object.values(s.zaSide06RewardsV1).some(n=>n>0))add('06-reward','장거리 배틀 보상','블루 4번지의 Distan에게 보상을 받으세요.');
 if(side13ValidCleared(s)){const done=(s.zaSide13ClearedV1||[]).length,total=SIDE13_WAVES[s.zaSide13Stage].length;add('13','분수의 가시덤불',done===total?'존느 7번지의 Croquis에게 돌아가세요.':`존느 7번지의 가시덤불을 제거하세요 (${done}/${total}).`);}
 if(s.zaSide13Stage===4&&Number.isSafeInteger(s.zaSide13PendingV1)&&s.zaSide13PendingV1>0&&s.zaSide13PendingV1<=3)add('13-reward','분수 의뢰 보상','존느 7번지의 Croquis에게 맡긴 네스트볼을 받으세요.');
 if([1,2,3,4].includes(s.zaSide09Stage))add('09','개구마르의 비계 도전',s.zaSide09Stage===4?'노스 불르바르의 Surv에게 보상을 받으세요.':`${s.zaSide09Stage}번째 비계 코스를 완주하세요.${s.zaSide09Stage===3?' 로토글라이드가 필요합니다.':''}`);
 if(s.zaSide09Stage===5&&side09ValidPending(s.zaSide09PendingV1)&&(s.zaSide09PendingV1.xs||s.zaSide09PendingV1.small))add('09-reward','개구마르 의뢰 보상','노스 불르바르의 Surv에게 맡긴 경험사탕을 받으세요.');
 if([1,2,3].includes(s.zaSide08Stage))add('08','푸호꼬를 도와줘',s.zaSide08Stage===1?'베르 4번지 카페 클라세 앞의 약초꾼에게 물어보세요.':s.zaSide08Stage===2?'야생 구역 5 지하 공터와 사다리 위에서 싱싱한 나뭇가지를 찾으세요.':'마젠타 2번지의 Branche에게 돌아가세요.');
 if(s.zaSide08Stage===4&&side08ValidPending(s.zaSide08PendingV1)&&(s.zaSide08PendingV1.xs||s.zaSide08PendingV1.small))add('08-reward','푸호꼬 의뢰 보상','마젠타 2번지의 Branche에게 맡긴 경험사탕을 받으세요.');
 if(s.zaSide07Won===true&&s.zaSide07Claimed!==true)add('07','도치마론의 배틀','루주 2번지의 Axi에게 도치마론을 받으세요.');
 if(s.zaSide07Claimed===true&&side07ValidPending(s.zaSide07PendingV1)&&(s.zaSide07PendingV1.xs||s.zaSide07PendingV1.small))add('07-reward','도치마론 의뢰 보상','루주 2번지의 Axi에게 맡긴 경험사탕을 받으세요.');
 if(s.zaSide15Started===true&&s.zaSide15Won!==true)add('15','걱정하는 다부니','루주 1번지의 Hea와 배틀하세요.');
 if(s.zaSide15Won===true&&side15ValidRewards(s.zaSide15RewardsV1)&&Object.values(s.zaSide15RewardsV1).some(n=>n>0))add('15-reward','다부니 의뢰 보상','루주 1번지의 Hea에게 보상을 받으세요.');
 if(s.zaSide26Won===true&&side26ValidRewards(s.zaSide26RewardsV1)&&Object.values(s.zaSide26RewardsV1).some(n=>n>0))add('26-reward','Armie의 의뢰 보상','루주 3번지의 Armie에게 맡긴 보상을 받으세요.');
 if(s.zaSide25Stage===1)add('25','깨봉이 손님 안내','마젠타 4번지의 쓰레기 수거 장소로 깨봉이들을 데려가세요.');
 if(s.zaSide25Stage===2&&s.zaSide25RewardPending&&typeof s.zaSide25RewardPending==='object'&&!Array.isArray(s.zaSide25RewardPending)&&Number.isSafeInteger(s.zaSide25RewardPending.rarecandy)&&s.zaSide25RewardPending.rarecandy>=0&&s.zaSide25RewardPending.rarecandy<=2&&Number.isSafeInteger(s.zaSide25RewardPending.duskball)&&s.zaSide25RewardPending.duskball>=0&&s.zaSide25RewardPending.duskball<=5&&(s.zaSide25RewardPending.rarecandy>0||s.zaSide25RewardPending.duskball>0))add('25-reward','깨봉이 의뢰 보상','마젠타 4번지의 쓰레기 수거 장소에서 맡긴 보상을 받으세요.');
 if(s.zaSide27Started===true&&s.zaSide27Complete!==true)add('27','화석 복원 의뢰','남쪽 큰길의 돌 가게에서 화석을 구해 연구소 2층 Reg에게 가져가세요.');
 if(s.zaSide24Started===true&&s.zaSide24Complete!==true)add('24','캐이시의 놀이 친구','에투알 학교의 Bond에게 캐이시를 교환하세요.');
 if(s.zaSide39Started===true&&s.zaSide39Complete!==true)add('39','야돈 교환','남쪽 큰길의 Quille에게 일반 야돈을 교환하세요.');
 if(s.zaSide67Started===true&&s.zaSide67Complete!==true){const count=side67Found(s).length;add('67','님피아의 진정',count===5?'쿨랑 수로 아래의 Calma에게 보고하세요.':`쿨랑 수로의 다섯 이야기를 들으세요 (${count}/5).`);}
 if(Number.isInteger(s.zaSide76Stage)&&s.zaSide76Stage>=1&&s.zaSide76Stage<=6&&!s.zaSide76Complete)add('76','메가진화 수업',s.zaSide76Stage===6?'에투알 학교 안뜰의 Jondre에게 보상을 받으세요.':`에투알 학교 안뜰에서 질문에 답하세요 (${s.zaSide76Stage}/5).`);
 if(s.zaSide72Stage===1&&s.zaSide72Complete!==true)add('72','갈라르 메더 수색','야생 구역 11 남서쪽 강변의 수상한 몬스터볼을 확인하세요.');
 if([1,2].includes(s.zaSide74Stage)&&s.zaSide74Complete!==true)add('74','딜리버드 구출',s.zaSide74Stage===2?'베르 9번지에서 딜리버드와 트레이너에게 보상을 받으세요.':'베르 9번지에서 딜리버드를 쫓는 더스트나를 막으세요.');
 if([1,2].includes(s.zaSide88Stage)&&s.zaSide88Complete!==true)add('88','Tesse의 첫 손님',s.zaSide88Stage===2?'마젠타 포켓몬센터의 Tesse에게 보상을 받으세요.':'마젠타 포켓몬센터의 Tesse와 배틀하세요.');
 if([1,2].includes(s.zaSide117Stage)&&s.zaSide117Complete!==true)add('117','Josée의 수련',s.zaSide117Stage===1?'정의단 도장에서 Josée와 우두머리 부란다에 맞서세요.':'정의단 도장의 Josée에게 수련 보상을 받으세요.');
 if(Number.isInteger(s.zaSide118Stage)&&s.zaSide118Stage>=1&&s.zaSide118Stage<=5&&s.zaSide118Complete!==true){const goals=['정의단 도장에서 Gwynn과 배틀하세요.','호텔 리치시엠 앞에서 Gwynn을 만나세요.','베르 9번지 수로에서 Gwynn을 만나세요.','갤러리 드 라 륀에서 Gengar를 찾으세요.','갤러리 드 라 륀에서 Gänger에게 보상을 받으세요.'];add('118','Gengar 수색',goals[s.zaSide118Stage-1]);}
 if(s.zaSide119Started===true&&s.zaSide119Complete!==true){const wins=Number.isInteger(s.zaSide119Wins)&&s.zaSide119Wins>=0&&s.zaSide119Wins<=4?s.zaSide119Wins:0;add('119','Jacinthe 토너먼트',`호텔 리치시엠에서 Jacinthe와 배틀하세요 (${wins}/4).`);}
 // Deferred rewards are collected from the bag, not at an NPC. Only explicit,
 // valid saved balances are listed; completion alone never creates a reward.
 for(const [flag,complete,id,title,limits] of [
  ['zaSide117RewardPending','zaSide117Complete','117-reward','Josée의 수련 보상',{expertbelt:1,seedofmasteryza:10}],
  ['zaSide118RewardPending','zaSide118Complete','118-reward','Gengar 수색 보상',{large:2,xl:1}],
  ['zaZone15Side80Pending','zaZone15LiftUnlocked','80-reward','홀로베이터 의뢰 보상',{quickball:4,lumiosegalette:1}],
 ]){
  const pending=s[flag];if(s[complete]!==true||!pending||typeof pending!=='object'||Array.isArray(pending))continue;
  const counts=Object.entries(limits).map(([key,max])=>({value:pending[key]??0,max}));
  if(counts.every(({value,max})=>Number.isSafeInteger(value)&&value>=0&&value<=max)&&counts.some(({value})=>value>0))add(id,title,'가방에 공간을 만든 뒤 가방의 보관된 보상을 받으세요.');
 }
 // A completed course may have an unclaimed reward even after the player leaves.
 // Only persisted reward flags count; completion of a legacy course is not enough.
 for(const [flag,id,title,goal] of [
  ['zaLeYeahRewardPending','60-reward','르 예 식당 보상','루주 3번지의 레스토랑 르 예 안내원에게 보상을 받으세요.'],
  ['zaLeNahRewardPending','29-reward','르 나 식당 보상','베르 6번지의 레스토랑 르 나 안내원에게 보상을 받으세요.'],
  ['zaLeWowRewardPending','94-reward','르 와우 식당 보상','루주 2번지의 레스토랑 르 와우 안내원에게 보상을 받으세요.'],
  ['zaSushiRewardPending','sushi-reward','스시 하이 롤러 보상','루주 북쪽 거리의 스시 하이 롤러 안내원에게 보상을 받으세요.'],
 ])if(['mission','repeat'].includes(s[flag]))add(id,title,goal);
 if(Number.isSafeInteger(s.zaSide119LuxuryPending)&&s.zaSide119LuxuryPending>0&&s.zaSide119Complete===true)add('119-reward','Jacinthe 토너먼트 보상','호텔 리치시엠에서 남은 럭셔리볼을 받으세요.');
 for(const [flag,id,title,goal,won] of [
  ['zaSide04RewardPending','4-reward','Sommi 의뢰 보상','루주 1번지 홀로베이터에서 보상을 받으세요.'],
  ['zaSide020RewardPending','20-reward','Ticien 의뢰 보상','야생 구역 6의 Ticien에게 남은 보상을 받으세요.','zaSide020Won'],
  ['zaSide75RewardPending','75-reward','Touri 의뢰 보상','베르 9번지의 Touri에게 가라두구 도구를 받으세요.','zaSide75Won'],
  ['zaSide28RewardPending','28-reward','Marnole 의뢰 보상','블르 7번지의 Marnole에게 실크스카프를 받으세요.','zaSide28Won'],
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
 if(typeof s.zaTrackedQuestId!=='string'||!s.zaTrackedQuestId||!pendingAdventureQuests(s).some(q=>q.id===s.zaTrackedQuestId))return null;
 // Restaurant rewards point to the door outside and the host inside. No other
 // indoor layer may reuse the same coordinates as an unrelated marker.
 const restaurants={
  '60-reward':{district:'lumiose-rouge-sector3',interior:'leYeah',door:{x:16,y:11,tile:'u'},host:{x:11,y:5,tile:'R'}},
  '29-reward':{district:'lumiose-vert-sector6',interior:'leNah',door:{x:15,y:12,tile:'u'},host:{x:11,y:5,tile:'R'}},
  '94-reward':{district:'lumiose-rouge-sector2',interior:'leWow',door:{x:5,y:5,tile:'u'},host:{x:11,y:5,tile:'R'}},
  'sushi-reward':{district:'lumiose-rouge-north',interior:'sushi',door:{x:19,y:4,tile:'l'},host:{x:16,y:5,tile:'R'}},
 };
 const restaurant=restaurants[s.zaTrackedQuestId];
 if(restaurant){
  if(s.district!==restaurant.district||s.zaTrackedQuestId==='sushi-reward'&&s.zaRougeStreetSouth===true)return null;
  const tile=s.interior===restaurant.interior?restaurant.host:!s.interior?restaurant.door:null;
  return tile&&s.map?.[tile.y]?.[tile.x]===tile.tile?{x:tile.x,y:tile.y}:null;
 }
 if(s.zaTrackedQuestId==='21'&&s.district==='lumiose-museum-front'){
  const count=new Set(Array.isArray(s.zaSide21Found)?s.zaSide21Found:[]).size;
  const target=!s.interior?{x:11,y:6,tile:'u'}:count===12&&s.interior==='museum2'?{x:18,y:5,tile:'l'}:count===12&&s.interior==='museum1'?{x:3,y:14,tile:'t'}:null;
  return target&&s.map?.[target.y]?.[target.x]===target.tile?{x:target.x,y:target.y}:null;
 }
 if(['117','118'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-jaune-sector2'&&(s.zaTrackedQuestId==='117'||s.zaSide118Stage===1)){
  // An active Gwynn scene or earlier Josée scene owns this interaction first.
  if(s.zaTrackedQuestId==='117'&&(s.zaSide118Stage===1||(s.zaMission19Stage===1&&!s.zaMission19JoseeWon&&Number.isInteger(s.zaRoyaleEPoints)&&s.zaRoyaleEPoints>=35000)||(s.zaMission19Stage===2&&s.zaMission19SeedPending)))return null;
  const tile=s.interior==='justiceDojo'?{x:7,y:4,tile:'j'}:!s.interior?{x:5,y:10,tile:'j'}:null;
  return tile&&s.map?.[tile.y]?.[tile.x]===tile.tile?{x:tile.x,y:tile.y}:null;
 }
 if(s.interior)return null;
 let target=null;
 if(['87','87-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-jaune-sector6')target={x:s.zaTrackedQuestId==='87'?16:15,y:11,tile:'^'};
 else if(['62','62-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-jaune-sector6')target={x:s.zaTrackedQuestId==='62'?16:15,y:11,tile:'^'};
 else if(['51','51-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-bleu-sector8')target={x:15,y:14,tile:'#'};
 else if(['56','56-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-jaune-sector6')target={x:15,y:12,tile:'j'};
 else if(s.zaTrackedQuestId==='56-reward'&&s.district==='lumiose-screw-jaune6')target={x:4,y:12,tile:'j'};
 else if(['52','52-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-zone12'&&s.zaZone12PondLower!==true)target={x:16,y:14,tile:'^'};
 else if(['49','49-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-centrico-route')target={x:8,y:0,tile:'^'};
 else if(['37','37-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-magenta-street')target={x:7,y:5,tile:'^'};
 else if(s.zaTrackedQuestId==='38'&&s.district==='lumiose-magenta-street')target={x:s.zaSide38Stage===2?17:15,y:5,tile:'^'};
 else if(['45','45-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-bleu-sector7'&&!s.zaBleu7Upper)target={x:14,y:14,tile:'j'};
 else if(['46','46-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-saison-canalside')target={x:13,y:11,tile:'^'};
 else if(['47','47-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-jaune-sector6')target={x:s.zaTrackedQuestId==='47'?16:15,y:11,tile:'^'};
 else if(['48','48-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-rouge-sector5')target={x:15,y:10,tile:'^'};
 else if(s.zaTrackedQuestId==='1'){
  const alley=s.zaBunnelbyQuest===1;
  if(s.district==='lumiose-rouge-sector6'&&!s.zaAcademyCourtyard)target=alley?{x:5,y:5,tile:'q'}:{x:7,y:4,tile:'t'};
  else if(s.district==='lumiose-zone3'&&!s.zaZone3TowerUpper)target=alley?{x:20,y:11,tile:'q'}:{x:19,y:10,tile:'t'};
 }
 else if(['2','2-reward'].includes(s.zaTrackedQuestId)){
  if(s.district==='lumiose-passage-palais')target={x:6,y:8,tile:'v'};
  else if(s.district==='lumiose-zone3'&&!s.zaZone3TowerUpper)target={x:3,y:12,tile:'v'};
 }
 else if(['3','3-reward'].includes(s.zaTrackedQuestId)){
  if(s.zaTrackedQuestId==='3'&&s.zaSableyeQuest===1&&s.district==='lumiose-zone4')target={x:18,y:6,tile:'z'};
  else if((s.zaTrackedQuestId==='3-reward'||s.zaSableyeQuest!==1)&&s.district==='lumiose-rouge-north'&&!s.zaRougeStreetSouth)target={x:22,y:13,tile:'m'};
 }
 else if(['16','16-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-bleu-sector8')target={x:5,y:5,tile:'^'};
 else if(s.zaTrackedQuestId==='26-reward'&&s.district==='lumiose-rouge-sector3')target={x:14,y:11,tile:'^'};
 else if(['19','19-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-vert-sector3')target={x:s.zaTrackedQuestId==='19'&&s.zaSide19VeninWon===true?7:5,y:0,tile:'^'};
 else if(['18','18-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-vert-sector3')target={x:15,y:2,tile:'^'};
 else if(['25','25-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-magenta-sector4')target={x:15,y:10,tile:'^'};
 else if(s.zaTrackedQuestId==='23'&&s.district==='lumiose-vernal'&&!s.zaVernalEastRoof&&!s.zaVernalSlowbroBank)target={x:3,y:0,tile:'j'};
 else if(s.zaTrackedQuestId==='17'){
  if(s.zaSide17RewardPending===true&&s.district==='lumiose-vert-sector9')target={x:14,y:14,tile:'q'};
  else if(s.zaSide17Stage===1&&s.district==='lumiose-zone1-high-roof')target={x:8,y:5,tile:'m'};
 }
 else if(s.zaTrackedQuestId==='118'){
  if(s.zaSide118Stage===2&&s.district==='lumiose-centrico-route')target={x:15,y:5,tile:'q'};
  else if(s.zaSide118Stage===3&&s.district==='lumiose-vert-sector9')target={x:12,y:10,tile:'z'};
  else if([4,5].includes(s.zaSide118Stage)&&s.district==='lumiose-galerie-lune')target={x:11,y:7,tile:'z'};
 }
 else if(s.zaTrackedQuestId==='75-reward'&&s.district==='lumiose-vert-sector9')target={x:7,y:5,tile:'^'};
 else if(s.zaTrackedQuestId==='28-reward'&&s.district==='lumiose-bleu-sector7'&&!s.zaBleu7Upper)target={x:6,y:11,tile:'t'};
 else if(s.zaTrackedQuestId==='14'&&s.district==='lumiose-south-boulevard'&&!s.zaVert7RoofUpper)target={x:17,y:5,tile:'^'};
 else if(s.zaTrackedQuestId==='67'&&s.district==='lumiose-coulant-route'){
  const found=side67Found(s),remaining=found.length===5?[SIDE67_SPOTS[0]]:SIDE67_SPOTS.slice(1).filter(p=>!found.includes(p.id));
  const lower=s.zaCoulantLower===true,south=s.y>=10;
  const onBank=remaining.filter(p=>p.lower===lower&&(!lower||(p.y>=10)===south));
  const closest=points=>points.reduce((best,p)=>!best||Math.abs(s.x-p.x)+Math.abs(s.y-p.y)<Math.abs(s.x-best.x)+Math.abs(s.y-best.y)?p:best,null);
  if(onBank.length){const p=closest(onBank);target={x:p.x,y:p.y,tile:'^'};}
  else if(remaining.length){const next=remaining[0],bank=lower?south:next.y>=10;target={...closest([{x:3,y:bank?11:5},{x:19,y:bank?11:5}]),tile:'l'};}
 }
 else if(s.zaTrackedQuestId==='39'&&s.district==='lumiose-south-boulevard'&&!s.zaVert7RoofUpper)target={x:8,y:11,tile:'^'};
 else if(s.zaTrackedQuestId==='24'&&s.district==='lumiose-rouge-sector6'&&s.zaAcademyCourtyard===true)target={x:16,y:4,tile:'%'};
 else if(['05','05-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-magenta-sector1')target={x:5,y:11,tile:'#'};
 else if(['06','06-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-bleu-sector4')target={x:7,y:3,tile:'#'};
 else if(['13','13-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-jaune-sector7')target={x:5,y:5,tile:'#'};
 else if(s.zaTrackedQuestId==='09'&&s.district==='lumiose-jaune-sector8'&&[1,2].includes(s.zaSide09Stage))target={x:s.zaSide09Stage===1?16:20,y:5,tile:'#'};
 else if(['09','09-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-north-boulevard'&&[3,4,5].includes(s.zaSide09Stage))target={x:4,y:0,tile:'^'};
 else if(['08','08-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-magenta-sector2'&&(s.zaSide08Stage!==1&&s.zaSide08Stage!==2))target={x:16,y:5,tile:'#'};
 else if(s.zaTrackedQuestId==='08'&&s.zaSide08Stage===1&&s.district==='lumiose-vert-sector4'&&(!s.zaVert4Layer||s.zaVert4Layer==='ground'))target={x:4,y:5,tile:'%'};
 else if(s.zaTrackedQuestId==='08'&&s.zaSide08Stage===2&&s.district==='lumiose-zone5'&&s.zaZone5Upper===true)target={x:19,y:4,tile:'k'};
 else if(['07','07-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-rouge-sector2')target={x:18,y:11,tile:'#'};
 else if(['15','15-reward'].includes(s.zaTrackedQuestId)&&s.district==='lumiose-rouge-sector1')target={x:18,y:11,tile:'#'};
 else if(s.zaTrackedQuestId==='76'&&s.district==='lumiose-rouge-sector6'&&s.zaAcademyCourtyard===true)target={x:6,y:4,tile:'%'};
 else if(s.zaTrackedQuestId==='72'&&s.district==='lumiose-zone11'&&!s.zaZone11Upper)target={x:3,y:10,tile:'u'};
 else if(s.zaTrackedQuestId==='74'&&s.district==='lumiose-vert-sector9')target={x:5,y:6,tile:'q'};
 else if(s.zaTrackedQuestId==='88'&&s.district==='lumiose-magenta-sector8-route')target={x:13,y:14,tile:'n'};
 return target&&s.map?.[target.y]?.[target.x]===target.tile?{x:target.x,y:target.y}:null;
}
