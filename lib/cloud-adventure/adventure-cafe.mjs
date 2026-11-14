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

// Café Action! menu: https://www.serebii.net/legendsz-a/cafes.shtml
export const CAFE_ACTION_DRINKS=Object.freeze([
 {action:'actionTeaBlend',name:'Action! Tea Blend',price:490},
 {action:'actionMintTea',name:'Mint Tea du Jour',price:600},
 {action:'actionPanchamomile',name:'Panchamomile Tea',price:650},
 {action:'actionWooloolong',name:'Wooloolong Tea',price:700},
 {action:'actionRoserade',name:'Roserade Tea',price:750},
 {action:'actionClamperl',name:'Clamperl Grey Tea',price:500},
 {action:'actionGalarian',name:'Galarian Breakfast Tea',price:450},
 {action:'actionWater',name:'맛있는물',price:350},
 {action:'actionSparkling',name:'미네랄사이다',price:350},
]);
export function cafeActionDrink(action){return CAFE_ACTION_DRINKS.find(drink=>drink.action===action)||null;}

// Café Cyclone menu: https://www.serebii.net/legendsz-a/cafes.shtml
export const CAFE_CYCLONE_DRINKS=Object.freeze([
 {action:'cycloneBlend',name:'Cyclone Blend',price:600},
 {action:'cycloneRobustaryu',name:'Robustaryu Coffee',price:700},
 {action:'cycloneKomala',name:'Komala Coffee',price:1000},
 {action:'cycloneSinis',name:'Sinis-Tea',price:600},
 {action:'cycloneClamperl',name:'Clamperl Gray Tea',price:600},
 {action:'cyclonePumpkabrew',name:'Pumpkabrew Tea',price:800},
 {action:'cyclonePantrio',name:'Pantrio Tea',price:1000,requiresSide18:true},
 {action:'cycloneWater',name:'맛있는물',price:350},
 {action:'cycloneSparkling',name:'미네랄사이다',price:350},
]);
export function cafeCycloneDrink(action){return CAFE_CYCLONE_DRINKS.find(drink=>drink.action===action)||null;}
