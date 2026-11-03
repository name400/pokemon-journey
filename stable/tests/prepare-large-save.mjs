import fs from 'node:fs/promises';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {makeMon} from '../lib/game.mjs';
import {encodeGameData} from '../lib/game-storage.mjs';
// Explicitly local fixtures; never reads a remote database or credentials.
const collection=Array.from({length:2000},(_,i)=>({...makeMon(i%1025+1,50),boxId:`large-test-${i}`}));
const data={version:2,screen:'home',dex:[],wins:0,coins:5000,balls:5,potions:3,collection,inventory:{},run:null,choiceIds:[],log:[],events:[]};
const encoded=await encodeGameData(data);
if(process.argv.includes('--apply-local')){
 let changes=0;
 for(const file of (await fs.readdir('.wrangler/state/v3/d1',{recursive:true})).filter(f=>f.endsWith('.sqlite'))){
  const db=new DatabaseSync(path.resolve('.wrangler/state/v3/d1',file));
  try {changes+=db.prepare("UPDATE saves SET data=?,revision=revision+1 WHERE user_id='local_fresh'").run(encoded).changes;}catch(e){if(!e.message.includes('no such table'))throw e;}finally{db.close();}
 }
 if(changes!==1)throw Error('Expected exactly one local fixture account');
}
console.log('Large fixture bytes',encoded.length,'for',collection.length,'Pokémon');
