import test from 'node:test';
import assert from 'node:assert/strict';
import descriptions from '../data/starter-option-descriptions.json' with {type:'json'};
import {Dex} from '@pkmn/sim';
test('all selectable native ability descriptions have Korean text',()=>{for(const ability of Dex.abilities.all()){if(!ability.exists)continue;const text=descriptions.abilities[ability.id];assert.ok(text&&/[가-힣]/.test(text),ability.id);assert.ok(!/[A-Za-z]{4}/.test(text),'Untranslated description: '+ability.id);}});
test('field abilities describe the implemented Classic rules',()=>{assert.match(descriptions.abilities.ballfetch,/실패/);assert.match(descriptions.abilities.honeygather,/승리/);assert.match(descriptions.abilities.runaway,/도망/);assert.match(descriptions.moves['거품'],/거품/);assert.doesNotMatch(descriptions.moves['거품'],/사용할 수 없는/);});
