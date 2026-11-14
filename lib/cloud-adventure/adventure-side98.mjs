// https://www.nintendolife.com/guides/pokemon-legends-z-a-how-to-find-a-jumbo-pumpkaboo
// The North Boulevard position is a provisional 2D placement.
export function side98Available(s={}){return [1,2].includes(s.zaSide98Stage)||(s.zaSide98Stage===undefined&&(s.zaMission35Started===true||s.zaMission35Complete===true||s.zaMission37Complete===true||['A','S'].includes(s.zaRoyaleRank)));}
export function side98Spot(s,p){return s?.district==='lumiose-north-boulevard'&&!s.interior&&p?.tile==='.'&&p.x===21&&p.y===6;}
// The Jumbo variety is a form, not the alpha/XL size marker.
export function side98Eligible(m){return m?.id===10029&&m?.speciesId===710&&(m.formId==null||m.formId===10128)&&(m.adventureAlpha===undefined||m.adventureAlpha===false);}
