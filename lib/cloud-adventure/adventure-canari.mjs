// One Red Canari Plush gives a passive 5% battle experience bonus.
// https://www.serebii.net/legendsz-a/canariplush.shtml
export function canariBattleExperience(base, active, hasRedPlush){
 const share=active?base:Math.floor(base/2);
 return hasRedPlush===true?Math.floor(share*105/100):share;
}
