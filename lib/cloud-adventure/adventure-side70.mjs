// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/estival-avenue.html
export function side70Available(s={}){return [1,2,3].includes(s.zaSide70Stage)||s.zaMission20Complete===true||s.zaMission24Started===true||s.zaMission24Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['C','B','A','S'].includes(s.zaRoyaleRank);}
export function side70Spot(s,p){if(s?.district!=='lumiose-rust'||s.interior||p?.tile!=='|'||p.x!==16)return null;return p.y===8?'arbok':p.y===9?'glalie':null;}
export function side70Wins(s={}){const wins=s.zaSide70Wins;if(wins===undefined)return [];if(!Array.isArray(wins)||wins.some(v=>!['arbok','glalie'].includes(v))||new Set(wins).size!==wins.length)return null;return wins;}
