// Personal legacy history records the floor reached, while global records are
// only created from new server-tracked, ranking-eligible wins.
export function classicPersonalBest(classic){
 const runs=[...(classic?.slots||[]),...(classic?.history||[])];
 const waves=runs.map(r=>r?.wave).filter(n=>Number.isSafeInteger(n)&&n>=1&&n<=200);
 return waves.length?Math.max(...waves):null;
}
export function verifiedClassicWin(classic){
 const run=classic?.slots?.[classic.activeSlot];if(!run||run.rankingEligible!==true||typeof run.id!=='string'||!run.id||!Array.isArray(run.coinRewards))return null;
 const waves=run.coinRewards.filter(n=>Number.isSafeInteger(n)&&n>=1&&n<=200);return waves.length?{wave:Math.max(...waves),runId:run.id}:null;
}
