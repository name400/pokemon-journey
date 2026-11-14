import test from 'node:test';
import assert from 'node:assert/strict';
import {recordPlayerCenterVisit,ADVENTURE_PLAYER_BASE_HP} from '../lib/cloud-adventure/adventure-player-vitals.mjs';
import {centerAt} from '../lib/cloud-adventure/adventure-fast-travel.mjs';

test('center visit initializes and recovers versioned player health without changing unrelated save data',()=>{
 const world={area:3,district:'lumiose',interior:null,teamIds:['kept'],zaFastTravelCenters:['hotel'],zaWildShinyRolls:{kept:true}};
 const spot={tile:'H',x:3,y:5},center=centerAt(world,spot),before=structuredClone(world);
 assert.equal(ADVENTURE_PLAYER_BASE_HP,100);assert.equal(recordPlayerCenterVisit(world,center),true);
 assert.deepEqual(world.zaPlayerVitalsV1,{version:1,hp:100,lastCenterId:'hotel'});
 const {zaPlayerVitalsV1,...other}=world;assert.deepEqual(other,before);
 world.zaPlayerVitalsV1={...zaPlayerVitalsV1,hp:30,extra:'keep'};assert.equal(recordPlayerCenterVisit(world,center),true);assert.deepEqual(world.zaPlayerVitalsV1,{version:1,hp:100,lastCenterId:'hotel',extra:'keep'});
 const moved={...world,district:'lumiose-jaune-sector8'};assert.equal(recordPlayerCenterVisit(moved,centerAt(moved,{tile:'H',x:5,y:6})),true);assert.equal(moved.zaPlayerVitalsV1.lastCenterId,'jaune');
});

test('invalid locations and unknown or damaged health schemas are never rewritten',()=>{
 for(const value of [null,[],{version:2,hp:40},{version:1,hp:-1},{version:1,hp:101},{version:1,hp:'40'}]){const world={zaPlayerVitalsV1:value},before=structuredClone(world);assert.equal(recordPlayerCenterVisit(world,{id:'hotel'}),false);assert.deepEqual(world,before);}
 const world={area:3,district:'lumiose',interior:null},before=structuredClone(world);assert.equal(recordPlayerCenterVisit(world,centerAt(world,{tile:'H',x:1,y:1})),false);assert.deepEqual(world,before);
});
