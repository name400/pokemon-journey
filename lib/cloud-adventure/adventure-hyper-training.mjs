import {configure,defaultIVs,statKeys} from '../pokemon-config.mjs';

export function hyperTrainAdventure(mon,item,stat){
 if(!Number.isInteger(mon.level)||mon.level<50)throw Error('레벨 50 이상의 포켓몬만 특훈할 수 있습니다.');
 if(!['bottlecap','goldbottlecap'].includes(item))throw Error('병뚜껑을 확인하세요.');
 if(item==='bottlecap'&&!statKeys.includes(stat))throw Error('특훈할 능력치를 선택하세요.');
 const ivs={...defaultIVs(),...(mon.ivs||{})};if(statKeys.some(k=>!Number.isInteger(ivs[k])||ivs[k]<0||ivs[k]>31))throw Error('포켓몬의 개체값을 확인하세요.');
 const current=mon.adventureHyperTrained||{},eligible=statKeys.filter(k=>ivs[k]<31&&current[k]!==true),chosen=item==='goldbottlecap'?eligible:eligible.filter(k=>k===stat);
 if(!chosen.length)throw Error('특훈할 수 있는 능력치가 없습니다.');
 const trained={...current};for(const key of chosen)trained[key]=true;
 const next=configure({...mon,adventureHyperTrained:trained},{hp:mon.hp});next.hp=mon.hp<=0?0:Math.min(next.maxHp,mon.hp+Math.max(0,next.maxHp-mon.maxHp));
 return {mon:next,stats:chosen};
}
