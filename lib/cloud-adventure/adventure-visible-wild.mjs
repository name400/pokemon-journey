// Suppress a field encounter only while the player occupies its tile.
// Callers supply the active layer, time, weather and spent filters.
export function findVisibleWild(s,encounters,matches){
 return encounters.find(p=>matches(p)&&!(s.x===p.x&&s.y===p.y))||null;
}
// Do not reinterpret future or malformed per-zone encounter ledgers.
export function knownVisibleWildLedger(ledger){return ledger===undefined||!!ledger&&typeof ledger==='object'&&!Array.isArray(ledger)&&!Object.hasOwn(ledger,'version')&&Object.values(ledger).every(value=>typeof value==='boolean');}
