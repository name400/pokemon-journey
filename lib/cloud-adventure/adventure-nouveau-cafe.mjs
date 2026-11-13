// Nouveau Café is next to Centrico Plaza on Vert Street. The 2D position is
// provisional; keep the legacy shared Hotel Richissime interaction for saves.
// https://bulbapedia.bulbagarden.net/wiki/Nouveau_Caf%C3%A9
export const NOUVEAU_SPOT=Object.freeze({x:7,y:6});
export const NOUVEAU_ARRIVAL=Object.freeze({x:7,y:7,facing:'up'});
export const NOUVEAU_DRINKS=Object.freeze([
 Object.freeze({id:'nouveauEmber',name:'불꽃세례 블렌드',price:250}),
 Object.freeze({id:'nouveauFlamethrower',name:'화염방사 블렌드',price:250}),
 Object.freeze({id:'nouveauFireBlast',name:'불대문자 블렌드',price:250}),
 Object.freeze({id:'nouveauBurnUp',name:'불사르기 블렌드',price:300}),
 Object.freeze({id:'nouveauPanchamomile',name:'판짱 캐모마일 티',price:250}),
 Object.freeze({id:'nouveauWooloolong',name:'우롱티',price:300}),
 Object.freeze({id:'nouveauRoserade',name:'로즈레이드 티',price:350}),
]);
export function nouveauCafeUnlocked(s){return s?.zaMission05CafeSeen===true||s?.zaMission05Complete===true||Number(s?.zaMission05Stage)>5||s?.zaMission06Started===true||/^[A-X]$/.test(s?.zaRoyaleRank||'');}
export function nouveauCafeSpot(s,spot){return !s?.interior&&s?.district==='lumiose-centrico-route'&&spot?.tile==='q'&&spot.x===NOUVEAU_SPOT.x&&spot.y===NOUVEAU_SPOT.y;}
