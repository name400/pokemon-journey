import {BATTLE_LOOKUP_STUB,isNativeValidationData} from '../../scripts/vite/battle-runtime-data.mjs';
const stub='data:text/javascript,'+encodeURIComponent(BATTLE_LOOKUP_STUB);
export async function resolve(source,context,next){if(isNativeValidationData(source,context.parentURL))return {url:stub,shortCircuit:true};return next(source,context);}
