import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu,playDuel,combatView} from '../lib/party-battle.mjs';
import {Battle} from '@pkmn/sim';
import {battleVisuals} from '../lib/full-battle.mjs';

await fs.mkdir('.sites-runtime/tests',{recursive:true});
await build({entryPoints:['components/battle-panel.tsx'],outfile:'.sites-runtime/tests/battle-panel.mjs',bundle:true,format:'esm',platform:'node',external:['react','react/jsx-runtime','lucide-react'],loader:{'.css':'empty'}});
await build({entryPoints:['hooks/use-battle-playback.ts'],outfile:'.sites-runtime/tests/battle-display.mjs',bundle:true,format:'esm',platform:'node',external:['react']});
const {default:BattlePanel}=await import('../.sites-runtime/tests/battle-panel.mjs');
const {battleDisplay,applyBattleEvent}=await import('../.sites-runtime/tests/battle-display.mjs');
const a={...makeMon(7,5),boxId:'squirtle',moves:['물대포']},b={...makeMon(4,5),boxId:'charmander',moves:['할퀴기']};
const before=createCombat([a],[b]);
const after=playDuel(before,[{type:'move',move:'물대포'},{type:'move',move:'할퀴기'}]);
const view=combatView(after,1);
assert.ok(view.events.some(event=>event.kind==='damage'&&event.amount>0));
assert.ok(view.events.some(event=>event.kind==='move'&&event.move==='물대포'));
let display=battleDisplay(view,true);
assert.equal(display.teams[0][0].hp,before.teams[0][0].hp);
assert.equal(display.teams[1][0].hp,before.teams[1][0].hp);
for(const event of view.events){const previous=display;display=applyBattleEvent(display,event);if(event.kind==='move')assert.equal(display,previous,'Move start must not reduce HP before impact');}
assert.equal(display.teams[0][0].hp,view.teams[0][0].hp);
assert.equal(display.teams[1][0].hp,view.teams[1][0].hp);
const html=renderToStaticMarkup(React.createElement(BattlePanel,{battle:view,battleKey:'fixture:1',title:'실제 턴 검증',busy:false,onCommand(){}}));
assert.ok(html.includes('class="battle-screen"'));
assert.ok(!html.includes('<dialog'));
assert.ok(html.includes('/back/4.png'),'Side 1 player must have its own back-facing sprite');
assert.ok(html.includes('/pokemon/7.png'),'Side 1 opponent must use side 0 front sprite');
assert.ok(html.includes('PP'));
const unrevealed=renderToStaticMarkup(React.createElement(BattlePanel,{battle:{...view,log:['아직 재생되지 않은 최종 대사']},battleKey:'fixture:unrevealed',title:'대사 순서',busy:false,onCommand(){}}));
assert.ok(!unrevealed.includes('아직 재생되지 않은 최종 대사'),'The final server log must not be shown ahead of its impact events');

const bench={...makeMon(1,50),boxId:'bench',moves:['튀어오르기']},lead={...makeMon(25,50),boxId:'lead',moves:['튀어오르기']},enemy={...makeMon(7,50),boxId:'enemy',moves:['물대포']};
const switchBefore=createCombat([lead,bench],[enemy]);
const switched=playCpu(switchBefore,{type:'switch',slot:switchBefore.requests[0].switches[0].slot});
let switchView=battleDisplay(combatView(switched),true);
assert.equal(switchView.active[0],switchBefore.requests[0].active);
const switchedEvent=switched.events.find(event=>event.kind==='switch'&&event.side===0);
assert.equal(switchedEvent.boxId,'bench');
for(const event of switched.events)switchView=applyBattleEvent(switchView,event);
assert.equal(switchView.teams[0][switchView.active[0]].boxId,'bench');
assert.equal(switchView.teams[0][switchView.active[0]].hp,switched.teams[0][switched.requests[0].active].hp);

const buff=createCombat([{...makeMon(1,50),boxId:'buff',moves:['칼춤']}],[{...makeMon(7,50),boxId:'splash',moves:['튀어오르기']}]);
const buffed=playDuel(buff,[{type:'move',move:'칼춤'},{type:'move',move:'튀어오르기'}]);
assert.ok(buffed.events.every(event=>event.hit!==true),'Self buffs must never trigger opponent damage flash');
const ended={...view,ended:true,winner:1,events:[],before:undefined,beforeActive:undefined};
const finishedHTML=renderToStaticMarkup(React.createElement(BattlePanel,{battle:ended,battleKey:'finished:1',title:'종료 검증',busy:false,onCommand(){},onContinue(){},continueLabel:'보상으로 가기'}));
assert.ok(finishedHTML.includes('보상으로 가기'));
const protocol=Battle.fromJSON(before.snapshot),firstActor=`p1a: ${protocol.p1.active[0].name}`,secondActor=`p2a: ${protocol.p2.active[0].name}`;
protocol.log=[`|move|${firstActor}|Tackle|${secondActor}`,`|-crit|${secondActor}`,`|-damage|${secondActor}|30/40`,`|-damage|${secondActor}|17/40`,`|-heal|${secondActor}|22/40|[from] item: Leftovers`,`|-miss|${firstActor}|${secondActor}`,`|-immune|${secondActor}`,`|move|${firstActor}|Swords Dance|${firstActor}`,`|-boost|${firstActor}|atk|2`];
const visual=battleVisuals(protocol,0,[[{...a,hp:40,maxHp:40}],[{...b,hp:40,maxHp:40}]]),damage=visual.filter(event=>event.kind==='damage');
assert.deepEqual(damage.map(event=>event.amount),[10,13]);
assert.deepEqual(damage.map(event=>event.hp),[30,17]);
assert.equal(damage[0].critical,true);
assert.equal(visual.find(event=>event.kind==='heal').amount,5);
assert.ok(visual.filter(event=>['immune','miss','heal'].includes(event.kind)).every(event=>!event.hit));
assert.equal(visual.find(event=>event.moveId==='swordsdance').hit,false);
console.log('Inline RPG battle screen, side-1 facing, pre-impact HP, switch timeline and self-buff events: passed');
const classicOwned=renderToStaticMarkup(React.createElement(BattlePanel,{classicLayout:true,classicTools:{zRing:true},classicItems:[{key:'native:normaliumz:hero',name:'노말Z',count:1,owner:'꼬부기'}],battle:view,battleKey:'classic:items',title:'도구 표시',busy:false,onCommand(){}}));assert.match(classicOwned,/Z링/);assert.match(classicOwned,/노말Z/);assert.match(classicOwned,/꼬부기 보유/);
const approvedHP=renderToStaticMarkup(React.createElement(BattlePanel,{approvedV52:true,battle:{...view,events:[],before:undefined,beforeActive:undefined},battleKey:'v52:hp',title:'HP 표시',busy:false,onCommand(){}}));
assert.match(approvedHP,/data-v52="true"/);
assert.match(approvedHP,/class="bs-hp-inside" aria-hidden="true">\d+ \/ \d+<\/span>/);
assert.match(approvedHP,/role="progressbar" aria-label="[^"]+ HP"/);
const v52Commands=renderToStaticMarkup(React.createElement(BattlePanel,{approvedV52:true,battle:{...view,events:[],before:undefined,beforeActive:undefined},battleKey:'v52:commands',title:'命令',busy:false,onCommand(){},onItem(){},onBall(){},onFlee(){}}));
assert.match(v52Commands,/data-v52-single="true"/);
for(const label of ['싸운다','포켓몬','가방','도망','볼 선택','상태 확인']) assert.ok(v52Commands.includes(label),label);
const v52Trainer=renderToStaticMarkup(React.createElement(BattlePanel,{approvedV52:true,battle:{...view,events:[],before:undefined,beforeActive:undefined},battleKey:'v52:trainer',title:'트레이너',busy:false,onCommand(){}}));
assert.match(v52Trainer,/<button disabled=""[^>]*>볼 선택<\/button>/);
assert.match(v52Trainer,/<button data-roving="command" disabled="">도망<\/button>/);

const {v52ControlTop}=await import('../.sites-runtime/tests/battle-panel.mjs');
assert.equal(v52ControlTop(-200,200,.6765),-92,'Two 44px rows stay inside a 200px arena');
assert.equal(v52ControlTop(-80,80,.79),-80,'Very small arenas retain the first touch target');
assert.ok(Math.abs(v52ControlTop(-600,600,.6765)+194.1)<1e-9);

assert.equal(v52ControlTop(-200,200,.4444,184),-184,'Four touch rows fit within the arena');
const {MoveCard}=await import('../.sites-runtime/tests/battle-panel.mjs');
for(const multiplier of [0,.25,.5,1,2,4]){
 const move={id:'test',name:'길이가 긴 테스트 기술',type:'불꽃',typeKey:'fire',pp:7,maxPp:10,category:'special',effectiveness:multiplier};
 const card=renderToStaticMarkup(React.createElement(MoveCard,{m:move,index:0,locked:false,selected:false,move(){},open:false,onDescription(){}}));
 assert.ok(card.includes(`×${multiplier}`),`Actual effectiveness ${multiplier} is shown`);
 assert.ok(card.includes('PP 7/10'));
 assert.ok(card.includes('불꽃타입'));
}
const noPP=renderToStaticMarkup(React.createElement(MoveCard,{m:{id:'empty',name:'PP 없음',typeKey:'normal',pp:0,maxPp:10},index:0,locked:false,selected:false,move(){},open:false,onDescription(){}}));
assert.match(noPP,/<button[^>]*disabled=""/);

const {v52OverlayGeometry}=await import('../.sites-runtime/tests/battle-panel.mjs');
for(const [x,y,width,height] of [[-210,-202.5,360,202.5],[0,-80,120,80]]){
 const g=v52OverlayGeometry(x,y,width,height);
 for(const name of ['move','sheet']){
  assert.ok(g[`--v52-${name}-left`]>=x);
  assert.ok(g[`--v52-${name}-left`]+g[`--v52-${name}-width`]<=x+width+1e-8);
 }
 assert.ok(g['--v52-detail-top']>=y);
 if(height>=48)assert.ok(g['--v52-detail-top']+g['--v52-detail-height']<=y+height+1e-8);
}

const {v52Page}=await import('../.sites-runtime/tests/battle-panel.mjs');
for(const [count,size] of [[0,2],[1,2],[5,2],[4,1],[4,2],[4,4]]){
 const actual=[];const first=v52Page(count,0,size);
 for(let page=0;page<first.pages;page++){const range=v52Page(count,page,size);for(let i=range.start;i<range.end;i++)actual.push(i);}
 assert.deepEqual(actual,Array.from({length:count},(_,i)=>i),'Pagination keeps every move or ball in order');
 assert.equal(v52Page(count,999,size).page,first.pages-1);
}
