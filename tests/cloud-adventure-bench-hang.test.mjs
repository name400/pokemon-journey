import test from 'node:test';
import assert from 'node:assert/strict';
import {validBenchHang,benchHangMatches,BENCH_HANG_MS} from '../lib/cloud-adventure/adventure-bench-hang.mjs';
test('bench sessions validate identity, location, party and unknown formats',()=>{
 const session={version:1,startedAt:100,district:'lumiose',x:2,y:6,facing:'up',benchX:2,benchY:5,teamIds:['p1','p2']},world={district:'lumiose',interior:null,x:2,y:6,facing:'up',teamIds:['p1','p2'],zaBenchHangV1:session};assert.equal(BENCH_HANG_MS,10000);assert.equal(validBenchHang(session),true);assert.equal(benchHangMatches(world,{x:2,y:5}),true);assert.equal(benchHangMatches({...world,teamIds:['p2','p1']},{x:2,y:5}),false);assert.equal(benchHangMatches({...world,x:3},{x:2,y:5}),false);assert.equal(validBenchHang({...session,version:2}),false);assert.equal(validBenchHang({...session,teamIds:['p1','p1']}),false);assert.equal(validBenchHang({...session,unknown:true}),false);
});
