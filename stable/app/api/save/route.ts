import {decodeGameData} from '@/lib/game-storage.mjs';
// Client-authoritative writes are retired; game progress is mutated only by mode APIs.
import { getChatGPTUser } from '@/app/chatgpt-auth';
import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
export async function GET(){const u=await getChatGPTUser();if(!u)return Response.json({error:'로그인이 필요합니다.'},{status:401});const row=await env.DB!.prepare('SELECT data,revision FROM saves WHERE user_id=?').bind(u.userId).first<any>();return Response.json({data:row?await decodeGameData(row.data):null,revision:row?.revision||0});}
export async function PUT(){return Response.json({error:'게임이 업데이트되었습니다. 페이지를 새로고침하세요.'},{status:410});}
