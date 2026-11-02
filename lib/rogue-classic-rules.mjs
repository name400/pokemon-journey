// Independently implemented formulas cross-checked against the pinned upstream rule version.
const MAX_LEVEL=100;
const strengths=[.95,1,1.05,1.12,1.22,1.24,1.25];
export const RIVAL_WAVES=Object.freeze([8,25,55,95,145,195]);
export const EVIL_WAVES=Object.freeze({35:'grunt-1',62:'grunt-2',64:'grunt-3',66:'admin-1',112:'grunt-4',114:'admin-2',115:'leader',164:'admin-3',165:'leader-rematch'});
export const ELITE_WAVES=Object.freeze([182,184,186,188]);
function checkWave(wave){if(!Number.isInteger(wave)||wave<1||wave>200)throw Error('클래식 웨이브는 1–200입니다.');return wave;}
export function classicBaseLevel(wave){checkWave(wave);return 1+wave/2+(wave/25)**2;}
export function classicLevelCap(wave,{userLimit=true}={}){const end=Math.ceil(checkWave(wave)/10)*10;const level=2*Math.ceil(classicBaseLevel(end)*1.2/2)+2;return userLimit?Math.min(MAX_LEVEL,level):level;}
export function classicWildLevel(wave,rng=Math.random,{boss=wave%10===0,userLimit=true}={}){
 const base=classicBaseLevel(wave);let level;
 if(boss){const n=Math.floor(base*1.2);level=wave===200?Math.ceil(n/25)*25:n+Math.round((rng()*2-1)*Math.floor(wave/10));}
 else{const v=10/wave;let sum=0;for(let i=v;i>0;i--)sum+=rng();level=Math.max(1,Math.round(base+Math.abs(sum/v)));}
 return userLimit?Math.min(MAX_LEVEL,Math.max(1,level)):level;
}
export function classicTrainerLevel(wave,strength=3,{userLimit=true}={}){
 if(!Number.isInteger(strength)||strength<0||strength>6)throw Error('트레이너 파티 강도를 확인하세요.');let multiplier=strengths[strength],offset=0;
 if(strength<4){multiplier=Math.min(multiplier+.025*Math.floor(wave/25),1.225);offset=-Math.floor(wave/50*(4-strength));}
 const level=Math.ceil(classicBaseLevel(wave)*multiplier)+offset;return userLimit?Math.max(1,Math.min(MAX_LEVEL,level)):level;
}
export function classicStoryEvent(run,wave=run.wave){
 checkWave(wave);if(wave===200)return {kind:'final',phase:1,key:'eternatus'};
 const rival=RIVAL_WAVES.indexOf(wave);if(rival>=0)return {kind:'rival',phase:rival+1};
 const elite=ELITE_WAVES.indexOf(wave);if(elite>=0)return {kind:'elite',member:elite};
 if(wave===190)return {kind:'champion'};
 if(wave===5)return {kind:'youngster'};
 if(Object.hasOwn(EVIL_WAVES,wave))return {kind:'evil',event:EVIL_WAVES[wave]};
 const start=run.gymStart===30?30:20;if(wave>=start&&(wave-start)%30===0&&wave<=180)return {kind:'gym',index:(wave-start)/30};
 return {kind:'wild',boss:wave%10===0};
}
export function classicWaveMoney(wave,multiplier=1){
 checkWave(wave);if(!Number.isFinite(multiplier)||multiplier<0)throw Error('보상 금액 배율을 확인하세요.');const q=Math.ceil(wave/10)-1,p=(wave-1)%10+1;
 const amount=((q+1+.75+p/10)*100)**(1+.005*q);return Math.floor(amount*multiplier/10)*10;
}
export function classicRerollCost(wave,rerolls=0,{lockedTiers=null,costMultiplier=1}={}){
 checkWave(wave);if(!Number.isInteger(rerolls)||rerolls<0||rerolls>30)throw Error('리롤 횟수를 확인하세요.');const tierCost=[50,125,300,750,2000];
 const base=lockedTiers?lockedTiers.reduce((sum,tier)=>{if(!Number.isInteger(tier)||tier<0||tier>4)throw Error('보상 등급을 확인하세요.');return sum+tierCost[tier];},0):250;
 return Math.round(base*Math.ceil(wave/10)*2**rerolls*costMultiplier);
}
export function classicRewardTier(rng=Math.random,luck=0){
 const roll=Math.floor(rng()*1024);let tier=roll===0?4:roll<13?3:roll<61?2:roll<256?1:0;
 const odds=Math.max(4,Math.floor(128/((Math.max(0,Math.min(14,luck))+4)/4)));
 while(tier<4&&Math.floor(rng()*odds)<4)tier++;return tier;
}
export function classicLuck(party){return Math.min(14,party.filter(p=>p.hp>0).reduce((sum,p)=>sum+(Number.isFinite(p.luck)?Math.min(3,Math.max(0,p.luck)):p.shiny?Math.max(1,Math.min(3,(p.variant||0)+1)):0)+(Number.isFinite(p.fusionLuck)?Math.min(3,Math.max(0,p.fusionLuck)):p.fusionShiny?Math.max(1,Math.min(3,(p.fusionVariant||0)+1)):0),0));}
export function classicExperienceValue(mon,{trainer=false}={}){const value=(mon.baseExperience||0)*mon.level/5+1;return trainer?Math.floor(value*1.5):value;}
export function classicExperienceShares(party,participantIds,exp,wave,{expShare=0,multiParticipant=0,expBalance=0,globalCharms=[],personalCharms=()=>[],globalCharmMultiplier=1,perPokemonMultiplier=()=>1}={}){
 const participants=new Set(participantIds),count=participants.size,cap=classicLevelCap(wave);if(!count)return party.map(()=>0);
 const personal=party.map(p=>{if(p.hp<=0||p.level>=cap)return 0;let multiplier=participants.has(p.boxId)?1/count+(count>1?.2*multiParticipant:0):.2*expShare/count;if(p.pokerus)multiplier*=1.5;let value=exp*multiplier*perPokemonMultiplier(p);for(const charm of personalCharms(p))value=Math.floor(value*(1+charm.count*charm.boost));return Math.floor(value);});
 if(expBalance){const eligible=party.map((p,i)=>({p,i})).filter(({p})=>p.hp>0&&p.level<cap);const mean=Math.floor(eligible.reduce((n,{p})=>n+p.level,0)/Math.max(1,eligible.length));const recipients=eligible.filter(({p})=>p.level<=mean),total=personal.reduce((a,b)=>a+b,0),split=Math.floor(total/Math.max(1,recipients.length)),weight=.2*Math.min(4,expBalance);for(const {p,i}of eligible)personal[i]+=(p.level<=mean?split-personal[i]:-personal[i])*weight;}
 return personal.map(value=>{for(const charm of globalCharms)value=Math.floor(value*(1+charm.count*charm.boost));return Math.floor(value*globalCharmMultiplier);});
}
