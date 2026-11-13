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

// Café Bataille menu and prices: https://www.serebii.net/legendsz-a/cafes.shtml
export const CAFE_BATAILLE_DRINKS=Object.freeze([
 {action:'batailleBlend',name:'Bataille Blend',price:500},
 {action:'batailleLait',name:'Bataille au Lait',price:600},
 {action:'batailleFlaaffe',name:'Flaaffe Latte',price:550},
 {action:'batailleRobustaryu',name:'Robustaryu Coffee',price:700},
 {action:'batailleKomala',name:'Komala Coffee',price:830},
 {action:'batailleRoserade',name:'Roserade Tea',price:850},
 {action:'batailleOran',name:'Oran Tea',price:500},
 {action:'bataillePumpkabrew',name:'Pumpkabrew Tea',price:800},
 {action:'batailleMilk',name:'튼튼밀크',price:450},
 {action:'batailleWater',name:'맛있는물',price:300},
 {action:'batailleSparkling',name:'미네랄사이다',price:300},
]);
export function cafeBatailleDrink(action){return CAFE_BATAILLE_DRINKS.find(drink=>drink.action===action)||null;}
