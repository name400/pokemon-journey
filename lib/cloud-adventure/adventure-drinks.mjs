// Jaune Street newsstand prices and medicine effects; exact 2D position is draft.
// https://www.serebii.net/pokearth/lumiosecity/jaunedistrict.shtml
export const ADVENTURE_DRINKS=Object.freeze([
 {id:'freshwater',name:'맛있는물',price:200,heal:30},
 {id:'sodapop',name:'미네랄사이다',price:300,heal:50},
 {id:'lemonade',name:'후르츠밀크',price:400,heal:70},
 {id:'moomoomilk',name:'튼튼밀크',price:600,heal:100},
].map(item=>Object.freeze(item)));
export function adventureDrink(id){return ADVENTURE_DRINKS.find(item=>item.id===id)||null;}
export function newsstandAt(s,p){return s?.area===3&&s.district==='lumiose-jaune-street'&&!s.interior&&p?.tile==='#'&&p.x===16&&p.y===14;}
