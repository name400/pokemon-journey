import test from 'node:test';
import assert from 'node:assert/strict';
import {ADVENTURE_CONTACTS,contactAppearance,contactAvailable,validStoredContact} from '../lib/cloud-adventure/adventure-contacts.mjs';
import {adventureAvatarRows} from '../lib/cloud-adventure/adventure-avatar.mjs';
test('contacts use explicit unlock and color only front-facing eye pixels',()=>{
 const old={zaSalonAppearance:{style:'bob',color:'red'}};assert.equal(contactAppearance(old).id,'default');assert.equal(contactAvailable(old,'fired-up'),false);assert.equal(contactAvailable({zaSide30ContactsUnlocked:'yes'},'fired-up'),false);assert.equal(contactAvailable({zaSide30ContactsUnlocked:true},'__proto__'),false);assert.equal(validStoredContact({zaContactLens:{version:2}}),false);assert.equal(ADVENTURE_CONTACTS.length,3);
 for(const face of ['down','left','right','up'])for(const style of ['classic','short','bob','long'])for(const top of ['','vest','formal']){
  const plain=adventureAvatarRows(face,style,top),colored=adventureAvatarRows(face,style,top,'fired-up');for(let y=0;y<plain.length;y++)for(let x=0;x<12;x++){if(plain[y][x]!==colored[y][x])assert.ok(y===4&&face!=='up'&&plain[y][x]==='K'&&colored[y][x]==='E');}assert.equal(colored.join('').includes('E'),face!=='up');
 }
 assert.equal(contactAppearance({zaSide30ContactsUnlocked:true,zaContactLens:'lovestruck'}).id,'lovestruck');
});
