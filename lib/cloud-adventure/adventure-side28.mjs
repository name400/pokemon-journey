// A completed mission remains accessible when older saves lack story flags.
export function side28Available(s={}){
 return s.zaSide28Won===true||Number(s.zaMission10Stage)>=10||s.zaMission10Complete===true||s.zaMission11Complete===true||s.zaMission37Complete===true||['E','D','C','B','A','S'].includes(s.zaRoyaleRank);
}
export function side28Spot(s,spot){return s?.district==='lumiose-bleu-sector7'&&!s.interior&&s.zaBleu7Upper!==true&&spot?.tile==='t'&&spot.x===6&&spot.y===11;}
