import {isAdventureBattleOnlyForm} from './adventure-battle-forms.mjs';
import {species} from './game.mjs';
import {ADVENTURE_STORE_VERSION} from './adventure-economy.mjs';

// Temporary battle forms cannot be permanently obtained from these capsules.
export const isTemporaryBattleForm=mon=>isAdventureBattleOnlyForm(mon)||/(?:-mega(?:-[a-z0-9]+)?|-gmax|-primal|-ultra|-eternamax|-battle-bond|-ash|-complete|-crowned(?:-[a-z]+)?|-hero|-school|-zen)$/i.test(mon.identifier||'');
function commonWeight(mon){
 const total=['hp','atk','def','spa','spdDef','spd'].reduce((sum,key)=>sum+Number(mon[key]||0),0);
 return total>=600?.15:total>=520?.6:total>=460?2:total>=360?6:10;
}
function makeCapsule(price,name,eligible,legendaryChance){
 const ordinary=eligible.filter(mon=>!mon.legendary),legendary=eligible.filter(mon=>mon.legendary),ordinaryTotal=ordinary.reduce((sum,mon)=>sum+commonWeight(mon),0);
 if(!ordinary.length||!ordinaryTotal||(legendaryChance>0&&!legendary.length))throw Error('캡슐 후보 구성을 확인하세요.');
 const pool=eligible.map(mon=>mon.id),weights=eligible.map(mon=>mon.legendary?legendaryChance/legendary.length:(1-legendaryChance)*commonWeight(mon)/ordinaryTotal);
 const featured=[ordinary[0],ordinary[Math.floor(ordinary.length/2)],legendary[0]||ordinary.at(-1)].filter(Boolean).map(mon=>mon.id);
 return {price,name,pool,weights,legendaryChance,featured,version:ADVENTURE_STORE_VERSION};
}
const eligible=species.filter(mon=>!isTemporaryBattleForm(mon));
const ordinary=eligible.filter(mon=>!mon.legendary&&mon.defaultForm),legendary=eligible.filter(mon=>mon.legendary&&mon.defaultForm);
export const ADVENTURE_CAPSULES={
 meadow:makeCapsule(1200,'일반 탐험 캡슐',ordinary,0),
 blaze:makeCapsule(1800,'불꽃과 번개 캡슐',ordinary.filter(mon=>mon.types.some(type=>['불꽃','전기'].includes(type))),0),
 rare:makeCapsule(6000,'전설 탐색 캡슐',[...ordinary,...legendary],.02),
 all:makeCapsule(5000,'다양한 모습 캡슐',eligible,.005),
};
export function adventureCapsuleChance(pack,index){const total=pack.weights.reduce((sum,weight)=>sum+weight,0);return total>0?(pack.weights[index]||0)/total:0;}
