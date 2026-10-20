import http from 'node:http';
import {SnapReadClient} from './research/read-client.mjs';
const {SNAP_API_ORIGIN,SNAP_API_HOST,SNAP_COLLECTION_PATH,SNAP_AUTHORIZATION,SNAP_GATEWAY_KEY,PORT='8787'}=process.env;
const ready=[SNAP_API_ORIGIN,SNAP_API_HOST,SNAP_COLLECTION_PATH,SNAP_AUTHORIZATION,SNAP_GATEWAY_KEY].every(Boolean);
const client=ready?new SnapReadClient({baseUrl:SNAP_API_ORIGIN,allowedHost:SNAP_API_HOST}):null;
const send=(res,status,obj)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','access-control-allow-origin':'none'});res.end(JSON.stringify(obj))};
export function handler(req,res){
 if(req.method!=='GET')return send(res,405,{error:'Read-only server'});
 const path=new URL(req.url,'http://localhost').pathname;
 if(path==='/health')return send(res,200,{service:'snap-bridge',configured:ready,connected:false});
 if(path!=='/collection')return send(res,404,{error:'Not found'});
 if(!ready)return send(res,503,{error:'Marvel Snap authorization and endpoint not configured'});
 const supplied=req.headers['x-bridge-key'];
 if(typeof supplied!=='string'||supplied.length!==SNAP_GATEWAY_KEY.length||!timingSafeEqual(supplied,SNAP_GATEWAY_KEY))return send(res,401,{error:'Unauthorized'});
 client.get(SNAP_COLLECTION_PATH,{authorization:SNAP_AUTHORIZATION}).then(data=>send(res,200,{source:'upstream',data})).catch(e=>send(res,502,{error:'Upstream read failed',reason:/^Read failed with HTTP \d+$/.test(e.message)?e.message:'No usable response'}));
}
function timingSafeEqual(a,b){const {timingSafeEqual}=requireCrypto();return timingSafeEqual(Buffer.from(a),Buffer.from(b))}
function requireCrypto(){return cryptoModule}
import * as cryptoModule from 'node:crypto';
if(import.meta.url===new URL('file://'+process.argv[1]).href){http.createServer(handler).listen(Number(PORT),'127.0.0.1',()=>console.log('Snap bridge listening locally on '+PORT+'; configured='+ready))}
