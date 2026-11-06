// Café Woof menu prices: https://www.serebii.net/legendsz-a/cafes.shtml
export const CAFE_WOOF_DRINKS=Object.freeze([
 {action:'woofNatural',name:'Natural Blend',price:800},
 {action:'woofHeart',name:'Heart Blend',price:1000},
 {action:'woofStar',name:'Star Blend',price:1000},
 {action:'woofDiamond',name:'Diamond Blend',price:1000},
 {action:'woofDebutante',name:'Debutante Blend',price:1200},
 {action:'woofMatron',name:'Matron Blend',price:1200},
 {action:'woofDandy',name:'Dandy Blend',price:1200},
 {action:'woofLaReine',name:'La Reine Blend',price:1500},
 {action:'woofKabuki',name:'Kabuki Blend',price:1500},
 {action:'woofPharaoh',name:'Pharaoh Blend',price:1500},
]);
export function cafeWoofDrink(action){return CAFE_WOOF_DRINKS.find(drink=>drink.action===action)||null;}
