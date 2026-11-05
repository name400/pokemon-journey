// Original five PokéRogue balls retain their order, weights and quantities.
// Beast Ball is the user's requested extension, not an upstream PokéRogue item.
export const CLASSIC_BALL_TYPES=[
 {id:'pokeball',name:'몬스터볼',tier:0,quantity:5,weight:6,sprite:'poke-ball',multiplier:1,description:''},
 {id:'greatball',name:'슈퍼볼',tier:1,quantity:5,weight:6,sprite:'great-ball',multiplier:1.5,description:''},
 {id:'ultraball',name:'하이퍼볼',tier:2,quantity:5,weight:15,sprite:'ultra-ball',multiplier:2,description:''},
 {id:'rogueball',name:'로그볼',tier:3,quantity:5,weight:16,sprite:'dream-ball',multiplier:3,description:''},
 {id:'masterball',name:'마스터볼',tier:4,quantity:1,weight:24,sprite:'master-ball',multiplier:-1,description:''},
 {id:'beastball',name:'울트라볼',tier:2,quantity:1,weight:6,sprite:'beast-ball',multiplier:.1,description:'울트라비스트의 포획 보정은 5배, 다른 포켓몬은 0.1배입니다.'},
];
const byId=new Map(CLASSIC_BALL_TYPES.map(ball=>[ball.id,ball]));
export const classicBallType=id=>byId.get(id);
