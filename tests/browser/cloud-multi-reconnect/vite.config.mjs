import {defineConfig} from 'vite';
import {resolve} from 'node:path';
const root=process.cwd();
export default defineConfig({resolve:{alias:{'@':root}},publicDir:resolve(root,'public'),server:{fs:{allow:[root]}}});
