import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
test('production-minified simulator preserves its reference wire format',async()=>{
 const result=await build({entryPoints:[fileURLToPath(new URL('./fixtures/simulator-codec-repro.mjs',import.meta.url))],bundle:true,platform:'node',format:'esm',minify:true,write:false,logLevel:'silent'});
 const directory=await mkdtemp(join(tmpdir(),'pokemon-reference-test-'));
 try{const entry=join(directory,'repro.mjs');await writeFile(entry,result.outputFiles[0].contents);const {stdout}=await promisify(execFile)(process.execPath,[entry],{maxBuffer:1024*1024});assert.match(stdout,/second victory passed/);}
 finally{if(dirname(resolve(directory))!==resolve(tmpdir())||!basename(directory).startsWith('pokemon-reference-test-'))throw Error('Unexpected test directory');await rm(directory,{recursive:true,force:true});}
});
