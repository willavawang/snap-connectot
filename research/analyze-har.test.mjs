import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeHar} from './analyze-har.mjs';
test('HAR output omits sensitive content and query values',()=>{
 const har={log:{entries:[{request:{url:'https://api.example.org/oauth/callback?code=TOPSECRET&state=HIDDEN&lang=en&access_token=NEVER',method:'GET',headers:[{name:'Authorization',value:'Bearer SECRET'}],postData:{text:'PASSWORD'}},response:{status:302,content:{text:'SENSITIVE'}}}]}};
 const out=JSON.stringify(summarizeHar(har));
 assert.match(out,/api.example.org/);
 assert.match(out,/lang/);
 for(const value of ['TOPSECRET','HIDDEN','NEVER','SECRET','PASSWORD','SENSITIVE','access_token'])assert.ok(!out.includes(value),value);
});
test('opaque URL segments masked',()=>{
 const out=summarizeHar({log:{entries:[{request:{url:'https://example.org/a/eyJhbGciOiJIUzI1NiJ9eyJmb28iOiJiYXIifQ',method:'GET'},response:{status:200}}]}});
 assert.match(out.requests[0].path,/:opaque/);
});
