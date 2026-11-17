import {readFile} from 'node:fs/promises';
const names={bulbasaur:1,charmander:4,squirtle:7,pikachu:25,sandshrew:27,eevee:133,snorlax:143,mewtwo:150,cyndaquil:155,happiny:440,pancham:674,linoone:264};
export async function routeAnimatedSprites(page,dir){
 const served=new Set();page.__realAnimatedServed=served;
 await page.route('https://**/*',async r=>{const u=new URL(r.request().url()),match=u.pathname.match(/\/(\d+|bulbasaur|charmander|squirtle|pikachu|sandshrew|eevee|snorlax|mewtwo|cyndaquil|happiny|pancham|linoone)\.gif$/i),id=match&&(names[match[1].toLowerCase()]||Number(match[1])),back=/\/(?:back|ani-back)\//.test(u.pathname);if(id){try{const body=await readFile(`${dir}/${back?'back':'front'}-${id}.gif`);served.add(r.request().url());return await r.fulfill({contentType:'image/gif',headers:{'access-control-allow-origin':'*'},body});}catch{}}return r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'});});
}
