// Barnie is on a Saison Canal dock east of the Magenta Pokémon Center.
// https://www.thonky.com/pokemon-legends-z-a/side-mission-037-binacle-by-the-boatload
export function side37Available(s={}){return [1,2,3].includes(s.zaSide37Stage)||Number(s.zaMission14Stage)>=1||Number(s.zaMission15Stage)>=1||['E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side37Spot(s,p){return s?.district==='lumiose-magenta-street'&&!s.interior&&p?.tile==='^'&&p.x===7&&p.y===5;}
