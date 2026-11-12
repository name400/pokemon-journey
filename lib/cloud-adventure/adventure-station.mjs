// Station exterior is accessible; the original station cannot be re-entered.
// https://bulbapedia.bulbagarden.net/wiki/Gare_de_Lumiose
export function isStationSpot(s,spot){return s?.area===3&&!s.interior&&!s.expedition&&s.district==='lumiose-vert-street-route'&&spot?.tile==='u'&&spot.x===8&&spot.y===5;}
export function stationDialogue(s){const count=Number.isInteger(s?.zaStationLeaveConfirm)?s.zaStationLeaveConfirm:0;return {name:'미르역 · Gare de Lumiose (배치 초안)',text:count===0?'공항으로 가는 열차가 있다. 도시를 떠나볼까?':count===1?'정말 미르시티를 떠날까?':'정말로 모두와 헤어지고 떠날까?',actions:[{action:'stationLeave',label:count===0?'떠나기':count===1?'계속 떠나기':'정말 떠나기'},{action:'stationStay',label:'미르시티에 남기'}]};}
