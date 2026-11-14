// Free makeup in the field menu; the lens colors are small pixel-art approximations.
// https://gamepedia.jp/pokemon-legends-z-a/archives/15833
export const ADVENTURE_CONTACTS=Object.freeze([
 Object.freeze({id:'default',name:'기본 눈',color:'#263e51'}),
 Object.freeze({id:'fired-up',name:'불타는 눈',color:'#e35024'}),
 Object.freeze({id:'lovestruck',name:'사랑에 빠진 눈',color:'#e64c94'}),
]);
export function contactAvailable(s,id){return id==='default'||(s?.zaSide30ContactsUnlocked===true&&['fired-up','lovestruck'].includes(id));}
export function contactAppearance(s){return ADVENTURE_CONTACTS.find(x=>x.id===s?.zaContactLens&&contactAvailable(s,x.id))||ADVENTURE_CONTACTS[0];}
export function validStoredContact(s){return s?.zaContactLens===undefined||s.zaContactLens===null||ADVENTURE_CONTACTS.some(x=>x.id===s.zaContactLens);}
