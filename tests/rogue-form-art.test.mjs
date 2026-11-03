import assert from 'node:assert/strict';
import {rogueFormArt} from '../lib/rogue-form-art.mjs';
const form={sourceImage:'normal-front',sourceBackImage:'normal-back',sourceShinyImage:'shiny-front',sourceShinyBackImage:'shiny-back'};
assert.equal(rogueFormArt(form,false).sourceImage,'normal-front');assert.equal(rogueFormArt(form,false).sourceBackImage,'normal-back');assert.equal(rogueFormArt(form,true).sourceImage,'shiny-front');assert.equal(rogueFormArt(form,true).sourceBackImage,'shiny-back');
const missing=rogueFormArt({sourceImage:'normal-front'},true);assert.equal(missing.sourceImage,null);assert.equal(missing.sourceBackImage,null);
console.log('Form art keeps shiny and normal identities separate and allows shiny fallback when an asset is missing.');
