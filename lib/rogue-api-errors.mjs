// Do not log request bodies, account identifiers, save contents, messages or stacks.
// Plain Error from the game can be a rule rejection OR an engine failure. Keep
// that ambiguity explicit until the engine has typed domain errors throughout.
export class ClassicRequestError extends Error {
 constructor(code,message,status=409){super(message);this.code=code;this.status=status;}
}
const actions=new Set(['abandon','acceptCapture','ackHatch','ackHatches','bugTutor','buyService','buySpeciesEgg','cancelSelection','capture','drawEggs','escape','evolve','form','initialSwitch','learn','mysteryCancel','mysteryConfirm','mysteryContinue','mysterySelect','next','npcDialogueNext','npcDialogueSkip','prepare','recoverBattle','reduceCost','reroll','resolveEvolution','reward','route','safariAction','selectSlot','setEvolutionPaused','skipReward','start','transferModifier','turn','unlockPassive','unsplice','winstrateContinue']);
const commands=new Set(['move','switch','turn','pass','item']);
const errorNames=new Set(['Error','TypeError','RangeError','ReferenceError','SyntaxError','URIError','EvalError','AbortError']);
export function classicGetFailure(error,context){
 return {status:500,body:{error:'도전을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',code:'INTERNAL_ERROR',requestId:context.requestId},diagnostic:{
  event:'classic_get_failure',requestId:context.requestId,code:'INTERNAL_ERROR',status:500,stage:context.stage,
  errorType:errorNames.has(error?.name)?error.name:'unknown',saveOutcome:'not_attempted',durationMs:Math.max(0,Date.now()-context.startedAt),
 }};
}
export function classicPostFailure(error,context){
 const explicit=error instanceof ClassicRequestError;
 const gameFailure=context.stage==='action'&&error instanceof Error&&error.constructor===Error;
 const status=explicit?error.status:context.stage==='parse'?400:gameFailure?409:500;
 const code=explicit?error.code:context.stage==='parse'?'INVALID_REQUEST':gameFailure?'ACTION_FAILED':'INTERNAL_ERROR';
 const message=explicit||gameFailure?error.message:status===400?'요청 형식을 확인한 뒤 다시 시도하세요.':'서버 오류로 요청을 완료하지 못했습니다. 진행 상태를 다시 확인해 주세요.';
 return {status,body:{error:message,code,requestId:context.requestId},diagnostic:{
  event:'classic_post_failure',requestId:context.requestId,code,status,stage:context.stage,
  action:actions.has(context.action)?context.action:'other',commandType:commands.has(context.commandType)?context.commandType:undefined,
  revision:Number.isSafeInteger(context.revision)?context.revision:undefined,
  storedRevision:Number.isSafeInteger(context.storedRevision)?context.storedRevision:undefined,
  saveOutcome:context.saveOutcome,errorType:explicit?'ClassicRequestError':errorNames.has(error?.name)?error.name:'unknown',
  durationMs:Math.max(0,Date.now()-context.startedAt),
 }};
}
