import assert from 'node:assert/strict';
import {reviewedAttackKind,reviewedAttackImmune,reviewedAttackTargets,reviewedAttackHit,orderReviewedBattleEvents,confirmedZDash,reviewedBattleMessage} from '../components/battle-attack-presentation.mjs';
const zmove={kind:'move',moveId:'breakneckblitz',side:0,actorBoxId:'hero',targetSide:1,targetBoxId:'foe'};
const zhit={kind:'damage',moveId:'breakneckblitz',actorBoxId:'hero',targetSide:1,targetBoxId:'foe',hit:true};
assert.equal(confirmedZDash([zmove,zhit],0),true);
assert.equal(confirmedZDash([zmove,{...zhit,hit:false}],0),false);
assert.equal(confirmedZDash([zmove,{...zhit,targetBoxId:'other'}],0),false);
assert.equal(confirmedZDash([zmove,{kind:'move'},zhit],0),false);
assert.equal(confirmedZDash([{...zmove,targetSide:0},zhit],0),false);
const move={kind:'move',moveId:'thunderbolt',targetBoxId:'ground',targetSide:1};
const immune={kind:'immune',targetBoxId:'ground',targetSide:1,text:'효과가 없다!'};
assert.equal(reviewedAttackKind(move),'electric-bolt');
assert.equal(reviewedAttackKind({kind:'move',moveId:'flamethrower'}),'fire-stream');
assert.equal(reviewedAttackKind({kind:'move',moveId:'hydropump'}),'water-stream');
for(const [moveId,kind] of [['energyball','grass-orb'],['icebeam','ice-beam'],['shadowball','ghost-orb'],['dragonpulse','dragon-wave']])assert.equal(reviewedAttackKind({kind:'move',moveId}),kind);
assert.equal(reviewedAttackImmune([{...move,moveId:'shadowball'},immune],0),true);
assert.equal(reviewedAttackImmune([{...move,moveId:'dragonpulse'},immune],0),true);
for(const [moveId,kind] of [['swift','normal-stars'],['brickbreak','fighting-strikes'],['sludgebomb','poison-drops'],['earthquake','ground-cracks'],['airslash','flying-slashes'],['psychic','psychic-rings'],['megahorn','bug-thrust'],['rockslide','rock-fall'],['darkpulse','dark-rings'],['flashcannon','steel-beam'],['moonblast','fairy-orb']])assert.equal(reviewedAttackKind({kind:'move',moveId}),kind);
assert.equal(reviewedAttackKind({kind:'move',moveId:'fireblast'}),'');
assert.equal(reviewedAttackImmune([move,immune],0),true);
assert.equal(reviewedAttackImmune([move,{...immune,targetSide:0}],0),false,'Same box IDs on different sides must not be confused');
assert.equal(reviewedAttackImmune([move,{kind:'move'},immune],0),false,'A later move must not supply an earlier result');
const effect={kind:'effect',targetSide:1,targetBoxId:'ground',text:'효과가 굉장했다!'};
const damage={kind:'damage',targetSide:1,targetBoxId:'ground',hit:true,hp:7};
const original=[move,effect,damage,immune];
assert.deepEqual(orderReviewedBattleEvents(original),[move,damage,effect,immune]);
assert.deepEqual(original,[move,effect,damage,immune],'Server events are not mutated');
assert.deepEqual(orderReviewedBattleEvents([move,effect,{...damage,targetSide:0}]),[move,effect,{...damage,targetSide:0}]);
assert.deepEqual(orderReviewedBattleEvents([move,effect,{...damage,hit:false}]),[move,effect,{...damage,hit:false}]);
assert.deepEqual(orderReviewedBattleEvents([move,effect,{kind:'critical'},damage]),[move,effect,{kind:'critical'},damage],'Non-adjacent cases retain server order');
const wide={kind:'move',moveId:'earthquake',actorBoxId:'hero'};
const allyEffect={kind:'effect',targetSide:0,targetBoxId:'ally',text:'효과가 굉장했다!'};
const allyHit={kind:'damage',actorBoxId:'hero',moveId:'earthquake',targetSide:0,targetBoxId:'ally',hit:true};
const foeHit={kind:'damage',actorBoxId:'hero',moveId:'earthquake',targetSide:1,targetBoxId:'foe',hit:true};
const critical={kind:'critical',targetSide:1,targetBoxId:'foe'};
const wideOriginal=[wide,allyEffect,critical,allyHit,foeHit];
assert.deepEqual(orderReviewedBattleEvents(wideOriginal),[wide,critical,allyHit,allyEffect,foeHit]);
assert.deepEqual(wideOriginal,[wide,allyEffect,critical,allyHit,foeHit]);
assert.deepEqual(orderReviewedBattleEvents([wide,allyEffect,{kind:'move'},allyHit,foeHit]),[wide,allyEffect,{kind:'move'},allyHit,foeHit]);
const foeEffect={kind:'effect',targetSide:1,targetBoxId:'foe',text:'효과가 별로다…'};
assert.deepEqual(orderReviewedBattleEvents([wide,allyEffect,foeEffect,allyHit,foeHit]),[wide,allyHit,allyEffect,foeHit,foeEffect]);
const otherHit={...allyHit,actorBoxId:'other'};
assert.deepEqual(orderReviewedBattleEvents([wide,allyEffect,critical,otherHit,foeHit]),[wide,allyEffect,critical,otherHit,foeHit]);

const spread={kind:'move',moveId:'earthquake',actorBoxId:'hero',side:0,targetSide:1,targetBoxId:'last'};
const spreadEvents=[spread,
 {kind:'damage',moveId:'earthquake',hit:true,actorBoxId:'hero',targetSide:0,targetBoxId:'ally'},
 {kind:'damage',moveId:'earthquake',hit:true,actorBoxId:'hero',targetSide:1,targetBoxId:'first'},
 {kind:'immune',actorBoxId:'hero',targetSide:1,targetBoxId:'last'},
 {kind:'damage',moveId:'earthquake',hit:true,actorBoxId:'hero',targetSide:1,targetBoxId:'first'},
 {kind:'damage',moveId:'earthquake',hit:false,actorBoxId:'hero',targetSide:0,targetBoxId:'hero'},
 {kind:'move',moveId:'flamethrower',actorBoxId:'foe'},
 {kind:'damage',moveId:'earthquake',hit:true,actorBoxId:'hero',targetSide:1,targetBoxId:'other'}];
assert.deepEqual(reviewedAttackTargets(spreadEvents,0),[{side:0,boxId:'ally',immune:false},{side:1,boxId:'first',immune:false},{side:1,boxId:'last',immune:true}]);
assert.equal(reviewedAttackHit(spreadEvents,0,{side:1,boxId:'first'}),true);
assert.equal(reviewedAttackHit(spreadEvents,0,{side:1,boxId:'last'}),false);
assert.equal(reviewedAttackHit(spreadEvents,0,{side:0,boxId:'first'}),false);
assert.equal(reviewedAttackHit([spread,{kind:'miss',actorBoxId:'hero',targetSide:1,targetBoxId:'first'}],0,{side:1,boxId:'first'}),false);
assert.equal(reviewedAttackHit([spread,{kind:'move'},spreadEvents[2]],0,{side:1,boxId:'first'}),false);

assert.deepEqual(reviewedAttackTargets([{...spread,targetBoxId:'fallback'}],0),[{side:1,boxId:'fallback',immune:false}]);
assert.deepEqual(reviewedAttackTargets([move,immune],0),[{side:1,boxId:'ground',immune:true}],'Legacy immune events without actor IDs retain their confirmed immunity');
assert.deepEqual(reviewedAttackTargets([{...spread,targetBoxId:undefined}],0),[]);

const resistedMessage={kind:'effect',text:'효과가 별로다…'};
assert.equal(reviewedBattleMessage(resistedMessage),'효과가 별로인 듯하다...');
assert.equal(resistedMessage.text,'효과가 별로다…');
const singleImmune={kind:'immune',text:'고지에게 효과가 없다!'};
assert.equal(reviewedBattleMessage(singleImmune),'효과가 없다!');
assert.equal(reviewedBattleMessage(singleImmune,true),'고지에게 효과가 없다!');
assert.equal(reviewedBattleMessage({kind:'effect',text:'효과가 굉장했다!'}),'효과가 굉장했다!');
assert.equal(reviewedBattleMessage({kind:'effect',text:'다른 효과가 별로다…'}),'다른 효과가 별로다…');
