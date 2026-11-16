export const ADVENTURE_IV_STATS=Object.freeze([['hp','HP'],['atk','공격'],['def','방어'],['spa','특수공격'],['spd','특수방어'],['spe','스피드']]);
export function adventureJudgeAvailable(w){return w?.zaMission37Complete===true||w?.zaMission38Started===true||w?.zaMission38Complete===true||w?.zaMission39Started===true;}
export function adventureJudgeStat(mon,key){
 if(!ADVENTURE_IV_STATS.some(([id])=>id===key))return null;
 const iv=mon?.ivs?.[key];
 if(!Number.isInteger(iv)||iv<0||iv>31)return '기록 확인 불가';
 if(mon?.adventureHyperTrained?.[key]===true)return '대단히 단련함';
 return iv===31?'최고':iv===30?'훌륭함':iv>=26?'매우 좋음':iv>=16?'꽤 좋음':iv>=1?'보통':'아쉬움';
}
