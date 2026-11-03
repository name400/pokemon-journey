/** Bound requests so a broken connection cannot leave controls busy indefinitely. */
export async function adventureJson(input,init={},timeoutMs=12000,fetcher=fetch){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{const response=await fetcher(input,{...init,signal:controller.signal});const data=await response.json();return {response,data};}
 catch(error){if(controller.signal.aborted)throw new TypeError('Adventure request timed out');throw error;}
 finally{clearTimeout(timer);}
}
