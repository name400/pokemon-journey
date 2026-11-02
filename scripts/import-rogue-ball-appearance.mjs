import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';

// Download unchanged atlas bytes and describe source frames. No raster editing,
// extraction, upstream app execution, original callback execution or eval.
const version='1.12.2.3',upstreamCommit='29441f7aa7482d9e816b253d324293788936dc3e';
const assetCommit='fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba';
const project=fileURLToPath(new URL('../',import.meta.url)),reference=path.join(project,'work/pokerogue-reference');
if(execFileSync('git',['-C',reference,'rev-parse','HEAD'],{encoding:'utf8'}).trim()!==upstreamCommit)throw Error('Wrong code reference commit');
if(!execFileSync('git',['-C',reference,'ls-tree','HEAD','assets'],{encoding:'utf8'}).includes(assetCommit))throw Error('Wrong pinned asset submodule');
const outputDir=path.join(project,'public/game/balls');await fs.mkdir(outputDir,{recursive:true});
const rawBase=`https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/${assetCommit}/`;
const downloads=[
 ['images/pb.png','pb.png','364d864f7fe9bc1e427d2587373fa43eedf0c79f'],
 ['images/pb.json','pb.json','fe11336cf824a75335dbc41bac691bd456ce951f'],
 ['README.md','upstream-README.md','2241ec0bf800f8b74bd4db4bbc2b2c3638cd89a1'],
 ['REUSE.toml','upstream-REUSE.toml','c4fe2b331c3dfd4b4593739ac02d2888e70589a0'],
 ['images/REUSE.toml','images-REUSE.toml','17653ef8ea826088adb350adee810960df1aca75'],
 ['LICENSES/LicenseRef-FAIR-USE.txt','LicenseRef-FAIR-USE.txt','4daa783627e58747d69f9a19ddbf0f452b3a7cfd'],
 ['LICENSES/AGPL-3.0-only.txt','AGPL-3.0-only.txt','0c97efd25b5974b974ed9a8a18207bc4f55bb338'],
 ['LICENSES/CC-BY-NC-SA-4.0.txt','CC-BY-NC-SA-4.0.txt','baee873b679e36a4123c83b8a29e0fb17fad14eb'],
];
const sha256=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const gitBlob=buffer=>crypto.createHash('sha1').update(`blob ${buffer.length}\0`).update(buffer).digest('hex');
const blobs=new Map(),manifest=[];
for(const [sourcePath,localName,expectedBlob]of downloads){
 const target=path.join(outputDir,localName);let buffer;
 if(process.argv.includes('--cached'))buffer=await fs.readFile(target);
 else{const response=await fetch(rawBase+sourcePath);if(!response.ok)throw Error(`${sourcePath}: HTTP ${response.status}`);buffer=Buffer.from(await response.arrayBuffer());}
 if(expectedBlob&&gitBlob(buffer)!==expectedBlob)throw Error('Unmodified pinned blob mismatch: '+sourcePath);
 blobs.set(localName,buffer);manifest.push({sourcePath,localPath:'/game/balls/'+localName,url:rawBase+sourcePath,bytes:buffer.length,sha256:sha256(buffer),gitBlobSha1:gitBlob(buffer)});
 // Preserve exact response bytes, including original PNG and atlas JSON.
 if(!process.argv.includes('--cached'))await fs.writeFile(target,buffer);
}
const atlas=JSON.parse(blobs.get('pb.json').toString('utf8'));
if(atlas.textures?.length!==1)throw Error('Expected one original atlas texture');
const texture=atlas.textures[0],png=blobs.get('pb.png');
if(!png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Invalid PNG');
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
if(texture.image!=='pb.png'||texture.size.w!==width||texture.size.h!==height)throw Error('Atlas/PNG dimensions differ');
const frames=Object.fromEntries(texture.frames.map(frame=>[frame.filename,frame]));
const codeFile='src/data/pokeball.ts',code=await fs.readFile(path.join(reference,codeFile),'utf8'),sf=ts.createSourceFile(codeFile,code,ts.ScriptTarget.Latest,true);
const fn=sf.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='getPokeballAtlasKey');
const cases=fn.body.statements.find(ts.isSwitchStatement).caseBlock.clauses;
const keys={};
for(const clause of cases){if(!ts.isCaseClause(clause)||!ts.isPropertyAccessExpression(clause.expression))continue;const ret=clause.statements.find(ts.isReturnStatement);if(ret&&ts.isStringLiteralLike(ret.expression))keys[clause.expression.name.text]={key:ret.expression.text,source:{file:codeFile,line:sf.getLineAndCharacterOfPosition(clause.getStart(sf)).line+1}};}
const canonical={pokeball:'POKEBALL',greatball:'GREAT_BALL',ultraball:'ULTRA_BALL',rogueball:'ROGUE_BALL',masterball:'MASTER_BALL'};
const labels={pokeball:'몬스터볼',greatball:'슈퍼볼',ultraball:'하이퍼볼',rogueball:'로그볼',masterball:'마스터볼'};
function describeFrame(key){const f=frames[key];if(!f)throw Error('Missing canonical ball frame '+key);if(f.rotated)throw Error('Unexpected rotated source frame '+key);const {x,y,w,h}=f.frame;if(x<0||y<0||x+w>width||y+h>height)throw Error('Frame exceeds atlas');const css={backgroundImage:"url('/game/balls/pb.png')",backgroundPosition:`${-x}px ${-y}px`,backgroundSize:`${width}px ${height}px`,backgroundRepeat:'no-repeat',imageRendering:'pixelated',width:w,height:h};return {frameName:key,x,y,width:w,height:h,sourceSize:f.sourceSize,spriteSourceSize:f.spriteSourceSize,rotated:f.rotated,trimmed:f.trimmed,css,sourceCanvasCss:{position:'relative',width:f.sourceSize.w,height:f.sourceSize.h},sourceSpriteCss:{...css,position:'absolute',left:f.spriteSourceSize.x,top:f.spriteSourceSize.y}};}
const balls={};
for(const [id,enumName]of Object.entries(canonical)){const mapping=keys[enumName];if(!mapping)throw Error('Missing original enum mapping '+enumName);const key=mapping.key;balls[id]={id,name:labels[id],sourceEnumName:enumName,atlasKey:key,image:'/game/balls/pb.png',closed:describeFrame(key),opening:describeFrame(key+'_opening'),open:describeFrame(key+'_open'),source:mapping.source};}
// Read exact REUSE annotation blocks without treating TOML contents as code.
const reuse=blobs.get('images-REUSE.toml').toString('utf8'),annotations=[];
const starts=[...reuse.matchAll(/^\[\[annotations\]\].*$/gm)].map(m=>m.index);
for(let i=0;i<starts.length;i++){const block=reuse.slice(starts[i],starts[i+1]??reuse.length),pathPart=block.match(/\bpath\s*=\s*\[([\s\S]*?)\]/)?.[1]||'',paths=[...pathPart.matchAll(/"([^"\n]+)"/g)].map(m=>m[1]);for(const target of ['pb.png','pb.json'])if(paths.includes(target)){const copyright=block.match(/SPDX-FileCopyrightText\s*=\s*"([^"\n]+)"/)?.[1],license=block.match(/SPDX-License-Identifier\s*=\s*"([^"\n]+)"/)?.[1];if(!copyright||!license)throw Error('Could not read exact REUSE attribution for '+target);annotations.push({path:'images/'+target,copyright,license,sourceUrl:rawBase+'images/REUSE.toml',line:reuse.slice(0,starts[i]).split('\n').length});}}
const pngLicense=annotations.filter(a=>a.path==='images/pb.png'),jsonLicense=annotations.filter(a=>a.path==='images/pb.json');
if(pngLicense.length!==1||jsonLicense.length!==1)throw Error('Expected exact single REUSE mapping per downloaded asset');
const data={metadata:{version,upstreamCommit,upstreamRepository:'https://github.com/pagefaultgames/pokerogue',assetCommit,assetRepository:'https://github.com/pagefaultgames/pokerogue-assets',method:'Unchanged pinned PNG/JSON download. Source switch mapping read with TypeScript AST. No cropped/extracted/generated PNG frames, upstream functions, callbacks, Phaser or app execution.',loaderSource:{file:'src/loading-scene.ts',line:184,call:'loadAtlas("pb", "")'},loaderHelperSource:{file:'src/scene-base.ts',line:61,imagePath:'images/pb.png',atlasPath:'images/pb.json',eventOverride:'The original loader can apply event replacements; this asset pack preserves the canonical pinned base atlas.'},rights:{annotations,pngReuseClassification:pngLicense[0].license,pngCopyright:pngLicense[0].copyright,jsonReuseClassification:jsonLicense[0].license,permissionStatus:'pb.png is explicitly classified LicenseRef-FAIR-USE by upstream, not CC0 and not a general permission grant. No independent commercial-use permission is asserted. See original LicenseRef-FAIR-USE.txt and images-REUSE.toml.',readmeDefault:'Repository README states CC-BY-NC-SA-4.0 for licensable/applicable assets unless overridden; the exact pb.png fair-use exception takes precedence.',edits:'None. PNG and atlas JSON are byte-for-byte original blobs.'},coordinateSystem:'Original source pixel coordinates, origin top-left. css values render at 1x. Scale CSS backgroundSize, backgroundPosition, width and height by the same factor or scale a fixed 1x wrapper. Original frames are trimmed: use sourceCanvasCss plus sourceSpriteCss to preserve the common 12x16 canvas; closed has top4, opening top3, open top0.',counts:{canonicalBalls:Object.keys(balls).length,originalAtlasFrames:texture.frames.length},downloads:manifest},atlas:{image:'/game/balls/pb.png',json:'/game/balls/pb.json',width,height,format:texture.format,scale:texture.scale},balls};
await fs.writeFile(path.join(project,'data/rogue-ball-appearance.json'),JSON.stringify(data)+'\n');
const readme=`# 원본 볼 아틀라스\n\nPokéRogue ${version} 코드 ${upstreamCommit}가 가리키는 assets 서브모듈 ${assetCommit}의 images/pb.png 및 pb.json을 수정 없이 보관합니다. 모든 볼은 같은 로컬 아틀라스의 별도 프레임입니다. 로그볼은 rb이며 Dream Ball 대체 이미지가 아닙니다.\n\nPNG: ${width}×${height}px. JSON: 원본 프레임 ${texture.frames.length}개. 게임용 canonical5종의 closed/opening/open 좌표는 data/rogue-ball-appearance.json에 있습니다. 이미지 자르기·프레임 PNG 추출·리사이즈는 수행하지 않았습니다. CSS의 background-position과 원본 크기를 사용하세요.\n\n## 출처·권리 고지\n\n- 원본 자산: https://github.com/pagefaultgames/pokerogue-assets/tree/${assetCommit}\n- pb.png: ${pngLicense[0].copyright}; ${pngLicense[0].license}. 원본 REUSE 고지는 images-REUSE.toml:${pngLicense[0].line}입니다.\n- pb.json: ${jsonLicense[0].copyright}; ${jsonLicense[0].license}. 원본 REUSE 고지는 images-REUSE.toml:${jsonLicense[0].line}입니다.\n- 원본 LicenseRef-FAIR-USE.txt,AGPL-3.0-only.txt,CC-BY-NC-SA-4.0.txt,upstream-README.md,REUSE 파일을 함께 보관합니다. pb.png를 CC0나자유상업사용으로 표시하지 마세요. 상위 README의 일반 CC 표기보다 해당 PNG의 명시적 예외를 우선 기록합니다. 이 파일은 별도 권리 허가를 주장하지 않습니다.\n\n재생성: node scripts/import-rogue-ball-appearance.mjs\n다운로드 없는 재검증: node scripts/import-rogue-ball-appearance.mjs --cached\n`;
await fs.writeFile(path.join(outputDir,'README.md'),readme);
console.log(JSON.stringify({output:'data/rogue-ball-appearance.json',atlas:data.atlas,rights:data.metadata.rights.annotations,balls:Object.values(balls).map(b=>({id:b.id,key:b.atlasKey,closedY:b.closed.y,openingY:b.opening.y,openY:b.open.y})),hashes:manifest.slice(0,2)},null,2));
