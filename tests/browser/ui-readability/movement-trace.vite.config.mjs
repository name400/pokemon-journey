import base from './vite.config.mjs';
function inject(code,from,to){if(!code.includes(from))throw Error(`movement trace marker missing: ${from}`);return code.replace(from,to);}
export default {...base,plugins:[...(base.plugins||[]),{name:'movement-trace-only',enforce:'pre',transform(code,id){
 if(id.endsWith('/components/cloud-adventure/entry.tsx')){
  code=inject(code,'displayedPrediction.current=value;fieldPrediction.current?.setPrediction(value);',"window.__movementTrace?.('prediction-set',{value});displayedPrediction.current=value;fieldPrediction.current?.setPrediction(value);");
  code=inject(code,'return <AdventureField {...props} world={prediction&&prediction.revision===revision?',"window.__movementTrace?.('react-render',{prediction,revision,world:{x:world.x,y:world.y}});return <AdventureField {...props} world={prediction&&prediction.revision===revision?");
 }
 if(id.endsWith('/components/cloud-adventure/adventure-field.tsx')){code=inject(code,'s.startX=s.x;s.startY=s.y;s.targetX=w.x;s.targetY=w.y;s.moveStart=time;',"window.__movementTrace?.('draw-target',{from:{x:s.x,y:s.y},previous:{x:s.targetX,y:s.targetY},target:{x:w.x,y:w.y}});s.startX=s.x;s.startY=s.y;s.targetX=w.x;s.targetY=w.y;s.moveStart=time;");
  code=inject(code,'s.startX=s.targetX;s.startY=s.targetY;s.targetX=next.x;s.targetY=next.y;',"window.__movementTrace?.('draw-target',{from:{x:s.x,y:s.y},previous:{x:s.targetX,y:s.targetY},target:{x:next.x,y:next.y},step:next.id,generation:visualPath.generation});s.startX=s.targetX;s.startY=s.targetY;s.targetX=next.x;s.targetY=next.y;");}
 return {code,map:null};
}}]};
