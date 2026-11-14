// Suppress a field encounter only while the player occupies its tile.
// Callers supply the active layer, time, weather and spent filters.
export function findVisibleWild(s,encounters,matches){
 return encounters.find(p=>matches(p)&&!(s.x===p.x&&s.y===p.y))||null;
}
