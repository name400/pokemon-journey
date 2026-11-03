export function adventureError(error,fallback='요청을 처리하지 못했습니다.'){
 if(error instanceof TypeError)return '서버 연결이 끊겼습니다. 연결을 확인하고 다시 시도하세요.';
 if(error instanceof SyntaxError)return '서버 응답을 읽지 못했습니다. 연결을 확인하고 다시 시도하세요.';
 return error instanceof Error&&error.message?error.message:fallback;
}
export function isUncertainRequestError(error){return error instanceof TypeError||error instanceof SyntaxError;}
export function adventureRecoveryMessage(refreshed){
 return refreshed?'연결이 끊겨 저장 상태를 다시 불러왔습니다. 이동 위치나 구매 결과를 확인한 뒤 다시 시도하세요.':'서버에 연결할 수 없어 저장 결과를 확인하지 못했습니다. 연결을 복구한 뒤 다시 불러오세요.';
}
