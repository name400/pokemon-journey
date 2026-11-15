import {test} from 'node:test';
import assert from 'node:assert/strict';
import {extraGlideVisible,extraGlideReady} from '../lib/cloud-adventure/adventure-extra-glide.mjs';
import {rotoGlideLanding} from '../lib/cloud-adventure/adventure-world.mjs';

test('client controls match established rooftop and side mission glide routes',()=>{
 const routes=[
  ['lumiose-magenta7-north-roof',17,10],['lumiose-magenta7-south-roof',11,3],['lumiose-magenta7-south-roof',3,8],
  ['lumiose-screw-magenta8',19,5],['lumiose-screw-magenta8',19,8],
  ['lumiose-magenta8-east-roof',3,8],['lumiose-magenta8-east-roof',10,8],['lumiose-magenta8-east-roof',14,8],
  ['lumiose-side09-course',10,8],['lumiose-side09-course',14,8],
 ];
 for(const [district,x,y] of routes){
  const s={district,x,y,zaMission15Stage:2,zaMagenta7NorthOpen:true,zaSide09Stage:3};
  assert.equal(extraGlideVisible(s),true,district);
  assert.equal(extraGlideReady(s),true,`${district} ${x},${y}`);
  assert.ok(rotoGlideLanding(s),`${district} ${x},${y}`);
  assert.equal(extraGlideReady({...s,x:0,y:0}),false);
 }
});
test('locked routes, interiors, and old saves do not expose unavailable glides',()=>{
 const s={district:'lumiose-magenta7-south-roof',x:11,y:3,zaMission15Stage:2};
 assert.equal(extraGlideReady(s),false);
 assert.equal(rotoGlideLanding(s),null);
 assert.equal(extraGlideVisible({...s,interior:'shop'}),false);
 assert.equal(extraGlideVisible({...s,zaMission15Stage:undefined}),false);
 assert.equal(extraGlideVisible({...s,district:'lumiose-side09-course',zaSide09Stage:2}),false);
});
