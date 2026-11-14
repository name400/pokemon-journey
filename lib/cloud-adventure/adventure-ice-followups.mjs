// NPC coordinates are provisional on the existing 2D streets.
// https://www.serebii.net/legendsz-a/sidemissions/bergmitesurunavalugg.shtml
// https://www.serebii.net/legendsz-a/sidemissions/showthepowerofaurorus.shtml
export const ICE_FOLLOWUPS=Object.freeze({113:{district:'lumiose-south-boulevard',x:17,y:7,tile:',',name:'Brina'},116:{district:'lumiose-vernal',x:8,y:5,tile:';',name:'Nage'}});
export function iceFollowupAvailable(s,n){return [1,2,3].includes(s?.[`zaSide${n}Stage`])||s?.zaMission37Complete===true||s?.zaMission38Started===true||s?.zaMission38Complete===true||s?.zaMission39Started===true;}
export function iceFollowupSpot(s,p,n){const t=ICE_FOLLOWUPS[n];return !!t&&s?.district===t.district&&!s.interior&&!(n===113&&s.zaVert7RoofUpper===true)&&!(n===116&&(s.zaVernalSlowbroBank===true||s.zaVernalEastRoof===true))&&p?.tile===t.tile&&p.x===t.x&&p.y===t.y;}
export function iceFollowupAt(s,p){const n=s?.district==='lumiose-south-boulevard'?113:s?.district==='lumiose-vernal'?116:0;return n&&iceFollowupSpot(s,p,n)&&iceFollowupAvailable(s,n)?n:0;}
