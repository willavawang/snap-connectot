#!/usr/bin/env node
/**
 * Passive inspection of PUBLIC webpage JavaScript assets.
 * Does not authenticate, call private APIs, or collect cookies/tokens.
 * Usage: node research/inspect-public-bundles.mjs https://snap.untapped.gg/en/mobile-tracker
 */
const target=process.argv[2];
if(!target) {console.error('Usage: node research/inspect-public-bundles.mjs https://snap.untapped.gg/en/mobile-tracker');process.exit(1)}
const allowed=new Set(['snap.untapped.gg','static.untapped.gg']);
const u=new URL(target);
if(u.protocol!=='https:'||!allowed.has(u.hostname)||u.username||u.password)throw Error('Only approved public Untapped pages');
async function read(url){
 const response=await fetch(url,{redirect:'error',headers:{Accept:'text/html,application/javascript,text/javascript,*/*'}});
 if(!response.ok)throw Error('HTTP '+response.status+' for '+new URL(url).pathname);
 const size=Number(response.headers.get('content-length')||0);
 if(size>3_000_000)throw Error('Asset too large');
 const body=await response.text();if(body.length>3_000_000)throw Error('Asset too large');
 return body;
}
const html=await read(u);
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)].map(m=>new URL(m[1],u));
console.log('Public scripts:',scripts.length);
for(const src of scripts.slice(0,35)){
 if(src.protocol!=='https:'||!allowed.has(src.hostname)){console.log('SKIP cross-domain',src.hostname);continue}
 try{
  const js=await read(src);
  const paths=[...new Set([...js.matchAll(/["'`]((?:\/api\/|\/graphql|\/auth\/|\/oauth\/)[a-zA-Z0-9_\/?=&.%-]{2,160})["'`]/g)].map(m=>m[1]))].slice(0,30);
  // Only print path templates; strip query strings to avoid exposing values.
  console.log(JSON.stringify({asset:src.pathname,bytes:js.length,paths:paths.map(p=>p.split('?')[0])}));
 }catch(e){console.log('ERROR',src.pathname,String(e.message))}
}
