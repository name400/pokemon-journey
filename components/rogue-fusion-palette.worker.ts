import {buildClassicFusionPalette} from './rogue-fusion-palette.mjs';
self.onmessage=(event:MessageEvent)=>{const {id,primaryFaces,donorFaces}=event.data;try{self.postMessage({id,palette:buildClassicFusionPalette(primaryFaces,donorFaces)});}catch{self.postMessage({id,palette:null});}};
