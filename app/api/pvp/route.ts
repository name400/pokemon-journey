import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { species,makeMon } from '@/lib/game.mjs';
import { resolveDuelTurn } from '@/lib/pvp.mjs';
export const dynamic='force-dynamic';
const db=()=>env.DB!;
const code=()=>Array.from(crypto.getRandomValues(new Uint8Array(8)),x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');
function publicState(row:any,id:string){let s=JSON.parse(row.state);let index=row.player1===id?0:row.player2===id?1:-1;if(index<0)return null;return {code:row.code,revision:row.revision,side:index,players:s.players,phase:s.phase,turn:s.turn,log:s.log,winner:s.winner,pending:!!s.pending[index],opponentReady:!!s.pending[1-index]};}

async function getRow(c:string){return await db().prepare('SELECT * FROM matches WHERE code=?').bind(c).first<any>();}
export async function GET(req:Request){const u=await getChatGPTUser();if(!u)return Response.json({error:'로그인이 필요합니다.'},{status:401});const c=(new URL(req.url).searchParams.get('code')||'').toUpperCase();const row=await getRow(c);if(!row)return Response.json({error:'대전 방을 찾을 수 없습니다.'},{status:404});const view=publicState(row,u.userId);return view?Response.json(view):Response.json({error:'이 방의 참가자가 아닙니다.'},{status:403});}
export async function POST(req:Request){const u=await getChatGPTUser();if(!u)return Response.json({error:'로그인이 필요합니다.'},{status:401});try{const body=await req.json();let c=String(body.code||'').toUpperCase();
 if(body.action==='create'){if(!species.some((s:any)=>s.id===body.species))return Response.json({error:'포켓몬을 선택하세요.'},{status:400});c=code();let state={players:[makeMon(body.species,10),null],pending:[null,null],phase:'waiting',turn:1,log:['상대방을 기다리는 중입니다.'],winner:null};await db().prepare('INSERT INTO matches(code,player1,state,revision,updated_at) VALUES(?,?,?,0,?)').bind(c,u.userId,JSON.stringify(state),Date.now()).run();let row=await getRow(c);return Response.json(publicState(row,u.userId))}
 if(!/^[A-Z2-9]{8}$/.test(c))return Response.json({error:'방 코드를 확인하세요.'},{status:400});
 for(let attempt=0;attempt<5;attempt++){const row=await getRow(c);if(!row)return Response.json({error:'방을 찾을 수 없습니다.'},{status:404});let s=JSON.parse(row.state);let side=row.player1===u.userId?0:row.player2===u.userId?1:-1;let player2=row.player2;
 if(body.action==='join'){if(side>=0)return Response.json(publicState(row,u.userId));if(player2||s.phase!=='waiting')return Response.json({error:'이미 상대가 참가한 방입니다.'},{status:409});if(!species.some((x:any)=>x.id===body.species))return Response.json({error:'포켓몬을 선택하세요.'},{status:400});side=1;player2=u.userId;s.players[1]=makeMon(body.species,10);s.phase='battle';s.log=['대전이 시작되었습니다! 두 플레이어가 기술을 선택하세요.'];}
 else if(body.action==='move'){if(side<0)return Response.json({error:'참가자가 아닙니다.'},{status:403});if(s.phase!=='battle'||s.pending[side])return Response.json({error:'지금은 기술을 선택할 수 없습니다.'},{status:409});if(Number(body.turn)!==s.turn)return Response.json({error:'턴 정보가 변경되었습니다. 다시 선택하세요.'},{status:409});if(!s.players[side].moves.includes(body.move))return Response.json({error:'사용할 수 없는 기술입니다.'},{status:400});s.pending[side]=body.move;if(s.pending[0]&&s.pending[1])resolveDuelTurn(s);}
 else if(body.action==='forfeit'){if(side<0)return Response.json({error:'참가자가 아닙니다.'},{status:403});if(s.phase==='finished')return Response.json(publicState(row,u.userId));s.phase='finished';s.winner=1-side;s.pending=[null,null];s.log=['한 플레이어가 기권했습니다.'];}
 else return Response.json({error:'알 수 없는 요청입니다.'},{status:400});
 const updated=await db().prepare('UPDATE matches SET player2=?,state=?,revision=revision+1,updated_at=? WHERE code=? AND revision=?').bind(player2,JSON.stringify(s),Date.now(),c,row.revision).run();if(updated.meta.changes){return Response.json(publicState(await getRow(c),u.userId));}}
 return Response.json({error:'동시 요청이 발생했습니다. 다시 시도하세요.'},{status:409});}catch{return Response.json({error:'대전 요청을 처리하지 못했습니다.'},{status:500})}}
