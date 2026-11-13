import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap} from '../lib/cloud-adventure/adventure-world.mjs';
import {visibleCityResearchEncounters} from '../lib/cloud-adventure/adventure-city-research.mjs';
test('city sprites follow the same layer, weather, time and map tiles as interactions',()=>{
 const show=s=>visibleCityResearchEncounters(s,fieldMap(s)).map(p=>p.id);
 const base={area:3,interior:null,zaMission19Stage:16,zaMission19Complete:true,zaBleuSewerOpened:true,zaCityResearchPeriod:'day',weather:''};
 assert.deepEqual(show({...base,district:'lumiose-sewer'}),['scraggy','litwick']);
 assert.deepEqual(show({...base,district:'lumiose-sewer',zaMission19Inner:true}),[]);
 assert.deepEqual(show({...base,district:'lumiose-vert6-roof'}),['dratini']);
 assert.deepEqual(show({...base,district:'lumiose-vert6-roof',zaCityResearchPeriod:'night'}),[]);
 assert.deepEqual(show({...base,district:'lumiose-jaune-sector10',weather:''}),[]);
 assert.deepEqual(show({...base,district:'lumiose-jaune-sector10',weather:'rain'}),['goomy']);
 assert.deepEqual(show({...base,district:'lumiose-vert-sector4',zaVert4Layer:'ground'}),[]);
 assert.deepEqual(show({...base,district:'lumiose-vert-sector4',zaVert4Layer:'courtyard'}),['ralts']);
});
