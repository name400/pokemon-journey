import {defineConfig} from 'vite';
import {resolve} from 'node:path';
import {applyClassicAction,classicGameView} from '../../../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../../../lib/game-storage.mjs';
import {safariFixture,safariLastEncounter,blockedSafariFixture} from '../../fixtures/safari-recovery.mjs';
const root=process.cwd();let doc=blockedSafariFixture(),revision=0;
const alias=process.env.SAFARI_BASELINE_COMPONENT?[{find:'./rogue-classic',replacement:process.env.SAFARI_BASELINE_COMPONENT},{find:'@',replacement:root}]:{'@':root};
export default defineConfig({resolve:{alias},publicDir:resolve(root,'public'),server:{fs:{allow:[root]}},plugins:[{name:'isolated-safari-api',configureServer(server){server.middlewares.use(async(req,res,next)=>{
 if(!req.url?.startsWith('/api/'))return next();res.setHeader('Content-Type','application/json');try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/account'){res.end(JSON.stringify({authenticated:true,profile:{nickname:'사파리 격리 검증'},signOut:'#'}));return;}
  if(url.pathname==='/api/test-reset'){doc=url.searchParams.get('outcome')==='old-save'?blockedSafariFixture():safariFixture({full:url.searchParams.get('outcome')!=='auto-add'});if(url.searchParams.get('outcome')!=='old-save')safariLastEncounter(doc);revision=0;res.end('{}');return;}
  if(url.pathname==='/api/test-state'){res.end(JSON.stringify(doc));return;}
  if(url.pathname==='/api/rogue-classic'){if(req.method==='POST'){let body='';for await(const chunk of req)body+=chunk;applyClassicAction(doc,JSON.parse(body));doc=await decodeGameData(await encodeGameData(doc));revision++;}res.end(JSON.stringify({...classicGameView(doc),revision}));return;}
  res.end('{}');
 }catch(error){res.statusCode=400;res.end(JSON.stringify({error:String(error)}));}
});}}]});
