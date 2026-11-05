import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {sameOriginRequest} from '@/lib/request-origin.mjs';
import {encodeGameData,decodeGameData} from '@/lib/game-storage.mjs';
import {applyClassicAction,classicGameView} from '@/lib/rogue-classic-game.mjs';
import {getRoguePickup} from '@/lib/rogue-pickup-config';
import {bestClearedWave,ensureRogueRanking,rankingUpdate} from '@/lib/rogue-ranking';
import {ClassicRequestError,classicPostFailure} from '@/lib/rogue-api-errors.mjs';
export const dynamic='force-dynamic';
async function read(id:string){const row=await env.DB!.prepare('SELECT data,revision FROM saves WHERE user_id=?').bind(id).first<any>();const data=row?await decodeGameData(row.data):{};data.__classicOwnerSeed=id;return {data,revision:row?.revision||0,exists:!!row};}
export async function GET(req:Request){const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});try{const params=new URL(req.url).searchParams,pickup=await getRoguePickup(env.DB!);if(params.get('pickupOnly')==='1')return Response.json({pickupVersion:pickup.version},{headers:{'Cache-Control':'private, no-store'}});const saved=await read(user.userId);return Response.json({...classicGameView(saved.data,{includeStarters:params.get('starters')==='1'||!!saved.data.classic?.selection,pickupSourceId:pickup.sourceId}),pickupVersion:pickup.version,revision:saved.revision},{headers:{'Cache-Control':'private, no-store'}});}catch(e){console.error('classic GET failure',e instanceof Error?e.stack||e.message:'unknown');return Response.json({error:e instanceof Error?e.message:'도전을 불러오지 못했습니다.'},{status:500});}}
export async function POST(req:Request){
 if(!sameOriginRequest(req))return Response.json({error:'올바른 사이트에서 다시 요청하세요.'},{status:403});
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});
 const context={requestId:crypto.randomUUID(),startedAt:Date.now(),stage:'parse',action:undefined as unknown,commandType:undefined as unknown,revision:undefined as unknown,storedRevision:undefined as unknown,saveOutcome:'not_attempted'};
 try{
  const payload:any=await req.json();
  if(!payload||typeof payload!=='object'||Array.isArray(payload)||typeof payload.action!=='string'||!Number.isSafeInteger(payload.revision)||payload.revision<0)throw new ClassicRequestError('INVALID_REQUEST','요청 형식을 확인한 뒤 다시 시도하세요.',400);
  context.action=payload.action;context.commandType=payload.command?.type;context.revision=payload.revision;
  context.stage='read';const saved=await read(user.userId);context.storedRevision=saved.revision;
  if(payload.revision!==saved.revision)throw new ClassicRequestError('REVISION_CONFLICT','다른 화면에서 저장이 변경됐습니다. 다시 불러오세요.');
  context.stage='pickup';const pickup=await getRoguePickup(env.DB!);
  context.stage='action';const previousBest=bestClearedWave(saved.data),extra=applyClassicAction(saved.data,payload,{pickupSourceId:pickup.sourceId}),bestWave=Math.max(previousBest,bestClearedWave(saved.data)),synced=Number.isInteger(saved.data.classic?.rankingSyncedBest)?saved.data.classic.rankingSyncedBest:0,updateRanking=bestWave>0&&bestWave>synced;
  if(updateRanking)saved.data.classic.rankingSyncedBest=bestWave;
  context.stage='encode';const encoded=await encodeGameData(saved.data),now=Date.now();
  // Build/serialize the response before persistence: a DTO failure must not save
  // an action that the client was told failed. POSTs are never automatically retried.
  context.stage='view';const includeStarters=['prepare','reduceCost','unlockPassive','buySpeciesEgg','cancelSelection','ackHatches'].includes(payload.action)||(payload.action==='ackHatch'&&!(saved.data.classic?.system?.pendingHatches?.length));
  const response=Response.json({...classicGameView(saved.data,{includeStarters,pickupSourceId:pickup.sourceId}),...extra,pickupVersion:pickup.version,revision:saved.revision+1});
  if(!saved.exists){context.stage='create';context.saveOutcome='unknown';await env.DB!.prepare('INSERT OR IGNORE INTO saves(user_id,data,updated_at,revision) VALUES(?,?,?,0)').bind(user.userId,'{}',now).run();}
  context.stage='write';const guardPickup=payload.action==='drawEggs';
  const statement=env.DB!.prepare('UPDATE saves SET data=?,updated_at=?,revision=revision+1 WHERE user_id=? AND revision=?'+(guardPickup?" AND (SELECT COALESCE(MAX(id),0) FROM admin_audit WHERE action='setRoguePickup')=?":''));
  const update=guardPickup?statement.bind(encoded,now,user.userId,saved.revision,pickup.version):statement.bind(encoded,now,user.userId,saved.revision);let result:any;
  if(updateRanking){context.stage='ranking';await ensureRogueRanking(env.DB!);context.stage='write';context.saveOutcome='unknown';[result]=await env.DB!.batch([update,rankingUpdate(env.DB!,user.userId,bestWave,now)]);}else{context.saveOutcome='unknown';result=await update.run();}
  if(!result.meta.changes){context.saveOutcome='rejected';throw new ClassicRequestError(guardPickup?'SAVE_OR_PICKUP_CONFLICT':'REVISION_CONFLICT',guardPickup?'저장 또는 전설 픽업이 변경됐습니다. 다시 확인한 뒤 뽑아 주세요.':'다른 화면에서 저장이 변경됐습니다. 다시 불러오세요.');}
  context.saveOutcome='committed';return response;
 }catch(error){
  const failure=classicPostFailure(error,context);console.error(JSON.stringify(failure.diagnostic));
  return Response.json(failure.body,{status:failure.status,headers:{'Cache-Control':'private, no-store','X-Request-Id':context.requestId}});
 }
}
