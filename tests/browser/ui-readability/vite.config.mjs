import {defineConfig} from 'vite';
import {resolve} from 'node:path';
import {readFile} from 'node:fs/promises';
import {createFixture} from './fixture.mjs';
import {applyClassicAction,classicGameView} from '../../../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../../../lib/game-storage.mjs';
const root=process.cwd(),profileArt=process.env.PROFILE_ART_ROOT,fixtureGeneration=Date.now();let doc=createFixture(),revision=0;
function profileSprites(view){
 if(!profileArt)return view;
 view=structuredClone(view);
 const patch=mon=>{if(!mon||![150,440,674,264].includes(mon.id))return;mon.sourceImage=`/profile-art/${mon.id}-front.gif`;mon.sourceBackImage=`/profile-art/${mon.id}-back.gif`;};
 for(const mon of view.run?.party||[])patch(mon);for(const slot of view.slots||[])for(const mon of slot.party||[])patch(mon);
 for(const battle of [view.battle,view.finishedBattle])if(battle){for(const teams of [battle.teams,battle.before])for(const team of teams||[])for(const mon of team)patch(mon);for(const event of battle.events||[])patch(event.pokemon);}
 return view;
}
function configureFixtures(server){server.middlewares.use(async(req,res,next)=>{
 if(profileArt&&/^\/profile-art\/\d+-(?:front|back)\.gif$/.test(req.url||'')){try{const body=await readFile(resolve(profileArt,req.url.split('/').at(-1)));res.setHeader('Content-Type','image/gif');res.setHeader('Cache-Control','public, max-age=31536000, immutable');res.end(body);}catch{res.statusCode=404;res.end();}return;}
 if(!req.url?.startsWith('/api/'))return next();res.setHeader('Content-Type','application/json');try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/account'){res.end(JSON.stringify({authenticated:true,profile:{nickname:'화면 격리 검증'},signOut:'#'}));return;}
  if(url.pathname==='/api/test-reset'){doc=createFixture(url.searchParams.get('scenario')||'eggs');revision=0;res.end('{}');return;}
  if(url.pathname==='/api/test-state'){res.end(JSON.stringify(doc));return;}
  if(url.pathname==='/api/rogue-classic'){let actionResult={},actionMs=0,codecMs=0;if(req.method==='POST'){let raw='';for await(const chunk of req)raw+=chunk;const payload=JSON.parse(raw);if(payload.revision!==revision)throw Error('Synthetic revision mismatch');const actionStart=performance.now();actionResult=applyClassicAction(doc,payload);actionMs=performance.now()-actionStart;const codecStart=performance.now();doc=await decodeGameData(await encodeGameData(doc));codecMs=performance.now()-codecStart;revision++;}const viewStart=performance.now(),view=profileSprites({...classicGameView(doc,{includeStarters:url.searchParams.get('starters')==='1'||!!doc.classic?.selection}),...actionResult,revision}),viewMs=performance.now()-viewStart,jsonStart=performance.now(),body=JSON.stringify(view),jsonMs=performance.now()-jsonStart;if(profileArt){res.setHeader('Server-Timing',`action;dur=${actionMs.toFixed(2)},codec;dur=${codecMs.toFixed(2)},view;dur=${viewMs.toFixed(2)},json;dur=${jsonMs.toFixed(2)}`);res.setHeader('X-Fixture-Generation',String(fixtureGeneration));}res.end(body);return;}
  res.end('{}');
 }catch(error){res.statusCode=409;res.end(JSON.stringify({error:String(error)}));}
 });}
export default defineConfig({root:resolve(root,'tests/browser/ui-readability'),resolve:{alias:{'@':root}},publicDir:resolve(root,'public'),server:{fs:{allow:[root]}},build:{sourcemap:process.env.PROFILE_SOURCE_MAP==='1',rollupOptions:{input:{index:resolve(root,'tests/browser/ui-readability/index.html'),profile:resolve(root,'tests/browser/ui-readability/profile.html')}}},plugins:[{name:'isolated-ui-fixtures',configureServer:configureFixtures,configurePreviewServer:configureFixtures}]});
