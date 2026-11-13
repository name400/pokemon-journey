// Z-A resale prices, not the game's legacy purchase prices.
// https://bulbapedia.bulbagarden.net/wiki/Potion
// https://bulbapedia.bulbagarden.net/wiki/Great_Ball
export const ADVENTURE_SUPPLY_SALES=Object.freeze([
 {id:'ball',name:'몬스터볼',storage:'wallet',column:'balls',price:25},
 {id:'potion',name:'상처약',storage:'wallet',column:'potions',price:37},
 {id:'super',name:'좋은상처약',storage:'wallet',column:'super_potions',price:100},
 {id:'hyper',name:'고급상처약',storage:'wallet',column:'hyper_potions',price:150},
 {id:'max',name:'풀회복약',storage:'wallet',column:'max_potions',price:300},
 {id:'fullrestore',name:'회복약',storage:'wallet',column:'full_restores',price:375},
 {id:'antidote',name:'해독제',storage:'wallet',column:'antidotes',price:25},
 {id:'revive',name:'기력의조각',storage:'inventory',price:200},
 {id:'maxrevive',name:'기력의덩어리',storage:'inventory',price:500},
 {id:'fullheal',name:'만병통치약',storage:'inventory',price:50},
 {id:'lumiosegalette',name:'미르갈레트',storage:'inventory',price:87},
 {id:'freshwater',name:'맛있는물',storage:'world',column:'zaFreshWater',price:50},
 ...[['greatball','슈퍼볼',75],['ultraball','하이퍼볼',150],['quickball','퀵볼',250],['timerball','타이머볼',250],['netball','네트볼',250],['duskball','다크볼',250],['healball','힐볼',75],['luxuryball','럭셔리볼',750]].map(([id,name,price])=>({id,name,price,storage:'ball'})),
].map(item=>Object.freeze(item)));
export function adventureSupplySale(id){return ADVENTURE_SUPPLY_SALES.find(item=>item.id===id)||null;}
export function adventureSupplyStock(data,item){return item.storage==='wallet'?data?.wallet?.[item.column]??0:item.storage==='inventory'?data?.inventory?.[item.id]??0:item.storage==='world'?data?.world?.[item.column]??0:data?.world?.adventureBalls?.[item.id]??0;}
