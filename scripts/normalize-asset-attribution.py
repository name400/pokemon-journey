"""Lossless REUSE annotation references; streams the former repeated path arrays."""
import argparse,fnmatch,hashlib,json,pathlib,shutil,tomllib
parser=argparse.ArgumentParser();parser.add_argument('--root',default='.');parser.add_argument('--reuse',required=True);parser.add_argument('files',nargs='+');args=parser.parse_args()
root=pathlib.Path(args.root);raw=pathlib.Path(args.reuse).read_bytes();source=tomllib.loads(raw.decode());annotations=source['annotations'];canonical=lambda value:json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False)
lookup={canonical(annotation):index for index,annotation in enumerate(annotations)}
catalog='data/rogue-asset-attribution-REUSE.toml';catalog_path=root/catalog;catalog_path.parent.mkdir(parents=True,exist_ok=True)
if catalog_path.resolve()!=pathlib.Path(args.reuse).resolve():catalog_path.write_bytes(raw)
proof={'localPath':catalog,'sourcePath':'images/REUSE.toml','sourceCommit':'fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba','sha256':hashlib.sha256(raw).hexdigest(),'index':'Zero-based [[annotations]] order; full original paths and comments are preserved in the unchanged catalog.'}
for filename in args.files:
 path=root/filename;before=path.stat().st_size;header=[];assets=[];rows=0
 with path.open()as stream:
  for line in stream:
   if line.strip()=='"assets": [':break
   header.append(line)
  meta=json.loads(''.join(header).rstrip().rstrip(',')+'\n}')
  buffer=[]
  for line in stream:
   if line=='  ]\n':break
   buffer.append(line)
   if line not in ['    },\n','    }\n']:continue
   asset=json.loads(''.join(buffer).strip().rstrip(','));buffer=[];old=asset.get('attribution')
   if old:
    rewritten=[]
    for annotation in old:
     if 'catalogAnnotation' in annotation:
      index=annotation['catalogAnnotation'];full=annotations[index]
      assert all(annotation[key]==value for key,value in full.items()if key!='path')
     else:
      index=lookup[canonical(annotation)];full=annotations[index]
     paths=full['path'] if isinstance(full['path'],list) else [full['path']]
     matches=[pattern for pattern in paths if fnmatch.fnmatch(asset['path'].removeprefix('images/'),pattern)]
     assert matches,(asset['path'],index)
     rewritten.append({'catalogAnnotation':index,'path':matches,**{key:value for key,value in full.items()if key!='path'}})
    asset['attribution']=rewritten
   else:assert old is None
   assets.append(asset);rows+=1
 meta['attributionCatalog']=proof;meta['assets']=assets;temp=path.with_suffix(path.suffix+'.normalized');temp.write_text(json.dumps(meta,indent=2,ensure_ascii=False)+'\n');temp.replace(path)
 print(json.dumps({'file':str(path),'assets':rows,'beforeBytes':before,'afterBytes':path.stat().st_size,'catalogSha256':proof['sha256']}))
