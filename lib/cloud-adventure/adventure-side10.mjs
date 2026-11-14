// Odette requests a Skiddo from the party on Vernal Avenue. The NPC's 2D
// location is provisional. https://www.serebii.net/legendsz-a/sidemissions/skiddo%27sfragrantleaves.shtml
export function side10Available(s){
 return s?.zaMission07Started===true||s?.zaMission07Complete===true||/^[A-W]$/.test(s?.zaRoyaleRank||'');
}
export function side10Spot(s,spot){
 return !s?.interior&&!s?.zaVernalEastRoof&&!s?.zaVernalSlowbroBank&&s?.district==='lumiose-vernal'&&spot?.tile==='^'&&spot.x===3&&spot.y===0;
}
// Vanillite's Fragrant Snow requires Odette's Skiddo request and Mission 15.
// https://bulbapedia.bulbagarden.net/wiki/Mission_(Legends:_Z-A)
export function side44Available(s={}){
 return [1,2,3].includes(s.zaSide44Stage)||(s.zaSide10Complete===true&&(s.zaMission15Complete===true||Number(s.zaMission15Stage)>=4||Number(s.zaMission19Stage)>=1||['D','C','B','A','S'].includes(s.zaRoyaleRank)));
}
