// The two alley items are documented; exact positions on this 2D map are draft.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/vert-sector-9.html
export const VERT9_ALLEY_ITEMS=Object.freeze([
 Object.freeze({id:'alley-repeat',tile:'i',x:10,y:3,name:'리피트볼',kind:'repeatball'}),
 Object.freeze({id:'alley-super',tile:'j',x:12,y:5,name:'좋은상처약',kind:'super_potions'}),
]);
export function vert9AlleyItem(s,spot){
 if(s?.district!=='lumiose-vert-sector9'||s.interior)return null;
 return VERT9_ALLEY_ITEMS.find(p=>p.tile===spot?.tile&&p.x===spot.x&&p.y===spot.y&&!(Array.isArray(s.zaVert9AlleyItems)&&s.zaVert9AlleyItems.includes(p.id)))||null;
}
