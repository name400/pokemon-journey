// Shared by the classic capture engine and its selection UI.
// Master Ball bypasses the ordinary catch roll; encounter-specific gates still apply.
export const CLASSIC_BALLS=Object.freeze([
 Object.freeze({id:'pokeball',name:'몬스터볼',sprite:'poke-ball',multiplier:1,description:'기본 포획률 ×1'}),
 Object.freeze({id:'greatball',name:'슈퍼볼',sprite:'great-ball',multiplier:1.5,description:'기본 포획률 ×1.5'}),
 Object.freeze({id:'ultraball',name:'하이퍼볼',sprite:'ultra-ball',multiplier:2,description:'기본 포획률 ×2'}),
 Object.freeze({id:'rogueball',name:'로그볼',sprite:null,multiplier:3,description:'기본 포획률 ×3'}),
 Object.freeze({id:'masterball',name:'마스터볼',sprite:'master-ball',multiplier:-1,description:'포획 판정에 성공. 포획 가능 조건은 별도로 적용'}),
]);
export function classicBall(id){return CLASSIC_BALLS.find(ball=>ball.id===id);}
