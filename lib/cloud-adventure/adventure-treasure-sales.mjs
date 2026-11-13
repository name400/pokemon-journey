// Legends: Z-A shop resale values for valuable items and evolution stones.
// https://bulbapedia.bulbagarden.net/wiki/Fire_Stone
// https://bulbapedia.bulbagarden.net/wiki/Ice_Stone
// https://bulbapedia.bulbagarden.net/wiki/Pearl_String
// https://bulbapedia.bulbagarden.net/wiki/Big_Nugget
// https://bulbapedia.bulbagarden.net/wiki/Nugget
// https://bulbapedia.bulbagarden.net/wiki/Big_Pearl
// https://bulbapedia.bulbagarden.net/wiki/Pearl_(item)
export const ADVENTURE_TREASURE_SALES=Object.freeze([
 {id:'pearl',price:1000},{id:'bigpearl',price:4000},{id:'pearlstring',price:10000},
 {id:'nugget',price:5000},{id:'bignugget',price:20000},
 ...['firestone','waterstone','thunderstone','leafstone','sunstone','moonstone','shinystone','duskstone','dawnstone','icestone'].map(id=>({id,price:750})),
].map(item=>Object.freeze(item)));
