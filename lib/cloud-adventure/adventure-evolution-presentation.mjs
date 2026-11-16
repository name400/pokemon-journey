/** Presentation derives only from an accepted evolve response, never a save read. */
export function adventureEvolutionPresentation(beforeState,response,issuedRevision,boxId){
  if(!Number.isSafeInteger(issuedRevision)||!Number.isSafeInteger(response?.revision)||response.revision<=issuedRevision)return null;
  if(!Array.isArray(response?.world?.events)||!response.world.events.some(event=>event?.kind==='evolve'))return null;
  const id=boxId??beforeState?.world?.activeId;
  if(typeof id!=='string'||!Array.isArray(beforeState?.box)||!Array.isArray(response?.box))return null;
  const before=beforeState.box.find(mon=>mon?.boxId===id),after=response.box.find(mon=>mon?.boxId===id);
  if(!before||!after||!Number.isFinite(before.id)||!Number.isFinite(after.id)||before.id===after.id)return null;
  return {before:{...before},after:{...after}};
}
