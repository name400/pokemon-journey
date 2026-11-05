import {defineConfig} from 'vite';
import {resolve} from 'node:path';
const root=process.cwd();
export default defineConfig({root:resolve(root,'tests/browser/chunk-recovery'),resolve:{alias:{'@':root}},publicDir:resolve(root,'public'),server:{fs:{allow:[root]}},plugins:[{name:'synthetic-account',configureServer(server){server.middlewares.use((req,res,next)=>{if(req.url==='/api/account'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({authenticated:true,profile:{nickname:'격리 검증'},signOut:'#'}));}else next();});}}]});
