// Versioned scene state: unrecognised saved data is left untouched.
export function emmaMegaSceneStep(world){
 const scene=world?.zaEmmaMegaSceneV1;
 if(!scene||typeof scene!=='object'||Array.isArray(scene)||scene.version!==1||!Number.isInteger(scene.step)||scene.step<1||scene.step>3||Object.keys(scene).some(k=>k!=='version'&&k!=='step'))return null;
 if(world.zaEmmaMegaSeen===true||world.zaEmmaBattleComplete!==true||world.combat||world.interior||world.adventureCatchWindow||world.adventurePendingMoves?.length||!['lumiose-bureau','lumiose-rouge-sector5'].includes(world.district))return null;
 return scene.step;
}
