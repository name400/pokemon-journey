import {adventurePokemonSize} from './adventure-size.mjs';
// https://www.serebii.net/legendsz-a/sidemissions/anextra-largegogoat.shtml
// Alpha Pokémon are XL: https://www.serebii.net/legendsz-a/pokemonsize.shtml
// Never infer size from the appearance or from a different species/form.
export function side63Available(s={}){return [1,2].includes(s.zaSide63Stage)||(s.zaSide63Stage===undefined&&(Number(s.zaMission20Stage)>=5||s.zaMission20Complete===true||s.zaMission30Started===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['C','B','A','S'].includes(s.zaRoyaleRank)));}
export function side63Spot(s,p){return s?.district==='lumiose-magenta-sector8-route'&&!s.interior&&p?.tile==='#'&&p.x===4&&p.y===5;}
export function side63Eligible(m){return m?.id===673&&m?.speciesId===673&&adventurePokemonSize(m)==='XL';}
