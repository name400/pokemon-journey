// Status medicine uses the simulator's status codes and the saved Korean names.
// https://www.serebii.net/pokearth/lumiosecity/magentadistrict.shtml
export const SPECIFIC_STATUS_MEDICINES=Object.freeze([
 Object.freeze({id:'paralyzeheal',name:'마비치료제',status:'par',saved:'마비',sprite:'paralyze-heal'}),
 Object.freeze({id:'burnheal',name:'화상치료제',status:'brn',saved:'화상',sprite:'burn-heal'}),
 Object.freeze({id:'iceheal',name:'얼음치료제',status:'frz',saved:'얼음',sprite:'ice-heal'}),
 Object.freeze({id:'awakening',name:'잠깨는약',status:'slp',saved:'잠듦',sprite:'awakening'}),
]);
export function specificStatusMedicine(id){return SPECIFIC_STATUS_MEDICINES.find(item=>item.id===id)||null;}
export function canCureSpecificStatus(id,status){const item=specificStatusMedicine(id);return !!item&&(status===item.status||status===item.saved);}
