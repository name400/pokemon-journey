// Z-A rogue battles offer a retry at the last 75%, 50%, or 25% HP threshold.
// The turn-based approximation records only these checkpoints, not the full
// real-time battle state. Invalid or unknown legacy values are ignored.
const KEYS=new Set(['slowbro','camerupt','victreebel','mission27-froslass','mission28-altaria','mission29-venusaur','mission32-dragonite','mission33-tyranitar','mission34-starmie']);
export function rogueRetryPercent(s,key){const n=s?.zaRogueMegaCheckpoints?.[key];return KEYS.has(key)&&[25,50,75].includes(n)?n:100;}
export function saveRogueRetry(s,key,hp,maxHp){
 if(!KEYS.has(key)||!Number.isFinite(hp)||!Number.isFinite(maxHp)||maxHp<=0||hp<0||hp>maxHp)return 100;
 const next=Math.max(25,Math.min(100,Math.ceil((hp/maxHp)*4)*25)),best=Math.min(rogueRetryPercent(s,key),next);
 if(best<100)s.zaRogueMegaCheckpoints={...(s.zaRogueMegaCheckpoints||{}),[key]:best};return best;
}
export function clearRogueRetry(s,key){if(!KEYS.has(key)||!s.zaRogueMegaCheckpoints||typeof s.zaRogueMegaCheckpoints!=='object')return;const checkpoints={...s.zaRogueMegaCheckpoints};delete checkpoints[key];s.zaRogueMegaCheckpoints=checkpoints;}
export function rogueRetryActions(s,key,action,label){const percent=rogueRetryPercent(s,key);return percent<100?{actions:[{action,label:`${label} · HP ${percent}%부터`},{action:`${action}Restart`,label:'처음부터 다시 배틀'}]}:{action,label};}
