// https://www.serebii.net/legendsz-a/sidemissions/wondrousself-healingpokemon.shtml
export function side109Available(s={}){return [1,2,3].includes(s.zaSide109Stage)||s.zaMission37Complete===true||s.zaMission38Started===true||s.zaMission38Complete===true||s.zaMission39Started===true;}
export function side109Spot(s,p){return s?.district==='lumiose-vert-street-route'&&!s.interior&&p?.tile==='H'&&p.x===10&&p.y===13;}
