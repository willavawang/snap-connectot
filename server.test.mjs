import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const port=18973;
const proc=spawn(process.execPath,['server.mjs'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),SNAP_API_ORIGIN:'',SNAP_API_HOST:'',SNAP_COLLECTION_PATH:'',SNAP_AUTHORIZATION:'',SNAP_GATEWAY_KEY:''},stdio:'ignore'});
async function request(path,method='GET') {
 for(let i=0;i<30;i++){try{return await fetch('http://127.0.0.1:'+port+path,{method})}catch{await new Promise(r=>setTimeout(r,40))}}
 throw Error('Server failed to start');
}
test('unconfigured bridge fails closed',async t=>{
 t.after(()=>proc.kill());
 const health=await request('/health');
 assert.equal(health.status,200);
 const status=await health.json();
 assert.equal(status.configured,false);
 assert.equal(status.connected,false);
 const col=await request('/collection');
 assert.equal(col.status,503);
 assert.match((await col.json()).error,/not configured/);
 assert.equal((await request('/collection','POST')).status,405);
 assert.equal((await request('/missing')).status,404);
});
