// Odette requests a Skiddo from the party on Vernal Avenue. The NPC's 2D
// location is provisional. https://www.serebii.net/legendsz-a/sidemissions/skiddo%27sfragrantleaves.shtml
export function side10Available(s){
 return s?.zaMission07Started===true||s?.zaMission07Complete===true||/^[A-W]$/.test(s?.zaRoyaleRank||'');
}
export function side10Spot(s,spot){
 return !s?.interior&&!s?.zaVernalEastRoof&&!s?.zaVernalSlowbroBank&&s?.district==='lumiose-vernal'&&spot?.tile==='^'&&spot.x===3&&spot.y===0;
}
