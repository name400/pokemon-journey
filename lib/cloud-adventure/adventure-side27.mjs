// The original opens this request after the rogue Mega incidents are revealed.
// Later progress is accepted for saves created before this quest was added.
export function side27Available(s){return Number(s?.zaMission10Stage)>=10||s?.zaMission10Complete===true||s?.zaMission11Complete===true||['E','D','C','B','A','S'].includes(s?.zaRoyaleRank);}
export const FOSSILS=Object.freeze({jaw:{item:'jawfossil',name:'턱화석',species:696,price:20000},sail:{item:'sailfossil',name:'지느러미화석',species:698,price:20000},amber:{item:'oldamber',name:'비밀의호박',species:142,price:30000}});
export function side27Reg(s,p){return s?.district==='lumiose-floral'&&s.interior==='lumioseLab2'&&p?.tile==='n'&&p.x===7&&p.y===7;}
export function side27Shop(s,p){return s?.district==='lumiose-vernal'&&!s.interior&&!s.zaVernalSlowbroBank&&!s.zaVernalEastRoof&&p?.tile==='t'&&p.x===9&&p.y===3;}
