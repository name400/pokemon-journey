// BRAVELY's vest and ribbon blouse: item names, colors and price are sourced;
// the field sprite is a small original approximation of the full outfit.
// https://bulbapedia.bulbagarden.net/wiki/List_of_clothing_in_Pok%C3%A9mon_Legends:_Z-A
export const VERNAL_TOPS=Object.freeze([
 Object.freeze({id:'bravely-vest-wine',name:'베스트와 리본 블라우스 · 와인 레드',price:8000,color:'#9d3f50'}),
 Object.freeze({id:'bravely-vest-blue',name:'베스트와 리본 블라우스 · 블루',price:8000,color:'#42699b'}),
 Object.freeze({id:'bravely-vest-green',name:'베스트와 리본 블라우스 · 그린',price:8000,color:'#58845b'}),
 Object.freeze({id:'bravely-vest-black',name:'베스트와 리본 블라우스 · 블랙',price:8000,color:'#313640'}),
 Object.freeze({id:'bravely-vest-gray',name:'베스트와 리본 블라우스 · 그레이',price:8000,color:'#818589'})
]);
// Story-gift silhouette is a 2D approximation, not the original artwork.
export const ASAMI_OUTFIT=Object.freeze({id:'asami-formal',name:'Asami의 정장 · 초안',color:'#384052',style:'formal'});
export const ADVENTURE_TOPS=Object.freeze([...VERNAL_TOPS,ASAMI_OUTFIT]);
export function clothingShopUnlocked(s){return s?.zaBureauVisited===true||s?.zaEmmaMet===true||s?.zaMission05Complete===true||Number(s?.zaMission05Stage)>=7||s?.zaMission06Started===true||/^[A-X]$/.test(s?.zaRoyaleRank||'');}
export function clothingShopAt(s,spot){return s?.area===3&&!s.interior&&s.district==='lumiose-vernal'&&spot?.x===7&&spot?.y===5&&spot?.tile==='o';}
export function ownedVernalTops(s){const owned=Array.isArray(s?.zaClothingOwned)?s.zaClothingOwned.filter(id=>VERNAL_TOPS.some(top=>top.id===id)):[];if((Number.isInteger(s?.zaMission26Stage)&&s.zaMission26Stage>=1)||s?.zaMission26Complete===true)owned.push(ASAMI_OUTFIT.id);return owned;}
export function equippedVernalTop(s){return ADVENTURE_TOPS.find(top=>top.id===s?.zaClothingTop&&ownedVernalTops(s).includes(top.id))||null;}
