import {defineConfig} from 'vite';
import {resolve} from 'node:path';
import {createFixture} from './fixture.mjs';
import {applyClassicAction,classicGameView} from '../../../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../../../lib/game-storage.mjs';
const root=process.cwd();let doc=createFixture(),revision=0;
export default defineConfig({root:resolve(root,'tests/browser/ui-readability'),resolve:{alias:{'@':root}},publicDir:resolve(root,'public'),server:{fs:{allow:[root]}},plugins:[{name:'isolated-ui-fixtures',configureServer(server){server.middlewares.use(async(req,res,next)=>{
 if(!req.url?.startsWith('/api/'))return next();res.setHeader('Content-Type','application/json');try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/account'){res.end(JSON.stringify({authenticated:true,profile:{nickname:'화면 격리 검증'},signOut:'#'}));return;}
  if(url.pathname==='/api/test-reset'){doc=createFixture(url.searchParams.get('scenario')||'eggs');revision=0;res.end('{}');return;}
  if(url.pathname==='/api/test-state'){res.end(JSON.stringify(doc));return;}
  if(url.pathname==='/api/rogue-classic'){if(req.method==='POST'){let raw='';for await(const chunk of req)raw+=chunk;const payload=JSON.parse(raw);if(payload.revision!==revision)throw Error('Synthetic revision mismatch');applyClassicAction(doc,payload);doc=await decodeGameData(await encodeGameData(doc));revision++;}res.end(JSON.stringify({...classicGameView(doc,{includeStarters:url.searchParams.get('starters')==='1'||!!doc.classic?.selection}),revision}));return;}
  res.end('{}');
 }catch(error){res.statusCode=409;res.end(JSON.stringify({error:String(error)}));}
 });}}]});
