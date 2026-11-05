import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=process.env.PROFILE_ART_ROOT||'/tmp/pokerogue-profile-art';await mkdir(root,{recursive:true});const assets=[];
for(const id of [150,440,674,264])for(const side of ['front','back']){
 const url=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${side==='back'?'back/':''}${id}.gif`,file=`${root}/${id}-${side}.gif`;let body;
 try{body=await readFile(file);}catch{body=execFileSync('curl',['-fsSL','--max-time','30',url]);await writeFile(file,body);}
 assets.push({id,side,source:url,bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')});
}
await writeFile(root+'/provenance.json',JSON.stringify(assets,null,2));console.log(JSON.stringify({assets:assets.length,root}));
