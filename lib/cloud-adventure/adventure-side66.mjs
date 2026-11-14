// The district is not yet mapped separately; both blocked-wall positions are
// provisional and do not alter existing walkable tiles.
// https://www.serebii.net/legendsz-a/sidemissions/investigatingwithshuppet.shtml
export function side66Available(s={}){return [1,2,3].includes(s.zaSide66Stage)||(s.zaSide66Stage===undefined&&(s.zaMission20Complete===true||s.zaMission30Started===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['C','B','A','S'].includes(s.zaRoyaleRank)));}
export function side66Spot(s,p){if(s?.interior||!p)return null;if(s.district==='lumiose-bleu-plaza-route'&&p.tile==='#'&&p.x===4&&p.y===6)return 'rancun';if(s.district==='lumiose-vert-sector3'&&p.tile==='#'&&p.x===19&&p.y===5&&s.zaSide66Stage===2)return 'house';return null;}
export function side66Eligible(m){return m?.id===353&&m?.speciesId===353;}
