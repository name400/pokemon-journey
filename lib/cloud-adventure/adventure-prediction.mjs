import {stepField} from './adventure-world.mjs';
export function predictCloudStep(world,direction){if(!world||world.zaWildAlphaAlert||world.district==='lumiose-wild')return null;const step=stepField(world,direction);if(step.blocked||step.transitioned||step.tile==='g')return null;return {x:step.x,y:step.y,facing:direction};}
