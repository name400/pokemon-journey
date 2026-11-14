// Source: https://www.thonky.com/pokemon-legends-z-a/side-mission-105-trevenant-the-haunted-elder-tree
// Source: https://www.thonky.com/pokemon-legends-z-a/side-mission-115-tyrantrums-furious-jaws
// Both director positions are provisional coordinates within the described areas.
export const DIRECTOR_FOLLOWUPS=Object.freeze({
 105:{district:'lumiose-rouge-sector6',x:17,y:9,tile:',',species:709,name:'대로트'},
 115:{district:'lumiose-autumnal-approach',x:17,y:8,tile:',',species:697,name:'견고라스'},
});
export function directorFollowupAvailable(s,n){const stage=s?.[`zaSide${n}Stage`];if([1,2,3].includes(stage))return true;if(n===105)return s?.zaSide55Stage===3&&(Number(s.zaMission35Stage)>=7||s.zaMission35Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank));if(n===115)return s?.zaSide105Stage===3&&(s.zaMission37Complete===true||s.zaMission38Started===true||s.zaMission38Complete===true||s.zaMission39Started===true);return false;}
export function directorFollowupSpot(s,p,n){const target=DIRECTOR_FOLLOWUPS[n];return !!target&&s?.district===target.district&&!s.interior&&p?.tile===target.tile&&p.x===target.x&&p.y===target.y;}

export function directorFollowupAt(s,p){const n=s?.district==='lumiose-rouge-sector6'?105:s?.district==='lumiose-autumnal-approach'?115:0;return n&&directorFollowupSpot(s,p,n)&&directorFollowupAvailable(s,n)?n:0;}
