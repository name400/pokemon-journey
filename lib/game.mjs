// First playable ruleset. Deliberately limited; see STATUS.md.
export const species = [
 {id:1,name:'이상해씨',type:'풀',hp:45,atk:49,def:49,spd:45,moves:['덩굴채찍','몸통박치기','독가루']},
 {id:4,name:'파이리',type:'불꽃',hp:39,atk:52,def:43,spd:65,moves:['불꽃세례','할퀴기','불꽃엄니']},
 {id:7,name:'꼬부기',type:'물',hp:44,atk:48,def:65,spd:43,moves:['물대포','몸통박치기','거품광선']},
 {id:25,name:'피카츄',type:'전기',hp:35,atk:55,def:40,spd:90,moves:['전기쇼크','몸통박치기','10만볼트']},
 {id:133,name:'이브이',type:'노말',hp:55,atk:55,def:50,spd:55,moves:['몸통박치기','물기','전광석화']},
 {id:37,name:'식스테일',type:'불꽃',hp:38,atk:41,def:40,spd:65,moves:['불꽃세례','전광석화','불꽃엄니']},
 {id:54,name:'고라파덕',type:'물',hp:50,atk:52,def:48,spd:55,moves:['물대포','할퀴기','거품광선']},
 {id:43,name:'뚜벅쵸',type:'풀',hp:45,atk:50,def:55,spd:30,moves:['덩굴채찍','독가루','몸통박치기']},
 {id:74,name:'꼬마돌',type:'바위',hp:40,atk:80,def:100,spd:20,moves:['돌떨구기','몸통박치기','물기']},
 {id:92,name:'고오스',type:'고스트',hp:30,atk:35,def:30,spd:80,moves:['핥기','독가루','물기']},
 {id:129,name:'잉어킹',type:'물',hp:20,atk:10,def:55,spd:80,moves:['몸통박치기','물대포']},
 {id:147,name:'미뇽',type:'드래곤',hp:41,atk:64,def:45,spd:50,moves:['용의숨결','몸통박치기','전광석화']}
];
export const moves = {
 '몸통박치기':{type:'노말',power:40,acc:100},'할퀴기':{type:'노말',power:40,acc:100},'전광석화':{type:'노말',power:40,acc:100,priority:1},
 '덩굴채찍':{type:'풀',power:45,acc:100},'불꽃세례':{type:'불꽃',power:40,acc:100,burn:.1},'불꽃엄니':{type:'불꽃',power:65,acc:95,burn:.1},
 '물대포':{type:'물',power:40,acc:100},'거품광선':{type:'물',power:65,acc:100},'전기쇼크':{type:'전기',power:40,acc:100,paralyze:.1},'10만볼트':{type:'전기',power:90,acc:100,paralyze:.1},
 '돌떨구기':{type:'바위',power:50,acc:90},'물기':{type:'악',power:60,acc:100},'핥기':{type:'고스트',power:30,acc:100,paralyze:.3},'용의숨결':{type:'드래곤',power:60,acc:100,paralyze:.3},'독가루':{type:'독',power:0,acc:75,poison:1}
};
const chart={풀:{물:2,바위:2,불꽃:.5,풀:.5,드래곤:.5},불꽃:{풀:2,물:.5,불꽃:.5,바위:.5,드래곤:.5},물:{불꽃:2,바위:2,물:.5,풀:.5,드래곤:.5},전기:{물:2,풀:.5,전기:.5,드래곤:.5},바위:{불꽃:2},고스트:{고스트:2,노말:0},악:{고스트:2},노말:{고스트:0,바위:.5},독:{풀:2,고스트:.5,바위:.5},드래곤:{드래곤:2}};
export const stages=[{name:'숲길의 트레이너',kind:'일반',ids:[43]},{name:'바위 체육관',kind:'체육관',ids:[74,74]},{name:'물가의 트레이너',kind:'일반',ids:[54]},{name:'물 체육관',kind:'체육관',ids:[7,54]},{name:'전기의 관문',kind:'체육관',ids:[25,133]},{name:'사천왕의 시험',kind:'사천왕',ids:[92,147,37]},{name:'챔피언의 도전',kind:'챔피언',ids:[1,4,7]}];
export const pick=(a,n=1)=>[...a].sort(()=>Math.random()-.5).slice(0,n);
export const makeMon=(id,level=5)=>{const s=species.find(x=>x.id===id);return {...s,level,maxHp:Math.floor(s.hp*1.25+level*3),hp:Math.floor(s.hp*1.25+level*3),status:null,moves:[...s.moves]};};
export const effectiveness=(attack,defend)=>chart[attack]?.[defend]??1;
export function attack(a,d,name,rng=Math.random){const m=moves[name]; let lines=[]; if(!m)return [`기술을 사용할 수 없다.`]; if(a.status==='마비'&&rng()<.25)return [`${a.name}은(는) 마비로 움직이지 못했다!`]; if(rng()*100>=m.acc)return [`${a.name}의 ${name}! 빗나갔다.`]; let eff=effectiveness(m.type,d.type); if(m.power){let raw=(((2*a.level/5+2)*m.power*(a.atk+(a.level*2))/(d.def+(d.level*2)))/50+2)*(a.type===m.type?1.5:1)*eff*(a.status==='화상'?.5:1)*(.85+rng()*.15);let dmg=eff===0?0:Math.max(1,Math.floor(raw));d.hp=Math.max(0,d.hp-dmg);lines.push(`${a.name}의 ${name}! ${dmg} 피해${eff>1?' · 효과가 굉장했다!':eff===0?' · 효과가 없다.':eff<1?' · 효과가 별로다.':''}`);}else lines.push(`${a.name}의 ${name}!`);
 for(const [key,label] of [['poison','독'],['burn','화상'],['paralyze','마비']]) if(m[key]&&!d.status&&d.hp>0&&rng()<m[key]&&!(label==='독'&&d.type==='독')&&!(label==='화상'&&d.type==='불꽃')&&!(label==='마비'&&d.type==='전기')){d.status=label;lines.push(`${d.name}은(는) ${label} 상태가 되었다!`);} return lines;}
export function turn(player,enemy,move,rng=Math.random){let p=structuredClone(player),e=structuredClone(enemy),log=[];const options=e.moves.map(name=>({name,score:(moves[name].power||20)*effectiveness(moves[name].type,p.type)*(moves[name].type===e.type?1.5:1)})).sort((a,b)=>b.score-a.score); const em=options[0].name; const first=(moves[move].priority||0)>(moves[em].priority||0)||((moves[move].priority||0)===(moves[em].priority||0)&&(p.spd*(p.status==='마비'?.5:1)>=e.spd*(e.status==='마비'?.5:1))); const order=first?[[p,e,move],[e,p,em]]:[[e,p,em],[p,e,move]];for(const [a,d,m] of order){if(a.hp>0&&d.hp>0)log.push(...attack(a,d,m,rng));} for(const x of [p,e])if(x.hp>0&&(x.status==='독'||x.status==='화상')){const damage=Math.max(1,Math.floor(x.maxHp/8));x.hp=Math.max(0,x.hp-damage);log.push(`${x.name}은(는) ${x.status}으로 ${damage} 피해를 입었다.`)}return {player:p,enemy:e,log};}
