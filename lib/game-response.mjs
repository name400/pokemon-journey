// Gateways may return HTML when a Worker is terminated before the route's catch.
// Never expose HTML/parser errors or automatically repeat a possibly saved POST.
export async function readGameResponse(response){
 const body=await response.text();let data;
 try{data=JSON.parse(body);}catch{throw Error(response.status>=500?'서버 오류로 응답을 받지 못했습니다. 잠시 후 진행 상태를 다시 확인해 주세요.':'서버 응답을 확인하지 못했습니다. 화면을 다시 불러와 주세요.');}
 if(!response.ok)throw Error(typeof data?.error==='string'?data.error:'요청을 처리하지 못했습니다.');
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('서버 응답을 확인하지 못했습니다. 화면을 다시 불러와 주세요.');
 return data;
}
