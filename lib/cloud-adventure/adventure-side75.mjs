// Touri is in Vert Sector 9's court; this compressed map uses a provisional tile.
// https://www.serebii.net/legendsz-a/sidemissions/someunusualpokemon.shtml
// https://www.thonky.com/pokemon-legends-z-a/side-mission-075-some-unusual-pokemon
export function side75Available(s={}){return s.zaSide75Won===true||s.zaMission26Started===true||s.zaMission26Complete===true||s.zaMission30Started===true||s.zaMission37Complete===true||['B','A','S'].includes(s.zaRoyaleRank);}
export function side75Spot(s,spot){return !s?.interior&&s?.district==='lumiose-vert-sector9'&&spot?.tile==='^'&&spot.x===7&&spot.y===5;}
