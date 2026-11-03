import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {sameOriginRequest} from '@/lib/request-origin.mjs';
import {encodeGameData,decodeGameData} from '@/lib/game-storage.mjs';
import {applyClassicAction,classicGameView} from '@/lib/rogue-classic-game.mjs';
import {verifiedClassicWin} from '@/lib/classic-records.mjs';
export const dynamic='force-dynamic';
async function read(id:string){const row=await env.DB!.prepare('SELECT data,revision FROM saves WHERE user_id=?').bind(id).first<any>();const data=row?await decodeGameData(row.data):{};data.__classicOwnerSeed=id;return {data,revision:row?.revision||0,exists:!!row};}
export async function GET(req:Request){const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});try{const saved=await read(user.userId);return Response.json({...classicGameView(saved.data,{includeStarters:new URL(req.url).searchParams.get('starters')==='1'}),revision:saved.revision},{headers:{'Cache-Control':'private, no-store'}});}catch(e){return Response.json({error:e instanceof Error?e.message:'도전을 불러오지 못했습니다.'},{status:500});}}
export async function POST(req:Request){if(!sameOriginRequest(req))return Response.json({error:'올바른 사이트에서 다시 요청하세요.'},{status:403});const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});try{
 const payload:any=await req.json(),saved=await read(user.userId);if(payload.revision!==saved.revision)throw Error('다른 화면에서 저장이 변경됐습니다. 다시 불러오세요.');
 const extra=applyClassicAction(saved.data,payload),encoded=await encodeGameData(saved.data),now=Date.now();
 if(!saved.exists)await env.DB!.prepare('INSERT OR IGNORE INTO saves(user_id,data,updated_at,revision) VALUES(?,?,?,0)').bind(user.userId,'{}',now).run();
 const update=env.DB!.prepare('UPDATE saves SET data=?,updated_at=?,revision=revision+1 WHERE user_id=? AND revision=?').bind(encoded,now,user.userId,saved.revision),record=verifiedClassicWin(saved.data.classic);
 const statements=[update];if(record)statements.push(env.DB!.prepare(`INSERT INTO classic_leaderboard(user_id,best_wave,achieved_at,run_id) SELECT ?,?,?,? WHERE changes()=1 ON CONFLICT(user_id) DO UPDATE SET best_wave=excluded.best_wave,achieved_at=excluded.achieved_at,run_id=excluded.run_id WHERE excluded.best_wave>classic_leaderboard.best_wave`).bind(user.userId,record.wave,now,record.runId));
 const result=await env.DB!.batch(statements);if(!result[0].meta.changes)throw Error('다른 화면에서 저장이 변경됐습니다. 다시 불러오세요.');
 return Response.json({...classicGameView(saved.data,{includeStarters:['prepare','reduceCost','cancelSelection','hatchEgg','pullEgg','buySpeciesEgg'].includes(payload.action)}),...extra,revision:saved.revision+1});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'클래식 요청 실패'},{status:409});}}
