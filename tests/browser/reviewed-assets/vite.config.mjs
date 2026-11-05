import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({root:resolve('tests/browser/reviewed-assets'),resolve:{alias:{'@':process.cwd()}},publicDir:resolve('public'),server:{fs:{allow:[process.cwd()]}}});
