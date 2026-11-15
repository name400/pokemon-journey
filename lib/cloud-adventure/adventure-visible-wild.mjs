// Suppress a field encounter only while the player occupies its tile.
// Callers supply the active layer, time, weather and spent filters.
export function findVisibleWild(s,encounters,matches){
 return encounters.find(p=>matches(p)&&!(s.x===p.x&&s.y===p.y))||null;
}
// Land encounters can be hidden under a player without changing water collision.
// Aquatic encounters retain their established water-tile behaviour.
export function landWildNotOccupied(s,p){return p.water===true||!(s.x===p.x&&s.y===p.y);}
export function findVisibleLandWild(s,encounters,matches){
 return encounters.find(p=>matches(p)&&landWildNotOccupied(s,p))||null;
}
// Do not reinterpret future or malformed per-zone encounter ledgers.
export function knownVisibleWildLedger(ledger){return ledger===undefined||!!ledger&&typeof ledger==='object'&&!Array.isArray(ledger)&&!Object.hasOwn(ledger,'version')&&Object.values(ledger).every(value=>typeof value==='boolean');}
