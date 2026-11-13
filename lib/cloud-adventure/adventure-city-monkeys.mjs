// The three elemental monkeys inhabit trees in the city, including the road
// north of Wild Zone 6. Tree positions and one species per tree are 2D drafts.
// https://www.dbltap.com/guides/pokemon-legends-za-pansage-pansear-panpour
export const NORTH_MONKEY_TREES=Object.freeze([
  Object.freeze({x:4,y:0,species:511,name:'야나프'}),
  Object.freeze({x:7,y:0,species:513,name:'바오프'}),
  Object.freeze({x:11,y:0,species:515,name:'앗차프'}),
]);
export function northMonkeyTree(s,spot){
 return !s?.interior&&s?.district==='lumiose-north-boulevard'&&spot?.tile==='^'
  ? NORTH_MONKEY_TREES.find(p=>p.x===spot.x&&p.y===spot.y)||null : null;
}
