// These actions inspect the active shared Pokémon's current moves or HP.
// The commit must still see that same owned row; normal movement needs no guard.
const ACTIONS=new Set([
 'side13Clear','mission19Freeze','clearZone5DrainSludge','clearBleuSludge','sewerIceBridge','mission20BreakCrystal',
 'mission16OpenWeb','vert7RepairLift','mission27IceBridge','mission22IceBridge','zone19Brambles',
 'side87Demonstrate','side62Demonstrate','side47Demonstrate','side48Rescue','side56Repair','side52Thaw','side82Wash','side99Season',
 'zone15Web','smashZone14Rock','zone4RearBrambles','zone7SouthBrambles','zone7NorthBrambles','zone13Brambles',
 'zone12IceBridge','zone12CourtRock','zone10ClearSludge','zone5OpenWeb','smashZone9Crystal','smashRooftopCrystal',
 'zone1RoofRock','cafeWoofRoofBramble','zone3CentralBramble','smashZone2Rock','smashSiteRock',
]);
export const fieldMoveNeedsPokemonGuard=action=>typeof action==='string'&&ACTIONS.has(action);
