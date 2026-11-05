# Test-only canonical atlas repacking. Product source PNG/JSON files are never edited.
import json,pathlib,math,os
from PIL import Image
root=pathlib.Path('public/game/pokerogue/pokemon');out=pathlib.Path(os.environ.get('REPACKED_ATLAS_ROOT','/tmp/repacked-reviewed-mega-atlases'));out.mkdir(exist_ok=True)
for key in ['15-mega','248-mega','445-mega']:
 for face in ['', 'back/']:
  for color in ['', 'shiny/']:
   path=face+color+key;d=json.load(open(root/(path+'.json')));frames=d.get('frames') or d['textures'][0]['frames'];im=Image.open(root/(path+'.png')).convert('RGBA');w=max(f['frame']['w']for f in frames);h=max(f['frame']['h']for f in frames);cols=math.ceil(math.sqrt(len(frames)));canvas=Image.new('RGBA',(w*cols,h*math.ceil(len(frames)/cols)))
   for i,f in enumerate(frames):
    p=f['frame'];tile=im.crop((p['x'],p['y'],p['x']+p['w'],p['y']+p['h']));x=i%cols*w;y=i//cols*h;canvas.paste(tile,(x,y));p['x']=x;p['y']=y
   dest=out/(path+'.png');dest.parent.mkdir(parents=True,exist_ok=True);canvas.save(dest);(out/(path+'.json')).write_text(json.dumps(d))
print('Repacked12 test atlases from exact source pixels; product assets unchanged')
