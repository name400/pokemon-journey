// Gateways may return HTML when a Worker is terminated before the route's catch.
// Never expose HTML/parser errors or automatically repeat a possibly saved POST.
const errorCodes=new Set(['INVALID_REQUEST','REVISION_CONFLICT','SAVE_OR_PICKUP_CONFLICT','ACTION_FAILED','INTERNAL_ERROR']);
const requestIdPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export class GameResponseError extends Error {
 constructor(message,{status,code,requestId}){super(message);this.status=status;if(errorCodes.has(code))this.code=code;if(typeof requestId==='string'&&requestIdPattern.test(requestId))this.requestId=requestId;}
}
export function gameErrorMessage(error,fallback='요청을 처리하지 못했습니다.'){
 const message=error instanceof Error?error.message:fallback;
 return error instanceof GameResponseError&&error.requestId?`${message} (오류 번호: ${error.requestId})`:message;
}
export async function readGameResponse(response){
 const body=await response.text();let data;
 try{data=JSON.parse(body);}catch{throw Error(response.status>=500?'서버 오류로 응답을 받지 못했습니다. 잠시 후 진행 상태를 다시 확인해 주세요.':'서버 응답을 확인하지 못했습니다. 화면을 다시 불러와 주세요.');}
 if(!response.ok)throw new GameResponseError(typeof data?.error==='string'?data.error:'요청을 처리하지 못했습니다.',{status:response.status,code:data?.code,requestId:data?.requestId});
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('서버 응답을 확인하지 못했습니다. 화면을 다시 불러와 주세요.');
 return data;
}
