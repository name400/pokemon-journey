import {buildClassicFusionPalette} from './rogue-fusion-palette.mjs';
self.onmessage=(event:MessageEvent)=>{const {id,primaryFaces,donorFaces,primaryPalettes,donorPalettes}=event.data;try{self.postMessage({id,palette:buildClassicFusionPalette(primaryFaces,donorFaces,primaryPalettes,donorPalettes)});}catch{self.postMessage({id,palette:null});}};
