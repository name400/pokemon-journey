import {adventureEngineFor} from '@/lib/adventure-engine-selection.mjs';
import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {sameOriginRequest} from '@/lib/request-origin.mjs';
export const dynamic='force-dynamic';
async function selectEngine(userId:string){const row=await env.DB!.prepare('SELECT state FROM worlds WHERE user_id=?').bind(userId).first<any>();if(!row)return 'cloud';const s=JSON.parse(row.state);return adventureEngineFor(s);}
async function route(req:Request,method:'GET'|'POST'){if(method==='POST'&&!sameOriginRequest(req))return Response.json({error:'올바른 사이트에서 다시 요청하세요.'},{status:403});const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});try{const engine=await selectEngine(user.userId);if(method==='GET'&&new URL(req.url).searchParams.get('engineOnly')==='1')return Response.json({engine},{headers:{'Cache-Control':'private, no-store'}});const handler=engine==='cloud'?await import('@/lib/cloud-adventure/route'):await import('@/lib/local-adventure-route');return handler[method](req);}catch(e){return Response.json({error:e instanceof Error?e.message:'탐험을 불러오지 못했습니다.'},{status:500});}}
export async function GET(req:Request){return route(req,'GET');}
export async function POST(req:Request){return route(req,'POST');}
