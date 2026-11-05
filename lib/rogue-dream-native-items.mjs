import {Dex} from '@pkmn/sim';
import policy from '../data/rogue-dream-native-item-policy.json' with {type:'json'};
const legacy=new Set(policy.items.filter(i=>i.reason==='previously-reviewed').map(i=>i.id));
const reviewed=new Set(policy.items.filter(i=>i.allowed).map(i=>i.id));
// Griseous Orb has a species-specific power hook but does not change forms.
const reviewedV3=new Set([...reviewed,'griseousorb']);
// New runs may retain catalog-reviewed general held effects. Form/special items
// and unreviewed species-dependent callbacks remain unavailable, never lost.
export function classicDreamNativeItem(mon,run){
 if(!mon.item)return '';
 const item=Dex.items.get(mon.item),allowed=run?.dreamNativeItemsRule==='reviewed-native-v3'?reviewedV3:run?.dreamNativeItemsRule==='reviewed-native-v2'?reviewed:legacy;
 return item.exists&&allowed.has(item.id)?item.id:null;
}
