import {env} from 'cloudflare:workers';
export const onlineGuard="NOT EXISTS(SELECT 1 FROM matches WHERE (player1=? OR player2=?) AND json_extract(state,'$.phase') IN ('waiting','battle') AND COALESCE(json_extract(state,'$.deadlineAt'),0)>?) AND NOT EXISTS(SELECT 1 FROM battle_queue WHERE user_id=? AND status='waiting' AND created_at>?)";
export const onlineGuardArgs=(id:string)=>[id,id,Date.now(),id,Date.now()-10*60*1000];
export async function requireOffline(id:string){const row=await env.DB!.prepare(`SELECT 1 AS ok WHERE ${onlineGuard}`).bind(...onlineGuardArgs(id)).first();if(!row)throw Error('온라인 대전 또는 매칭을 종료한 뒤 교환·수정할 수 있습니다.');}
