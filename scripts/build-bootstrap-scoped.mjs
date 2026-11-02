import fs from 'node:fs/promises';
import postcss from 'postcss';
const input=await fs.readFile(new URL('../node_modules/bootstrap/dist/css/bootstrap.css',import.meta.url),'utf8');
const root=postcss.parse(input);
root.walkRules(rule=>{
 if(rule.parent?.type==='atrule'&&/keyframes$/i.test(rule.parent.name))return;
 rule.selectors=rule.selectors.map(selector=>selector.startsWith(':root')?selector.replace(':root','.bootstrap-ui'):selector==='body'||selector==='html'?'.bootstrap-ui':'.bootstrap-ui '+selector);
});
root.walkComments(comment=>{if(comment.text.includes('sourceMappingURL'))comment.remove();});
await fs.writeFile(new URL('../app/bootstrap-scoped.css',import.meta.url),'/* Bootstrap 5.3.8 (MIT), scoped to administration and shop surfaces. */\n'+root.toString());
await fs.copyFile(new URL('../node_modules/bootstrap/LICENSE',import.meta.url),new URL('../public/licenses/bootstrap.txt',import.meta.url));
console.log('Bootstrap 5.3.8 styles scoped; license retained.');
