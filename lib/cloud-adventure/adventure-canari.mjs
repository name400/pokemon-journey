// Original bonuses and exchange costs: https://www.serebii.net/legendsz-a/canariplush.shtml
export const CANARI_COLORS=Object.freeze(['blue','red','pink','gold','green']);
export const CANARI_COSTS=Object.freeze([3,5,8]);
export function canariLevel(s,color){
 if(!CANARI_COLORS.includes(color))return 0;
 const value=s?.[`za${color[0].toUpperCase()+color.slice(1)}CanariLevel`];
 if(value==null||value===0)return color==='red'&&s?.zaRedCanariPlush===true?1:0;
 return Number.isInteger(value)&&value>=1&&value<=3?value:-1;
}
export function canariBattleExperience(base,active,hasRedPlush,level){
 const share=active?base:Math.floor(base/2);
 const n=Number.isInteger(level)&&level>=1&&level<=3?level:hasRedPlush===true?1:0;
 return Math.floor(share*(100+5*n)/100);
}
export function canariPrizeMoney(coins,level){const mult=[1000,1150,1299,1500][Number.isInteger(level)&&level>=1&&level<=3?level:0];return Math.floor(coins*mult/1000);}
export function canariCrystalShards(size,level,rng=Math.random){
 const n=Number.isInteger(level)&&level>=1&&level<=3?level:0;
 const ranges=size==='large'?[[6,10],[8,12],[10,14],[14,18]]:[[1,3],[2,4],[3,5],[5,7]], [min,max]=ranges[n];
 const r=Math.max(0,Math.min(.999999999999,rng()));return min+Math.floor(r*(max-min+1));
}
