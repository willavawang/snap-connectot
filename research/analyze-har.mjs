#!/usr/bin/env node
// Analyze a HAR exported from a browser session of a disposable test account.
// NEVER upload raw HAR files. They may contain passwords, cookies and auth codes.
// This tool outputs only hosts, HTTP methods, status, and sanitized path shapes.
// Usage: node research/analyze-har.mjs ./private-test.har > public-summary.json
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const secretKeys=/token|code|key|auth|secret|password|credential|session|ticket|state|nonce|assertion|signature|jwt|id_token|access_token|refresh_token|email/i;
const sensitiveSegments=/^[A-Za-z0-9_-]{20,}$|^[0-9a-f]{12,}$|@|^\d{7,}$/i;
function safePath(path){
 return path.split('/').map((s,i)=>i===0?'':sensitiveSegments.test(s)?':opaque':decodeURIComponent(s).replace(/[^a-zA-Z0-9_.-]/g,'_').slice(0,48)).join('/').slice(0,200);
}
export function summarizeHar(har){
 if(!Array.isArray(har?.log?.entries))throw Error('Invalid HAR: missing log.entries');
 const result=[];
 for(const item of har.log.entries){
  const raw=item?.request?.url;
  if(typeof raw!=='string')continue;
  let u;try{u=new URL(raw)}catch{continue}
  if(!['https:','http:'].includes(u.protocol))continue;
  const method=String(item.request.method||'').toUpperCase();
  const status=Number(item?.response?.status)||0;
  const params=[...u.searchParams.keys()].filter(k=>!secretKeys.test(k)&&/^[a-z_]{1,24}$/i.test(k)).sort();
  result.push({host:u.hostname.toLowerCase(),method:/^(GET|POST|PUT|PATCH|DELETE|OPTIONS)$/.test(method)?method:'OTHER',path:safePath(u.pathname),queryParameterNames:params,status});
 }
 return {note:'No headers, query values, request/response bodies, cookies, redirects, or timestamps included. Review before sharing.',requests:result};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 if(!process.argv[2]){console.error('Usage: node research/analyze-har.mjs PRIVATE.har');process.exit(2)}
 const har=JSON.parse(readFileSync(process.argv[2],'utf8'));
 process.stdout.write(JSON.stringify(summarizeHar(har),null,2)+'\n');
}
