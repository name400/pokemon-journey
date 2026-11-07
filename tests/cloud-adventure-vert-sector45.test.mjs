import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,fieldDialogue,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

test('Vert 2, 4, 5 and Vert Plaza connect in both directions and retain saves',()=>{
 const start={area:3,district:'lumiose-vert2',interior:null,x:7,y:15,facing:'down',teamIds:['kept']};
 const four=stepField(start,'down');assert.deepEqual([four.district,four.x,four.y],['lumiose-vert-sector4',11,1]);
 let s={...start,...four};assert.ok(fieldPath(fieldMap(s),s,{x:21,y:8}).length);assert.equal(stepField(s,'up').district,'lumiose-vert2');
 const five=stepField({...s,x:21,y:8},'right');assert.deepEqual([five.district,five.x,five.y],['lumiose-vert-sector5',1,8]);
 s={...s,...five};assert.equal(stepField(s,'left').district,'lumiose-vert-sector4');assert.ok(fieldPath(fieldMap(s),s,{x:11,y:1}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:1},11),11);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[s.district,11,1,['kept']]);
 const plaza=stepField(saved,'up');assert.deepEqual([plaza.district,plaza.x,plaza.y],['lumiose-vert-plaza',15,15]);assert.equal(stepField({...saved,...plaza},'down').district,'lumiose-vert-sector5');
 assert.equal(restoreAdventurePosition(storeAdventurePosition(s,11),12).district,null);
 assert.equal(walkable(fieldMap({...start,...four})[3][3]),false);
});


test('Vert 4 street, roof and courtyard are separate saved layers',()=>{
 const street={area:3,district:'lumiose-vert-sector4',interior:null,x:9,y:6,facing:'up',teamIds:['kept']};
 assert.equal(fieldDialogue(street).action,'vert4Lift');const old=restoreAdventurePosition(storeAdventurePosition({...street,x:9,y:5},45),45);assert.deepEqual([old.district,old.x,old.y],[street.district,9,5]);
 const roof={...street,x:13,y:7,facing:'down',zaVert4Layer:'roof'},map=fieldMap(roof);assert.equal(fieldDialogue(roof).action,'vert4CourtyardDrop');assert.ok(fieldPath(map,roof,{x:4,y:9}).length);
 const court={...street,x:5,y:9,facing:'down',zaVert4Layer:'courtyard'};assert.equal(fieldDialogue(court).action,'vert4CourtyardLadder');
 for(const state of [roof,court]){const saved=restoreAdventurePosition(storeAdventurePosition(state,46),46);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaVert4Layer,saved.teamIds],[state.district,state.x,state.y,state.zaVert4Layer,['kept']]);assert.equal(restoreAdventurePosition(storeAdventurePosition(state,46),47).district,null);}
});

test('Vernal Avenue and Vert 4 link near Cafe Classe without affecting roofs',()=>{
 const road={area:3,district:'lumiose-vernal',interior:null,x:21,y:4,facing:'right',teamIds:['kept']};
 const entered=stepField(road,'right');assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-vert-sector4',1,8]);
 const sector={...road,...entered};assert.ok(fieldPath(fieldMap(sector),sector,{x:9,y:6}).length);const back=stepField(sector,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-vernal',21,4]);
 assert.equal(stepField({...road,zaVernalEastRoof:true},'right').blocked,true);
 for(const state of [road,sector]){const saved=restoreAdventurePosition(storeAdventurePosition(state,50),50);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[state.district,state.x,state.y,['kept']]);}
});
